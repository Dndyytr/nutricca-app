import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  postAuthenticationPayloadSchema,
  postAuthenticationGooglePayloadSchema,
  putAuthenticationPayloadSchema,
  deleteAuthenticationPayloadSchema,
  otpValidationPayloadSchema,
} from '../validator/schema.js';
import {
  login,
  refreshToken,
  logout,
  loginWithGoogle,
  requestOtp,
} from '../controller/authentication-controller.js';

const router = Router();

// Base route is /api/v1/authentications
router.post('/request-otp', validate(otpValidationPayloadSchema), requestOtp);
router.post('/', validate(postAuthenticationPayloadSchema), login);
router.post(
  '/google',
  validate(postAuthenticationGooglePayloadSchema),
  loginWithGoogle,
);
router.put('/', validate(putAuthenticationPayloadSchema), refreshToken);
router.delete(
  '/logout',
  authenticateToken,
  validate(deleteAuthenticationPayloadSchema),
  logout,
);

export default router;
