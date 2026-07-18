import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import { createNutritionLogSchema } from '../validator/schema.js';
import {
  addNutritionLog,
  getNutritionLogsByDailyLogId,
  deleteNutritionLogById,
  getNutritionLogsByUserId,
} from '../controller/nutrition_log-controller.js';
const router = Router();

// Base route is /api/v1/nutrition-logs
router.post(
  '/',
  authenticateToken,
  validate(createNutritionLogSchema),
  addNutritionLog,
);
router.get(
  '/:daily_log_id/nutrition',
  authenticateToken,
  getNutritionLogsByDailyLogId,
);
router.get('/user/:user_id', authenticateToken, getNutritionLogsByUserId);
router.delete('/:id', authenticateToken, deleteNutritionLogById);

export default router;
