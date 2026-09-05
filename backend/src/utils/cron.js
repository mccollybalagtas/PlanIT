import cron from 'node-cron';
import { Task, Event, Notification } from '../models/index.js';

const createNotification = async (userId, type, title, message, relatedId, relatedModel) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      scheduledFor: new Date(),
      sentAt: new Date()
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

const checkTaskReminders = async () => {
  const now = new Date();
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

  const tasks = await Task.find({
    completed: false,
    reminder: true,
    dueDate: { $lte: fifteenMinutesFromNow, $gte: now }
  }).populate('user', 'name notificationsEnabled reminderTime');

  for (const task of tasks) {
    if (!task.user?.notificationsEnabled) continue;

    const reminderTime = task.reminderTime || task.user?.reminderTime || 15;
    const reminderDate = new Date(task.dueDate.getTime() - reminderTime * 60 * 1000);

    if (now >= reminderDate && now <= fifteenMinutesFromNow) {
      const existingNotification = await Notification.findOne({
        user: task.user._id,
        relatedId: task._id,
        relatedModel: 'Task',
        type: 'task_reminder',
        scheduledFor: { $gte: reminderDate, $lte: now }
      });

      if (!existingNotification) {
        await createNotification(
          task.user._id,
          'task_reminder',
          'Task Reminder',
          `"${task.title}" is due ${reminderTime === 0 ? 'now' : `in ${reminderTime} minutes`}`,
          task._id,
          'Task'
        );
      }
    }
  }

  const overdueTasks = await Task.find({
    completed: false,
    dueDate: { $lt: now }
  }).populate('user', 'name notificationsEnabled');

  for (const task of overdueTasks) {
    if (!task.user?.notificationsEnabled) continue;

    const existingNotification = await Notification.findOne({
      user: task.user._id,
      relatedId: task._id,
      relatedModel: 'Task',
      type: 'task_overdue'
    });

    if (!existingNotification) {
      await createNotification(
        task.user._id,
        'task_overdue',
        'Task Overdue',
        `"${task.title}" was due on ${task.dueDate.toLocaleDateString()}`,
        task._id,
        'Task'
      );
    }
  }
};

const checkEventReminders = async () => {
  const now = new Date();
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

  const events = await Event.find({
    reminder: true,
    startDate: { $lte: fifteenMinutesFromNow, $gte: now }
  }).populate('user', 'name notificationsEnabled reminderTime');

  for (const event of events) {
    if (!event.user?.notificationsEnabled) continue;

    const reminderTime = event.reminderTime || event.user?.reminderTime || 15;
    const reminderDate = new Date(event.startDate.getTime() - reminderTime * 60 * 1000);

    if (now >= reminderDate && now <= fifteenMinutesFromNow) {
      const existingNotification = await Notification.findOne({
        user: event.user._id,
        relatedId: event._id,
        relatedModel: 'Event',
        type: 'event_reminder',
        scheduledFor: { $gte: reminderDate, $lte: now }
      });

      if (!existingNotification) {
        await createNotification(
          event.user._id,
          'event_reminder',
          'Event Reminder',
          `"${event.title}" starts ${reminderTime === 0 ? 'now' : `in ${reminderTime} minutes`}`,
          event._id,
          'Event'
        );
      }
    }
  }

  const startingEvents = await Event.find({
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).populate('user', 'name notificationsEnabled');

  for (const event of startingEvents) {
    if (!event.user?.notificationsEnabled) continue;

    const existingNotification = await Notification.findOne({
      user: event.user._id,
      relatedId: event._id,
      relatedModel: 'Event',
      type: 'event_starting',
      scheduledFor: { $gte: new Date(now.getTime() - 5 * 60 * 1000), $lte: now }
    });

    if (!existingNotification) {
      await createNotification(
        event.user._id,
        'event_starting',
        'Event Starting Now',
        `"${event.title}" has started`,
        event._id,
        'Event'
      );
    }
  }
};

export const startCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    try {
      await Promise.all([
        checkTaskReminders(),
        checkEventReminders()
      ]);
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });

  console.log('Cron jobs started - checking reminders every minute');
};

export const stopCronJobs = () => {
  cron.getTasks().forEach(task => task.stop());
  console.log('Cron jobs stopped');
};