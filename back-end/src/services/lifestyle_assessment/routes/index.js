import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  createLifestyleAssessmentSchema,
  updateLifestyleAssessmentSchema,
} from '../validator/schema.js';
import {
  addLifestyleAssessment,
  getLifestyleAssessmentByUserId,
  editLifestyleAssessmentByUserId,
} from '../controller/lifestyle_assessment-controller.js';

const router = Router();

// Base route is /api/v1/lifestyle-assessment
router.post(
  '/',
  authenticateToken,
  validate(createLifestyleAssessmentSchema),
  addLifestyleAssessment,
);
router.get('/', authenticateToken, getLifestyleAssessmentByUserId);
router.put(
  '/',
  authenticateToken,
  validate(updateLifestyleAssessmentSchema),
  editLifestyleAssessmentByUserId,
);

export default router;
