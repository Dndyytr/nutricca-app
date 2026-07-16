import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  createHealthSecuritySchema,
  updateHealthSecuritySchema,
} from '../validator/schema.js';
import {
  addHealthSecurity,
  getHealthSecurityByUserId,
  editHealthSecurityByUserId,
} from '../controller/health_security-controller.js';

const router = Router();

router.post(
  '/',
  authenticateToken,
  validate(createHealthSecuritySchema),
  addHealthSecurity,
);
router.get('/', authenticateToken, getHealthSecurityByUserId);
router.put(
  '/',
  authenticateToken,
  validate(updateHealthSecuritySchema),
  editHealthSecurityByUserId,
);

export default router;
