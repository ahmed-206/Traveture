import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';
import * as bookingService from '../services/bookingService.js';
import Booking from '../models/bookingModel.js';
import AppError from '../utils/appError.js';
import sendResponse from '../utils/sendResponse.js';
import APIFeatures from '../utils/apiFeatures.js';




// user
export const createBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.createBooking({
    userId: req.user.id,
    tourId: req.body.tourId,
    guests: req.body.guests,
    startDate: req.body.startDate,
  });
  sendResponse(res, 201, {
    message: 'Booking created successfully',
    data: booking,
  });
});

export const getMyBookings = catchAsync(async (req, res) => {
  const countFeatures = new APIFeatures(
    Booking.find({ user: req.user.id }),
    req.query,
  ).filter();
  const totalCount = await Booking.countDocuments(
    countFeatures.query.getFilter(),
  );

  const features = new APIFeatures(
    Booking.find({ user: req.user.id }),
    req.query,
  )
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const bookings = await features.query;
  sendResponse(res, 200, {
    data: bookings,
    results: bookings.length,
    totalCount,
  });
});

export const getMyBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }
  sendResponse(res, 200, { data: booking });
});

export const cancelMyBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.cancelBooking({
    bookingId: req.params.id,
    userId: req.user.id,
  });
  sendResponse(res, 200, {
    message: 'Booking cancelled successfully',
    data: booking,
  });
});

// admin
export const getAllBookings = factory.getAll(Booking);
export const getBooking = factory.getOne(Booking);

export const updateBooking = catchAsync(async (req, res, next) => {
  const booking = await bookingService.updateBookingService(req.params.id, req.body);
  sendResponse(res, 200, { data: booking });
});

export const cancelBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.cancelBooking({
    bookingId: req.params.id,
  });
  sendResponse(res, 200, {
    message: 'Booking cancelled successfully',
    data: booking,
  });
});
