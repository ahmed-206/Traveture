import mongoose from 'mongoose';
import Booking, { NO_POPULATE } from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import { SEAT_HOLDING_STATUSES } from '../utils/bookingStateMachine.js';
import Availability from '../models/availabilityModel.js';
import { runInTransaction } from '../utils/transaction.js';

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



export const cancelBooking = async ({ bookingId, userId = null }) => {
  const query = { _id: bookingId };
  if (userId) query.user = userId;

  const booking = await Booking.findOne(query);
  if (!booking) throw new AppError('No booking found with that ID', 404);

  if (booking.status === 'cancelled') {
    throw new AppError('This booking is already cancelled', 400);
  }
  if (booking.status === 'completed') {
    throw new AppError('Cannot cancel a completed booking', 400);
  }

  booking.status = 'cancelled';
  await booking.save();
  return booking;
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
    throw new AppError(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      400,
    );
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

  const booking = await Booking.findByIdAndUpdate(bookingId, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!booking) {
    throw new AppError('No booking found with that ID', 404);
  }

  return booking;
};
