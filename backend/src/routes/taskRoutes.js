import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  getTaskStats
} from '../controllers/taskController.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.put('/reorder', reorderTasks);
router.get('/:id', getTask);
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('category').optional().isIn(['personal', 'work', 'shopping', 'health', 'education', 'finance', 'other']).withMessage('Invalid category')
  ],
  validate,
  createTask
);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;