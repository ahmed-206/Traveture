import mongoose from 'mongoose';
import Booking, { NO_POPULATE } from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import { assertBookingTransition, assertPaymentTransition, holdsSeats, isFinalBookingStatus, SEAT_HOLDING_STATUSES, validateBookingChange } from '../utils/bookingStateMachine.js';
import Availability from '../models/availabilityModel.js';
import { runInTransaction } from '../utils/transaction.js';
import { planCancellationRefund, processRefundRequest, queueRefund } from './refundService.js';
import { expireCheckoutSession } from '../utils/stripe.js';

const VALID_STATUSES = Booking.schema.path('status').options.enum;
const VALID_PAYMENT_STATUSES =
  Booking.schema.path('paymentStatus').options.enum;
const ADMIN_ALLOWED_FIELDS = ['status', 'paymentStatus'];

const filterBody = (body, ...allowedFields) => {
  const filtered = {};
  Object.keys(body).forEach((key) => {
    if (allowedFields.includes(key)) filtered[key] = body[key];
  });
  return filtered;
};

const releaseSeats = async ({ tourId, startDate, guests, session }) => {
  const result = await Availability.updateOne(
    { tour: tourId, startDate, bookedGuests: { $gte: guests } },
    { $inc: { bookedGuests: -guests } },
    { session },
  );
  if (result.modifiedCount !== 1) {
    console.error(
      `[Availability] Could not release ${guests} seat(s) for tour ${tourId} @ ${startDate.toISOString()} - counter drift, reconcile needed`,
    );
  }
};
export const transitionBooking = async ({
  bookingId,
  from,
  status,
  set = {},
  where = {},
  session,
}) => {
  const allowedFrom = [].concat(from);
  allowedFrom.forEach((f) => assertBookingTransition(f, status));

  const before = await Booking.findOneAndUpdate(
    { _id: bookingId, status: { $in: allowedFrom }, ...where },
    { $set: { ...set, status } },
    { new: false, session, ...NO_POPULATE },
  );
  if (!before) return null;

  if (set.paymentStatus) assertPaymentTransition(before.paymentStatus, set.paymentStatus);

  if (holdsSeats(before.status) && !holdsSeats(status)) {
    await releaseSeats({
      tourId: before.tour,
      startDate: before.startDate,
      guests: before.guests,
      session,
    });
  }
  return before;
};

export const getBookedGuests = async (tourId, startDate, session = null) => {
  const result = await Booking.aggregate([
    {
      $match: {
        tour: new mongoose.Types.ObjectId(tourId),
        startDate: new Date(startDate),
        status: { $in: SEAT_HOLDING_STATUSES },
      },
    },
    { $group: { _id: null, totalGuests: { $sum: '$guests' } } },
  ]).session(session);

  return result.length > 0 ? result[0].totalGuests : 0;
};

const ensureAvailabilitySlot = async (tourId, startDate) => {
  const exists = await Availability.exists({ tour: tourId, startDate });
  if (exists) return;

  const current = await getBookedGuests(tourId, startDate); 
  try {
    await Availability.updateOne(
      { tour: tourId, startDate },
      { $setOnInsert: { bookedGuests: current } },
      { upsert: true },
    );
  } catch (err) {
    if (err.code !== 11000) throw err; 
  }
};

/** Condition + increment in ONE atomic operation on the shared slot document. */
const reserveSeats = async ({ tour, startDate, guests, session }) => {
  const slot = await Availability.findOneAndUpdate(
    {
      tour: tour._id,
      startDate,
      bookedGuests: { $lte: tour.maxGroupSize - guests },
    },
    { $inc: { bookedGuests: guests } },
    { new: true, session },
  );

  if (!slot) {
    const current = await Availability.findOne({ tour: tour._id, startDate }).session(session);
    const available = Math.max(0, tour.maxGroupSize - (current?.bookedGuests ?? 0));
    throw new AppError(
      `Only ${available} spot(s) available out of ${tour.maxGroupSize}. You requested ${guests}.`,
      400,
    );
  }
};


const findPendingBooking = (userId, tourId, startDate) =>
  Booking.findOne({ user: userId, tour: tourId, startDate, status: 'pending' }).setOptions(
    NO_POPULATE,
  );


const resolveExistingPending = (existing, guests) => {
  if (existing.guests !== guests) {
    throw new AppError(
      'You already have a pending booking for this tour and date with a different number of guests. Complete or cancel it first.',
      409,
    );
  }
  return existing;
};


export const createBooking = async ({ userId, tourId, guests, startDate }) => {
  if (!Number.isInteger(guests) || guests < 1) {
    throw new AppError('Guests must be a positive integer', 400);
  }
  if (!mongoose.Types.ObjectId.isValid(tourId)) {
    throw new AppError('Invalid tour id', 400);
  }
  const parsedStartDate = new Date(startDate);
  if (!startDate || isNaN(parsedStartDate.getTime())) {
    throw new AppError('A valid start date is required', 400);
  }


  const existing = await findPendingBooking(userId, tourId, parsedStartDate);
  if (existing) return resolveExistingPending(existing, guests);

 
  const tourPreview = await Tour.findById(tourId).select('startDates');
  if (!tourPreview) throw new AppError('Tour not found', 404);
  
  const isValidDate = tourPreview.startDates.some(
    (d) => d.getTime() === parsedStartDate.getTime(),
  );
  if (!isValidDate) throw new AppError('Invalid start date for this tour', 400);

  await ensureAvailabilitySlot(tourPreview._id, parsedStartDate);

  try {
    return await runInTransaction(async (session) => {
     
      const tour = await Tour.findById(tourId).session(session);
      if (!tour) throw new AppError('Tour not found', 404);

      await reserveSeats({ tour, startDate: parsedStartDate, guests, session });

      const [created] = await Booking.create(
        [
          {
            user: userId,
            tour: tourId,
            guests,
            price: Math.round(tour.price * guests * 100) / 100,
            startDate: parsedStartDate,
            status: 'pending',
            paymentStatus: 'pending',
          },
        ],
        { session },
      );
      return created;
    });
  } catch (err) {
  
    if (err.code === 11000) {
      const concurrent = await findPendingBooking(userId, tourId, parsedStartDate);
      if (concurrent) return resolveExistingPending(concurrent, guests);
    }
    throw err;
  }
};



