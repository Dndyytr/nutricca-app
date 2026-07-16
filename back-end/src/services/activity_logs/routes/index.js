import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import { createActivityLogSchema } from '../validator/schema.js';
import {
  addActivityLog,
  getActivitiesByDailyLogId,
  deleteActivityLogById,
} from '../controller/activity_log-controller.js';

const router = Router();

// Base route: /api/v1/activity-logs
router.post(
  '/',
  authenticateToken,
  validate(createActivityLogSchema),
  addActivityLog,
);

// Endpoint ini tidak memerlukan validasi body, hanya pengecekan JWT
router.get('/:daily_log_id', authenticateToken, getActivitiesByDailyLogId);
router.delete('/:id', authenticateToken, deleteActivityLogById);

export default router;
