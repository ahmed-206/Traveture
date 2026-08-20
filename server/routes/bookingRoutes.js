import express from 'express';
import * as authController from '../controllers/authController.js';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.use(authController.protect);

// User routes
router.route('/my-bookings').get(bookingController.getMyBookings);

router
  .route('/my-bookings/:id')
  .get(bookingController.getMyBooking)
  .patch(bookingController.cancelMyBooking);

router
  .route('/')
  .post(authController.restrictTo('user'), bookingController.createBooking);

// Admin routes
router.use(authController.restrictTo('admin'));
router.route('/').get(bookingController.getAllBookings);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking);

router.route('/:id/cancel').patch(bookingController.cancelBooking);

export default router;
