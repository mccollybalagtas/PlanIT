import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
