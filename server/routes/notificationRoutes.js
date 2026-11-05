import express from 'express';
import * as authController from '../controllers/authController.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

router.use(authController.protect);

router.route('/my-notifications').get(notificationController.getMyNotifications);

router
  .route('/my-notifications/read-all')
  .patch(notificationController.markAllNotificationsRead);

router
  .route('/my-notifications/:id/read')
  .patch(notificationController.markNotificationRead);

export default router;
