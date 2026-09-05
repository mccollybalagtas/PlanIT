import { asyncHandler } from '../utils/asyncHandler.js';
import { Goal } from '../models/index.js';

const ALLOWED_FIELDS = ['title', 'description', 'targetDate', 'status', 'priority', 'category', 'progress', 'tags', 'subtasks'];

const sanitizeObject = (body, allowed) => {
  const result = {};
  for (const key of allowed) {
    if (body[key] !== undefined) result[key] = body[key];
  }
  return result;
};

const sanitizeString = (str, maxLen = 100) => {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
};

export const getGoals = asyncHandler(async (req, res) => {
  const { status, category, priority, search } = req.query;
  const query = { user: req.user.id };

  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;

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

  const goals = await Goal.find(query).sort({ targetDate: 1, createdAt: -1 }).limit(500);
  res.status(200).json({ success: true, count: goals.length, goals });
});

export const getGoal = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid goal ID' });
  }
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
  if (!goal) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
  }
  res.status(200).json({ success: true, goal });
});

export const createGoal = asyncHandler(async (req, res) => {
  const cleanBody = sanitizeObject(req.body, ALLOWED_FIELDS);
  if (!cleanBody.title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  cleanBody.title = sanitizeString(cleanBody.title, 100);
  if (cleanBody.description) cleanBody.description = sanitizeString(cleanBody.description, 500);
  if (cleanBody.tags && Array.isArray(cleanBody.tags)) {
    cleanBody.tags = cleanBody.tags.map(t => sanitizeString(t, 30)).filter(Boolean).slice(0, 10);
  }
  if (cleanBody.subtasks && Array.isArray(cleanBody.subtasks)) {
    cleanBody.subtasks = cleanBody.subtasks.map(st => ({
      title: sanitizeString(st.title, 100),
      completed: false
    })).slice(0, 20);
  }

  const goal = await Goal.create({ ...cleanBody, user: req.user.id });
  res.status(201).json({ success: true, goal });
});

export const updateGoal = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid goal ID' });
  }
  let goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
  if (!goal) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
  }

  const cleanBody = sanitizeObject(req.body, ALLOWED_FIELDS);
  if (cleanBody.title) cleanBody.title = sanitizeString(cleanBody.title, 100);
  if (cleanBody.description) cleanBody.description = sanitizeString(cleanBody.description, 500);

  if (cleanBody.completed === true) {
    cleanBody.status = 'completed';
    cleanBody.progress = 100;
  }

  goal = await Goal.findByIdAndUpdate(req.params.id, cleanBody, { new: true, runValidators: true });
  res.status(200).json({ success: true, goal });
});

export const deleteGoal = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid goal ID' });
  }
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
  if (!goal) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
  }
  await goal.deleteOne();
  res.status(200).json({ success: true, message: 'Goal deleted successfully' });
});

export const getGoalStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const total = await Goal.countDocuments({ user: userId });
  const completed = await Goal.countDocuments({ user: userId, status: 'completed' });
  const inProgress = await Goal.countDocuments({ user: userId, status: 'in-progress' });
  const notStarted = await Goal.countDocuments({ user: userId, status: 'not-started' });
  const overdue = await Goal.countDocuments({
    user: userId,
    status: { $ne: 'completed' },
    targetDate: { $lt: new Date() }
  });

  const byCategory = await Goal.aggregate([
    { $match: { user: req.user.id } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    stats: { total, completed, inProgress, notStarted, overdue, byCategory },
  });
});
