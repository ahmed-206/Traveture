import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';
import AppError from '../utils/appError.js';
import Notification from '../models/notifications/notificationModel.js';


export const getMyNotifications = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ occurredAt: -1, _id: -1 })
      .limit(50)
      .lean(),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  sendResponse(res, 200, {
    data: notifications,
    results: notifications.length,
    unreadCount,
  });
});


export const markNotificationRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true },
  );

  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }

  sendResponse(res, 200, { data: notification });
});


export const markAllNotificationsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );

  sendResponse(res, 200, { message: 'All notifications marked as read' });
});
