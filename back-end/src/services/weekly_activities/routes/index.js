import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import { paginationMiddleware } from '../../../middleware/pagination.js';
import {
  createWeeklyActivityPayloadSchema,
  updateWeeklyActivityPayloadSchema,
  updateWeeklyExercisesPayloadSchema,
  updateWeeklyCardiosPayloadSchema,
  activityProgressPayloadSchema,
} from '../validator/index.js';
import {
  getMasterExercisesHandler,
  getMasterCardiosHandler,
  postUserWeeklyActivityHandler,
  getUserWeeklyActivityHandler,
  getCurrentUserWeeklyActivityHandler,
  putCurrentWeeklyExercisesHandler,
  putCurrentWeeklyCardiosHandler,
  putUserWeeklyActivityHandler,
  getActivityProgressHandler,
  postActivityProgressHandler,
  putActivityProgressHandler,
  getActivityHistoryHandler,
  getMasterCardioByLevelHandler,
  getMasterExercisesByLevelHandler,
} from '../controller/index.js';

const router = Router();

// --- Master Data (referensi katalog exercise & cardio) ---
router.get('/master/exercises', getMasterExercisesHandler);
router.get('/master/cardios', getMasterCardiosHandler);
router.get('/master/cardios/level/:level', getMasterCardioByLevelHandler);
router.get('/master/exercises/level/:level', getMasterExercisesByLevelHandler);

// --- Route statis, HARUS didaftarkan sebelum '/:id' biar gak ketangkep sebagai param ---
router.get('/current', authenticateToken, getCurrentUserWeeklyActivityHandler);
router.put(
  '/current/exercises',
  authenticateToken,
  validate(updateWeeklyExercisesPayloadSchema),
  putCurrentWeeklyExercisesHandler,
);
router.put(
  '/current/cardios',
  authenticateToken,
  validate(updateWeeklyCardiosPayloadSchema),
  putCurrentWeeklyCardiosHandler,
);
router.get(
  '/history',
  authenticateToken,
  paginationMiddleware,
  getActivityHistoryHandler,
);

// --- Activity Progress (HARUS sebelum '/:id' juga) ---
router.get(
  '/:activity_id/progress',
  authenticateToken,
  getActivityProgressHandler,
);
router.post(
  '/:activity_id/progress',
  authenticateToken,
  validate(activityProgressPayloadSchema),
  postActivityProgressHandler,
);
router.put(
  '/:activity_id/progress/:progress_id',
  authenticateToken,
  validate(activityProgressPayloadSchema),
  putActivityProgressHandler,
);

// --- User Weekly Activity (CRUD utama) ---
router.post(
  '/',
  authenticateToken,
  validate(createWeeklyActivityPayloadSchema),
  postUserWeeklyActivityHandler,
);
router.get('/:id', authenticateToken, getUserWeeklyActivityHandler);
router.put(
  '/:id',
  authenticateToken,
  validate(updateWeeklyActivityPayloadSchema),
  putUserWeeklyActivityHandler,
);

export default router;
