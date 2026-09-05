import { asyncHandler } from '../utils/asyncHandler.js';
import { Event } from '../models/index.js';

const ALLOWED_FIELDS = ['title', 'description', 'startDate', 'startTime', 'endDate', 'endTime', 'allDay', 'category', 'color', 'location', 'reminder', 'reminderTime', 'recurring', 'recurringEndDate'];

const sanitizeObject = (body, allowed) => {
  const result = {};
  for (const key of allowed) {
    if (body[key] !== undefined) result[key] = body[key];
  }
  return result;
};

const sanitizeString = (str, maxLen = 500) => {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
};

const sanitizeColor = (color) => {
  if (typeof color !== 'string') return '#6366f1';
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(color) ? color : '#6366f1';
};

export const getEvents = asyncHandler(async (req, res) => {
  const { startDate, endDate, category, search } = req.query;
  const query = { user: req.user.id };

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      query.$or = [
        { startDate: { $gte: start, $lte: end } },
        { endDate: { $gte: start, $lte: end } },
        { startDate: { $lte: start }, endDate: { $gte: end } },
      ];
    }
  } else if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) query.startDate = { $gte: start };
  }

  if (category && typeof category === 'string') query.category = category.slice(0, 50);
  if (search && typeof search === 'string') {
    const searchStr = sanitizeString(search, 100);
    if (searchStr) {
      const escaped = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }
  }

  const events = await Event.find(query).sort({ startDate: 1, startTime: 1 }).limit(500);

  res.status(200).json({ success: true, count: events.length, events });
});

export const getEvent = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }
  const event = await Event.findOne({ _id: req.params.id, user: req.user.id });
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  res.status(200).json({ success: true, event });
});

export const createEvent = asyncHandler(async (req, res) => {
  const cleanBody = sanitizeObject(req.body, ALLOWED_FIELDS);

  if (!cleanBody.title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  cleanBody.title = sanitizeString(cleanBody.title, 100);
  if (cleanBody.description) cleanBody.description = sanitizeString(cleanBody.description, 500);
  if (cleanBody.location) cleanBody.location = sanitizeString(cleanBody.location, 200);
  if (cleanBody.color) cleanBody.color = sanitizeColor(cleanBody.color);

  const event = await Event.create({ ...cleanBody, user: req.user.id });
  res.status(201).json({ success: true, event });
});

export const updateEvent = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }

  let event = await Event.findOne({ _id: req.params.id, user: req.user.id });
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const cleanBody = sanitizeObject(req.body, ALLOWED_FIELDS);
  if (cleanBody.title) cleanBody.title = sanitizeString(cleanBody.title, 100);
  if (cleanBody.description) cleanBody.description = sanitizeString(cleanBody.description, 500);
  if (cleanBody.location) cleanBody.location = sanitizeString(cleanBody.location, 200);
  if (cleanBody.color) cleanBody.color = sanitizeColor(cleanBody.color);

  event = await Event.findByIdAndUpdate(req.params.id, cleanBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, event });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }
  const event = await Event.findOne({ _id: req.params.id, user: req.user.id });
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  await event.deleteOne();
  res.status(200).json({ success: true, message: 'Event deleted successfully' });
});

export const getEventsForMonth = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ success: false, message: 'Invalid year or month' });
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const events = await Event.find({
    user: req.user.id,
    $or: [
      { startDate: { $gte: start, $lte: end } },
      { endDate: { $gte: start, $lte: end } },
      { startDate: { $lte: start }, endDate: { $gte: end } },
    ],
  }).sort({ startDate: 1, startTime: 1 });

  res.status(200).json({ success: true, count: events.length, events });
});
