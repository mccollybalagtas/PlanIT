import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsForMonth
} from '../controllers/eventController.js';

const router = express.Router();

router.use(protect);

router.get('/month', getEventsForMonth);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('startDate').notEmpty().withMessage('Start date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endDate').notEmpty().withMessage('End date is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
    body('category').optional().isIn(['meeting', 'appointment', 'reminder', 'birthday', 'holiday', 'work', 'personal', 'other']).withMessage('Invalid category')
  ],
  validate,
  createEvent
);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;