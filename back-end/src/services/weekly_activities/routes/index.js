import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import authenticateToken from '../../../middleware/auth.js';
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

const router = Router();

// Asumsi router ini di-mount di app.js / server.js dengan prefix:
// app.use('/api/v1/weekly-activities', weeklyActivitiesRouter);

// --- ROUTES FOR WEEKLY RUN ---
router.get('/run', authenticateToken, getWeeklyRun);
router.post(
  '/run',
  authenticateToken,
  validate(CreateWeeklyRunSchema),
  postWeeklyRun,
);
// Menangkap parameter :id sesuai dengan `${weeklyRunId}` di frontend
router.put(
  '/run/:id',
  authenticateToken,
  validate(UpdateWeeklyRunSchema),
  putWeeklyRun,
);

// --- ROUTES FOR WEEKLY EXERCISE ---
router.get('/exercise', authenticateToken, getWeeklyExercise);
router.post(
  '/exercise',
  authenticateToken,
  validate(CreateWeeklyExerciseSchema),
  postWeeklyExercise,
);
// Menangkap parameter :id sesuai dengan `${weeklyExerciseId}` di frontend
router.put(
  '/exercise/:id',
  authenticateToken,
  validate(UpdateWeeklyExerciseSchema),
  putWeeklyExercise,
);

export default router;
