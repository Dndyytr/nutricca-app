import { Router } from 'express';
import {
  getMasterExercisesHandler,
  getMasterCardiosHandler,
  postUserWeeklyActivityHandler,
  getUserWeeklyActivityHandler,
  putUserWeeklyActivityHandler,
  getActivityProgressHandler,
  postActivityProgressHandler,
  putActivityProgressHandler,
} from '../controller/index.js';

const router = Router();

// Master Data Routes
router.get('/master/exercises', getMasterExercisesHandler);
router.get('/master/cardios', getMasterCardiosHandler);

// User Weekly Activities Routes
router.post('/', postUserWeeklyActivityHandler);
router.get('/:id', getUserWeeklyActivityHandler);
router.put('/:id', putUserWeeklyActivityHandler);

// Activity Progress Routes
router.get('/:activity_id/progress', getActivityProgressHandler);
router.post('/:activity_id/progress', postActivityProgressHandler);
router.put('/progress/:progress_id', putActivityProgressHandler);

export default router;
