import { asyncHandler } from '../utils/asyncHandler.js';
import { Notification } from '../models/index.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, limit = 50 } = req.query;
  
  const query = { user: req.user.id };
  if (unreadOnly === 'true') query.read = false;

const limitVal = parseInt(req.query.limit) || 50;

   const notifications = await Notification.find(query)
     .sort({ createdAt: -1 })
     .limit(limitVal);

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.status(200).json({
    success: true,
    notification
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user.id,
    read: false
  });

  res.status(200).json({
    success: true,
    count
  });
});