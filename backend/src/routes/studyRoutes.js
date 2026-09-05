import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createStudySet,
  getStudySets,
  getStudySet,
  updateStudySet,
  deleteStudySet,
  createFlashcard,
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
  recordReview,
  uploadStudyFile,
  getStudyFiles,
  deleteStudyFile,
  studyStats,
} from '../controllers/studyController.js';

const router = express.Router();

router.use(protect);

router.route('/sets')
  .get(getStudySets)
  .post(createStudySet);

router.route('/sets/:id')
  .get(getStudySet)
  .put(updateStudySet)
  .delete(deleteStudySet);

router.route('/flashcards')
  .get(getFlashcards)
  .post(createFlashcard);

router.route('/flashcards/:id')
  .put(updateFlashcard)
  .delete(deleteFlashcard);

router.put('/flashcards/:id/review', recordReview);

router.route('/files')
  .get(getStudyFiles)
  .post(uploadStudyFile);

router.route('/files/:id')
  .delete(deleteStudyFile);

router.get('/stats', studyStats);

export default router;
