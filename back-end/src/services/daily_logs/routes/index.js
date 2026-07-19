import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  addDailyLogSchema,
  updateDailyLogSchema,
} from '../validator/schema.js';
import {
  getDailyLogByDate,
  getDailyLogsByUserId,
  updateDailyLog,
  deleteDailyLog,
} from '../controller/daily_log-controller.js';
import { getTodaySchedule } from '../controller/daily_schedule-controller.js';
import { paginationMiddleware } from '../../../middleware/pagination.js';

const router = Router();

// Base route is /api/v1/daily-logs
router.get('/schedule/today', authenticateToken, getTodaySchedule);
router.get('/date', authenticateToken, getDailyLogByDate); // Validate schema removed for GET request
router.get('/user', authenticateToken, paginationMiddleware, getDailyLogsByUserId);

router.put(
  '/:id',
  authenticateToken,
  validate(updateDailyLogSchema),
  updateDailyLog,
);
router.delete('/:id', authenticateToken, deleteDailyLog);

export default router;
