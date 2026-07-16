import express from 'express';
import * as authController from '../controllers/authController.js';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

// Protect routes
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo('user'), reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

export default router;
