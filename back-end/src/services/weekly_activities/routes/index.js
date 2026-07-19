import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  CreateWeeklyRunSchema,
  UpdateWeeklyRunSchema,
  CreateWeeklyExerciseSchema,
  UpdateWeeklyExerciseSchema,
} from '../validator/schema.js';
import {
  getWeeklyRun,
  postWeeklyRun,
  putWeeklyRun,
  getWeeklyExercise,
  postWeeklyExercise,
  putWeeklyExercise,
} from '../controller/weekly_activities-controller.js';
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

// Specific Weekly Run & Exercise Routes (Harus sebelum /:id agar tidak bentrok)
router.get('/run', authenticateToken, getWeeklyRun);
router.post('/run', authenticateToken, validate(CreateWeeklyRunSchema), postWeeklyRun);
router.put('/run/:id', authenticateToken, validate(UpdateWeeklyRunSchema), putWeeklyRun);

router.get('/exercise', authenticateToken, getWeeklyExercise);
router.post('/exercise', authenticateToken, validate(CreateWeeklyExerciseSchema), postWeeklyExercise);
router.put('/exercise/:id', authenticateToken, validate(UpdateWeeklyExerciseSchema), putWeeklyExercise);

// Master Data Routes
router.get('/master/exercises', getMasterExercisesHandler);
router.get('/master/cardios', getMasterCardiosHandler);

// User Weekly Activities Routes
router.post('/', authenticateToken, postUserWeeklyActivityHandler);
router.get('/:id', authenticateToken, getUserWeeklyActivityHandler);
router.put('/:id', authenticateToken, putUserWeeklyActivityHandler);

// Activity Progress Routes
router.get('/:activity_id/progress', authenticateToken, getActivityProgressHandler);
router.post('/:activity_id/progress', authenticateToken, postActivityProgressHandler);
router.put('/progress/:progress_id', authenticateToken, putActivityProgressHandler);

export default router;
