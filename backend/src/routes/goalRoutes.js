import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalStats
} from '../controllers/goalController.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getGoalStats);
router.get('/', getGoals);
router.get('/:id', getGoal);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
