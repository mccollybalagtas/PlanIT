import { asyncHandler } from '../utils/asyncHandler.js';
import { Task } from '../models/index.js';

const ALLOWED_FIELDS = ['title', 'description', 'completed', 'priority', 'category', 'dueDate', 'dueTime', 'reminder', 'reminderTime', 'tags', 'completedAt', 'order'];

const sanitizeObject = (body, allowed) => {
  const result = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      result[key] = body[key];
    }
  }
  return result;
};

const sanitizeString = (str, maxLen = 500) => {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
};

export const getTasks = asyncHandler(async (req, res) => {
  const { completed, category, priority, dueDate, search, sort } = req.query;

  const query = { user: req.user.id };

  if (completed !== undefined) query.completed = completed === 'true';
  if (category && typeof category === 'string') query.category = category.slice(0, 50);
  if (priority && typeof priority === 'string') query.priority = priority.slice(0, 20);
  if (dueDate) {
    const date = new Date(dueDate);
    if (!isNaN(date.getTime())) {
      query.dueDate = { $lte: date };
    }
  }
  if (search && typeof search === 'string') {
    const searchStr = sanitizeString(search, 100);
    if (searchStr) {
      const escaped = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } }
      ];
    }
  }

  const allowedSorts = ['priority', 'dueDate', 'createdAt', 'order'];
  const sortField = allowedSorts.includes(sort) ? sort : 'order';
  let sortOption = { order: 1, createdAt: -1 };
  if (sortField === 'priority') sortOption = { priority: -1, order: 1 };
  else if (sortField === 'dueDate') sortOption = { dueDate: 1, order: 1 };
  else if (sortField === 'createdAt') sortOption = { createdAt: -1 };

  const tasks = await Task.find(query).sort(sortOption).limit(500);

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks
  });
});

export const getTask = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid task ID' });
  }

  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  res.status(200).json({ success: true, task });
});

export const createTask = asyncHandler(async (req, res) => {
  const cleanBody = sanitizeObject(req.body, ALLOWED_FIELDS);

  if (!cleanBody.title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  cleanBody.title = sanitizeString(cleanBody.title, 100);
  if (cleanBody.description) cleanBody.description = sanitizeString(cleanBody.description, 500);
  if (cleanBody.tags && Array.isArray(cleanBody.tags)) {
    cleanBody.tags = cleanBody.tags.map(t => sanitizeString(t, 30)).filter(Boolean).slice(0, 10);
  }

  const taskData = { ...cleanBody, user: req.user.id };
  const lastTask = await Task.findOne({ user: req.user.id }).sort({ order: -1 });
  taskData.order = lastTask ? lastTask.order + 1 : 0;

  const task = await Task.create(taskData);

  res.status(201).json({ success: true, task });
});

export const updateTask = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid task ID' });
  }

  let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const cleanBody = sanitizeObject(req.body, ALLOWED_FIELDS);
  if (cleanBody.title) cleanBody.title = sanitizeString(cleanBody.title, 100);
  if (cleanBody.description) cleanBody.description = sanitizeString(cleanBody.description, 500);

  if (cleanBody.completed === true && !task.completed) {
    cleanBody.completedAt = new Date();
  } else if (cleanBody.completed === false && task.completed) {
    cleanBody.completedAt = null;
  }

  task = await Task.findByIdAndUpdate(req.params.id, cleanBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid task ID' });
  }

  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  await task.deleteOne();

  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

export const reorderTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length > 100) {
    return res.status(400).json({ success: false, message: 'Invalid tasks array' });
  }

  const bulkOps = tasks.slice(0, 100).map((task, index) => ({
    updateOne: {
      filter: { _id: String(task.id).match(/^[0-9a-fA-F]{24}$/) ? task.id : null, user: req.user.id },
      update: { order: index },
    },
  })).filter(op => op.updateOne.filter._id);

  if (bulkOps.length > 0) {
    await Task.bulkWrite(bulkOps);
  }

  res.status(200).json({ success: true, message: 'Tasks reordered successfully' });
});

export const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const total = await Task.countDocuments({ user: userId });
  const completed = await Task.countDocuments({ user: userId, completed: true });
  const pending = total - completed;
  const overdue = await Task.countDocuments({
    user: userId,
    completed: false,
    dueDate: { $lt: new Date() },
  });

  const byPriority = await Task.aggregate([
    { $match: { user: req.user.id } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  const byCategory = await Task.aggregate([
    { $match: { user: req.user.id } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    stats: { total, completed, pending, overdue, byPriority, byCategory },
  });
});