export const cancelBooking = async ({
  bookingId,
  userId = null,
  actor = 'user',
  reason = null,
}) => {
  const query = { _id: bookingId };
  if (userId) query.user = userId;

  const booking = await Booking.findOne(query).setOptions(NO_POPULATE);
  if (!booking) throw new AppError('No booking found with that ID', 404);

  if (booking.status === 'cancelled') {
    throw new AppError('This booking is already cancelled', 400);
  }
  if (booking.status === 'completed') {
    throw new AppError('Cannot cancel a completed booking', 400);
  }

  const wasPending = booking.status === 'pending';
  let refundPlan = null;

  if (wasPending) {
    if (booking.stripeSessionId) {
      const result = await expireCheckoutSession(booking.stripeSessionId);
      if (result === 'complete') {
        throw new AppError(
          'Payment for this booking was just completed. Please wait a moment for confirmation, then cancel it again.',
          409,
        );
      }
    }
  } else {
    refundPlan = planCancellationRefund({ booking, actor });
  }

  const refundRequest = await runInTransaction(async (session) => {
    const before = await transitionBooking({
      bookingId: booking._id,
      from: booking.status,
      status: 'cancelled',
      where: { paymentStatus: wasPending ? 'pending' : 'paid' },
      set: {
        cancelledAt: new Date(),
        cancelledBy: actor,
        cancellationReason: reason,
        ...(wasPending ? { paymentStatus: 'failed' } : {}),
      },
      session,
    });
    if (!before) {
      throw new AppError('Booking was modified by another request. Please retry.', 409);
    }

    if (refundPlan && refundPlan.amountCents > 0) {
      if (!refundPlan.paymentIntentId) {
        console.warn(`[Cancel] Booking ${booking._id} has no Stripe payment: manual refund needed`);
        return null;
      }
      return queueRefund(
        {
          bookingId: booking._id,
          paymentIntentId: refundPlan.paymentIntentId,
          amountCents: refundPlan.amountCents,
          reason: 'booking_cancelled',
          isBookingPayment: true,
        },
        session,
      );
    }
    return null;
  });

  if (refundRequest) await processRefundRequest(refundRequest._id); // never throws

  return Booking.findById(booking._id);
};


export const updateBookingService = async (bookingId, bodyData) => {
  const filteredBody = filterBody(bodyData, ...ADMIN_ALLOWED_FIELDS);
  if (Object.keys(filteredBody).length === 0) {
    throw new AppError(
      `Only these fields can be updated: ${ADMIN_ALLOWED_FIELDS.join(', ')}`,
      400,
    );
  }

  if (filteredBody.status && !VALID_STATUSES.includes(filteredBody.status)) {
    throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }
  if (
    filteredBody.paymentStatus &&
    !VALID_PAYMENT_STATUSES.includes(filteredBody.paymentStatus)
  ) {
    throw new AppError(
      `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`,
      400,
    );
  }
  if (filteredBody.paymentStatus === 'refunded') {
    throw new AppError('"refunded" is set automatically when a refund succeeds', 400);
  }

  const current = await Booking.findById(bookingId).setOptions(NO_POPULATE);
  if (!current) throw new AppError('No booking found with that ID', 404);

  if (isFinalBookingStatus(current.status)) {
    throw new AppError(`A ${current.status} booking can no longer be modified`, 400);
  }

  // Cancelling is not a field edit: it releases seats, closes the Stripe session and refunds.
  if (filteredBody.status === 'cancelled') {
    if (filteredBody.paymentStatus) {
      throw new AppError('Do not send paymentStatus together with status "cancelled"', 400);
    }
    return cancelBooking({ bookingId, actor: 'admin', reason: 'admin_cancelled' });
  }

  validateBookingChange(current, filteredBody);

  // Guard on the state we validated against, so a concurrent change can't slip through
  const updated = await Booking.findOneAndUpdate(
    { _id: bookingId, status: current.status, paymentStatus: current.paymentStatus },
    { $set: filteredBody },
    { new: true, runValidators: true },
  );
  if (!updated) {
    throw new AppError('Booking was modified by another request. Please retry.', 409);
  }
  return updated;
};

export const expireStalePendingBookings = async ({ olderThanMinutes = 65, limit = 100 } = {}) => {
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
  const stale = await Booking.find({ status: 'pending', createdAt: { $lt: cutoff } })
    .setOptions(NO_POPULATE)
    .limit(limit);

  let cancelled = 0;
  for (const b of stale) {
    try {
      await cancelBooking({ bookingId: b._id, actor: 'system', reason: 'stale_pending' });
      cancelled += 1;
    } catch (err) {
      // 409 = paid/modified in the meantime -> leave it alone
      if (err.statusCode !== 409) console.error(`[Sweeper] ${b._id}: ${err.message}`);
    }
  }
  return cancelled;
};