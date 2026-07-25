import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  postAuthenticationPayloadSchema,
  postAuthenticationGooglePayloadSchema,
  putAuthenticationPayloadSchema,
  deleteAuthenticationPayloadSchema,
  otpValidationPayloadSchema,
  forgotPasswordPayloadSchema,
  resetPasswordPayloadSchema,
} from '../validator/schema.js';
import {
  login,
  refreshToken,
  logout,
  loginWithGoogle,
  requestOtp,
  forgotPassword,
  resetPassword,
} from '../controller/authentication-controller.js';

const router = Router();

// Base route is /api/v1/authentications
router.post('/request-otp', validate(otpValidationPayloadSchema), requestOtp);
router.post(
  '/forgot-password',
  validate(forgotPasswordPayloadSchema),
  forgotPassword,
);
router.post(
  '/reset-password',
  validate(resetPasswordPayloadSchema),
  resetPassword,
);
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
