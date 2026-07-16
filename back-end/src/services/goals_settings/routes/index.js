import {
  addGoalSetting,
  getGoalSettingByUserId,
  editGoalSettingByUserId,
} from '../controller/goals_setting-controller.js';
import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  createGoalSettingSchema,
  updateGoalSettingSchema,
} from '../validator/schema.js';

const router = Router();

router.post(
  '/',
  authenticateToken,
  validate(createGoalSettingSchema),
  addGoalSetting,
);
router.get('/', authenticateToken, getGoalSettingByUserId);
router.put(
  '/',
  authenticateToken,
  validate(updateGoalSettingSchema),
  editGoalSettingByUserId,
);

export default router;
