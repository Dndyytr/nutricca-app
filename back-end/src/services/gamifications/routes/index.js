import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import { updateGamificationSchema } from '../validator/schema.js';
import {
  getGamificationByUserId,
  updateGamification,
} from '../controller/gamification-controller.js';

const router = Router();

// Base route is /api/v1/gamification
router.get('/', authenticateToken, getGamificationByUserId);
router.put(
  '/',
  authenticateToken,
  validate(updateGamificationSchema),
  updateGamification,
);

export default router;
