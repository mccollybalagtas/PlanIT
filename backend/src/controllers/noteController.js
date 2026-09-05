import { asyncHandler } from '../utils/asyncHandler.js';
import { Note } from '../models/index.js';

const ALLOWED_FIELDS = ['title', 'content', 'category', 'tags', 'isPinned', 'isArchived'];

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

export const getNotes = asyncHandler(async (req, res) => {
  const { category, search, pinned } = req.query;
  const query = { user: req.user.id };

  if (category && typeof category === 'string') query.category = category;
  if (pinned !== undefined) query.isPinned = pinned === 'true';

  if (search && typeof search === 'string') {
    const searchStr = sanitizeString(search, 100);
    if (searchStr) {
      const escaped = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { content: { $regex: escaped, $options: 'i' } }
      ];
    }
  }

  const notes = await Note.find(query).sort({ isPinned: -1, createdAt: -1 }).limit(500);
  res.status(200).json({ success: true, count: notes.length, notes });
});

export const getNote = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID' });
  }
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  res.status(200).json({ success: true, note });
});

export const createNote = asyncHandler(async (req, res) => {
  const cleanBody = sanitizeObject(req.body, ALLOWED_FIELDS);
  if (!cleanBody.content) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }
  cleanBody.content = sanitizeString(cleanBody.content, 50000);
  if (cleanBody.title) cleanBody.title = sanitizeString(cleanBody.title, 200);
  if (cleanBody.tags && Array.isArray(cleanBody.tags)) {
    cleanBody.tags = cleanBody.tags.map(t => sanitizeString(t, 30)).filter(Boolean).slice(0, 10);
  }

  const note = await Note.create({ ...cleanBody, user: req.user.id });
  res.status(201).json({ success: true, note });
});

export const updateNote = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID' });
  }
  let note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  const cleanBody = sanitizeObject(req.body, ALLOWED_FIELDS);
  if (cleanBody.title) cleanBody.title = sanitizeString(cleanBody.title, 200);
  if (cleanBody.content) cleanBody.content = sanitizeString(cleanBody.content, 50000);

  note = await Note.findByIdAndUpdate(req.params.id, cleanBody, { new: true, runValidators: true });
  res.status(200).json({ success: true, note });
});

export const deleteNote = asyncHandler(async (req, res) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID' });
  }
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  await note.deleteOne();
  res.status(200).json({ success: true, message: 'Note deleted successfully' });
});
