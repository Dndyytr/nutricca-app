import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  postAuthenticationPayloadSchema,
  putAuthenticationPayloadSchema,
  deleteAuthenticationPayloadSchema,
} from '../validator/schema.js';
import {
  login,
  refreshToken,
  logout,
} from '../controller/authentication-controller.js';

const router = Router();

// Base route is /api/v1/authentications
router.post('/', validate(postAuthenticationPayloadSchema), login);
router.put('/', validate(putAuthenticationPayloadSchema), refreshToken);
router.delete(
  '/logout',
  authenticateToken,
  validate(deleteAuthenticationPayloadSchema),
  logout,
);

export default router;
