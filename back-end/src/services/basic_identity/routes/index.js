import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  createBasicIdentitySchema,
  updateBasicIdentitySchema,
} from '../validator/schema.js';
import {
  addUserBasicIdentity,
  editUserBasicIdentityByUserId,
  getUserBasicIdentityByUserId,
} from '../controller/basic_identity-controller.js';

const router = Router();

// Base route is /api/v1/basic-identity
router.post(
  '/',
  authenticateToken,
  validate(createBasicIdentitySchema),
  addUserBasicIdentity,
);
router.get('/', authenticateToken, getUserBasicIdentityByUserId);
router.put(
  '/',
  authenticateToken,
  validate(updateBasicIdentitySchema),
  editUserBasicIdentityByUserId,
);

export default router;
