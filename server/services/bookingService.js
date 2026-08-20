import mongoose from 'mongoose';
import Booking from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';


const VALID_STATUSES = Booking.schema.path('status').options.enum;
const VALID_PAYMENT_STATUSES = Booking.schema.path('paymentStatus').options.enum;
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
        status: { $in: ['pending', 'confirmed'] },
      },
    },
    { $group: { _id: null, totalGuests: { $sum: '$guests' } } },
  ]).session(session);

  return result.length > 0 ? result[0].totalGuests : 0;
};

export const createBooking = async ({ userId, tourId, guests, startDate }) => {
  if (!Number.isInteger(guests) || guests < 1) {
    throw new AppError('Guests must be a positive integer', 400);
  }

  const session = await mongoose.startSession();
  try {
    let booking = null;
    await session.withTransaction(async () => {
      const tour = await Tour.findById(tourId).session(session);
      if (!tour) throw new AppError('Tour not found', 404);

      const isValidDate = tour.startDates.some(
        (d) => d.getTime() === new Date(startDate).getTime(),
      );
      if (!isValidDate) {
        throw new AppError('Invalid start date for this tour', 400);
      }

      const bookedGuests = await getBookedGuests(tour._id, startDate, session);
      const availableSpots = tour.maxGroupSize - bookedGuests;

      if (guests > availableSpots) {
        throw new AppError(
          `Only ${availableSpots} spot(s) available out of ${tour.maxGroupSize}. You requested ${guests}.`,
          400,
        );
      }

      const price = tour.price * guests;
      const created = await Booking.create(
        [
          {
            user: userId,
            tour: tourId,
            guests,
            price,
            startDate,
            status: 'pending',
            paymentStatus: 'pending',
          },
        ],
        { session },
      );
      booking = created[0];
    });

    return booking;
  } finally {
    await session.endSession();
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