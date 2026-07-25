import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import {
  UserPayloadSchema,
  updateUserPayloadSchema,
  changePasswordPayloadSchema,
} from '../validator/schema.js'; // Import schema update
import authenticateToken from '../../../middleware/auth.js';
import {
  addNewUser,
  getUserById,
  updateUserById,
  updateOnboardingStatus,
  changePassword,
} from '../controller/user-controller.js'; // Import controller update

const router = Router();

// Base route is /api/v1/users
router.post('/', validate(UserPayloadSchema), addNewUser);
router.get('/', authenticateToken, getUserById);

router.put('/onboarding-status', authenticateToken, updateOnboardingStatus);
router.put(
  '/password',
  authenticateToken,
  validate(changePasswordPayloadSchema),
  changePassword,
);
router.put(
  '/',
  authenticateToken,
  validate(updateUserPayloadSchema),
  updateUserById,
);

export default router;
