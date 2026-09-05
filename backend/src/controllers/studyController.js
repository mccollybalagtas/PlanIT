import { asyncHandler } from '../utils/asyncHandler.js';
import { StudySet, Flashcard, StudyFile } from '../models/sql/index.js';
import { config } from '../config/index.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const userId = (req) => req.user?.id || 'anonymous';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/json',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const sanitizeString = (str, maxLen = 500) => {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
};

const sanitizeColor = (color) => {
  if (typeof color !== 'string') return '#6366f1';
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(color) ? color : '#6366f1';
};

export const createStudySet = asyncHandler(async (req, res) => {
  const { title, subject, description, color, dueDate } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const set = await StudySet.create({
    userId: userId(req),
    title: sanitizeString(title, 100),
    subject: sanitizeString(subject, 50) || 'General',
    description: sanitizeString(description, 500) || '',
    color: sanitizeColor(color),
    dueDate: dueDate || null,
  });
  res.status(201).json({ success: true, studySet: set });
});

export const getStudySets = asyncHandler(async (req, res) => {
  const sets = await StudySet.findAll({
    where: { userId: userId(req), active: true },
    include: [
      { model: Flashcard, as: 'flashcards', attributes: ['id'] },
      { model: StudyFile, as: 'files', attributes: ['id', 'filename', 'originalName', 'mimetype', 'size', 'category'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: 200,
  });
  res.json({ success: true, studySets: sets });
});

export const getStudySet = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'Invalid study set ID' });
  }

  const set = await StudySet.findOne({
    where: { id, userId: userId(req) },
    include: [
      { model: Flashcard, as: 'flashcards', limit: 500, order: [['createdAt', 'DESC']] },
      { model: StudyFile, as: 'files', attributes: ['id', 'filename', 'originalName', 'mimetype', 'size', 'category', 'createdAt'], limit: 100, order: [['createdAt', 'DESC']] },
    ],
  });
  if (!set) {
    return res.status(404).json({ success: false, message: 'Study set not found' });
  }
  res.json({ success: true, studySet: set });
});

export const updateStudySet = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'Invalid study set ID' });
  }

  const set = await StudySet.findOne({ where: { id, userId: userId(req) } });
  if (!set) {
    return res.status(404).json({ success: false, message: 'Study set not found' });
  }
  const { title, subject, description, color, dueDate, active } = req.body;
  if (title !== undefined) set.title = sanitizeString(title, 100);
  if (subject !== undefined) set.subject = sanitizeString(subject, 50);
  if (description !== undefined) set.description = sanitizeString(description, 500);
  if (color !== undefined) set.color = sanitizeColor(color);
  if (dueDate !== undefined) set.dueDate = dueDate;
  if (typeof active === 'boolean') set.active = active;
  await set.save();
  res.json({ success: true, studySet: set });
});

export const deleteStudySet = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'Invalid study set ID' });
  }

  const set = await StudySet.findOne({ where: { id, userId: userId(req) } });
  if (!set) {
    return res.status(404).json({ success: false, message: 'Study set not found' });
  }
  const files = await StudyFile.findAll({ where: { studySetId: set.id } });
  for (const file of files) {
    try {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Failed to delete file:', err.message);
    }
  }
  await Flashcard.destroy({ where: { studySetId: set.id } });
  await StudyFile.destroy({ where: { studySetId: set.id } });
  await set.destroy();
  res.json({ success: true, message: 'Study set deleted' });
});

export const createFlashcard = asyncHandler(async (req, res) => {
  const { front, back, category, difficulty, studySetId } = req.body;

  if (!front || !back || typeof front !== 'string' || typeof back !== 'string') {
    return res.status(400).json({ success: false, message: 'Front and back are required' });
  }

  if (studySetId) {
    const set = await StudySet.findOne({ where: { id: studySetId, userId: userId(req) } });
    if (!set) {
      return res.status(404).json({ success: false, message: 'Study set not found' });
    }
  }

  const card = await Flashcard.create({
    userId: userId(req),
    studySetId: studySetId || null,
    front: sanitizeString(front, 1000),
    back: sanitizeString(back, 1000),
    category: sanitizeString(category, 50) || 'General',
    difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
  });
  res.status(201).json({ success: true, flashcard: card });
});

export const getFlashcards = asyncHandler(async (req, res) => {
  const where = { userId: userId(req) };
  if (req.query.studySetId) {
    const setId = parseInt(req.query.studySetId);
    if (!isNaN(setId)) where.studySetId = setId;
  }
  const cards = await Flashcard.findAll({ where, order: [['createdAt', 'DESC']], limit: 500 });
  res.json({ success: true, flashcards: cards });
});

export const updateFlashcard = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid flashcard ID' });
  }
  const card = await Flashcard.findOne({ where: { id, userId: userId(req) } });
  if (!card) {
    return res.status(404).json({ success: false, message: 'Flashcard not found' });
  }
  const { front, back, category, difficulty } = req.body;
  if (front !== undefined) card.front = sanitizeString(front, 1000);
  if (back !== undefined) card.back = sanitizeString(back, 1000);
  if (category !== undefined) card.category = sanitizeString(category, 50);
  if (difficulty !== undefined && ['easy', 'medium', 'hard'].includes(difficulty)) card.difficulty = difficulty;
  await card.save();
  res.json({ success: true, flashcard: card });
});

export const deleteFlashcard = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid flashcard ID' });
  }
  const card = await Flashcard.findOne({ where: { id, userId: userId(req) } });
  if (!card) {
    return res.status(404).json({ success: false, message: 'Flashcard not found' });
  }
  await card.destroy();
  res.json({ success: true, message: 'Flashcard deleted' });
});

export const recordReview = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid flashcard ID' });
  }
  const card = await Flashcard.findOne({ where: { id, userId: userId(req) } });
  if (!card) {
    return res.status(404).json({ success: false, message: 'Flashcard not found' });
  }
  const quality = Math.min(Math.max(parseInt(req.body.quality) || 0, 0), 5);
  card.reviewCount += 1;
  card.lastReviewed = new Date();

  if (quality >= 3) {
    card.mastery = Math.min(100, card.mastery + 10);
  } else {
    card.mastery = Math.max(0, card.mastery - 5);
  }

  await card.save();
  res.json({ success: true, flashcard: card });
});

export const uploadStudyFile = asyncHandler(async (req, res) => {
  const { files, studySetId } = req.body;

  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files provided' });
  }
  if (files.length > 10) {
    return res.status(400).json({ success: false, message: 'Maximum 10 files per upload' });
  }

  if (studySetId) {
    const set = await StudySet.findOne({ where: { id: studySetId, userId: userId(req) } });
    if (!set) {
      return res.status(404).json({ success: false, message: 'Study set not found' });
    }
  }

  const uploadDir = path.resolve(config.uploadDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o700 });
  }

  const savedFiles = [];

  for (const file of files) {
    if (!file || typeof file.data !== 'string' || typeof file.name !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid file format' });
    }

    const base64Data = file.data.replace(/^data:([^;]+);base64,/, '');
    if (!/^[A-Za-z0-9+/=\s]+$/.test(base64Data)) {
      return res.status(400).json({ success: false, message: 'Invalid file data' });
    }

    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length === 0) {
      return res.status(400).json({ success: false, message: 'Empty file' });
    }
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ success: false, message: `File ${file.name} exceeds 10MB limit` });
    }

    const mimetype = typeof file.type === 'string' ? file.type.slice(0, 100) : 'application/octet-stream';
    if (!ALLOWED_MIME_TYPES.has(mimetype)) {
      return res.status(400).json({ success: false, message: `File type not allowed: ${mimetype}` });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    const filename = `${Date.now()}_${crypto.randomUUID()}_${safeName}`;
    const filepath = path.join(uploadDir, filename);

    if (!filepath.startsWith(uploadDir + path.sep) && filepath !== uploadDir) {
      return res.status(400).json({ success: false, message: 'Invalid file path' });
    }

    fs.writeFileSync(filepath, buffer, { mode: 0o600 });

    const saved = await StudyFile.create({
      userId: userId(req),
      studySetId: studySetId || null,
      filename,
      originalName: safeName.slice(0, 200),
      mimetype,
      size: buffer.length,
      path: filepath,
      category: typeof file.category === 'string' ? file.category.slice(0, 50) : 'resource',
    });

    savedFiles.push({
      id: saved.id,
      filename: saved.filename,
      originalName: saved.originalName,
      mimetype: saved.mimetype,
      size: saved.size,
      category: saved.category,
      createdAt: saved.createdAt,
    });
  }

  res.status(201).json({ success: true, files: savedFiles });
});

export const getStudyFiles = asyncHandler(async (req, res) => {
  const where = { userId: userId(req) };
  if (req.query.studySetId) {
    const setId = parseInt(req.query.studySetId);
    if (!isNaN(setId)) where.studySetId = setId;
  }
  const files = await StudyFile.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: 100,
    attributes: ['id', 'filename', 'originalName', 'mimetype', 'size', 'category', 'createdAt'],
  });
  res.json({ success: true, files });
});

export const deleteStudyFile = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid file ID' });
  }

  const file = await StudyFile.findOne({ where: { id, userId: userId(req) } });
  if (!file) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }
  try {
    if (fs.existsSync(file.path)) {
      const uploadDir = path.resolve(config.uploadDir);
      if (path.resolve(file.path).startsWith(uploadDir)) {
        fs.unlinkSync(file.path);
      }
    }
  } catch (err) {
    console.error('Failed to delete file:', err.message);
  }
  await file.destroy();
  res.json({ success: true, message: 'File deleted' });
});

export const studyStats = asyncHandler(async (req, res) => {
  const uid = userId(req);
  const totalSets = await StudySet.count({ where: { userId: uid } });
  const totalCards = await Flashcard.count({ where: { userId: uid } });
  const totalFiles = await StudyFile.count({ where: { userId: uid } });
  const reviewedCards = await Flashcard.count({
    where: { userId: uid, reviewCount: { [Op.gt]: 0 } },
  });
  const mastery = totalCards > 0 ? Math.round((reviewedCards / totalCards) * 100) : 0;

  res.json({
    success: true,
    stats: { totalSets, totalCards, totalFiles, reviewedCards, mastery },
  });
});
