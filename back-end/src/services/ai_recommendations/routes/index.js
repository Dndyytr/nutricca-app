import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  createRecommendationSchema,
  getRecommendationByDateSchema,
  updateCompletionStatusSchema,
  recommendationIdSchema,
} from '../validator/schema.js';
import {
  createAiRecommendation,
  getRecommendationByDate,
  getAllRecommendationsByUserId,
  updateCompletionStatus,
  deleteRecommendation, // Fixed import name
  generateDailyPlan,
} from '../controller/ai_recommendation-controller.js';

const router = Router();

// Base route is assumed to be mounted at /api/v1/ai-recommendations
router.post('/predict', authenticateToken, generateDailyPlan);
router.post(
  '/',
  authenticateToken,
  validate(createRecommendationSchema),
  createAiRecommendation,
);
router.get('/history', authenticateToken, getAllRecommendationsByUserId);
router.get(
  '/date/:target_date',
  authenticateToken,
  validate(getRecommendationByDateSchema, 'params'),
  getRecommendationByDate,
);
router.put(
  '/:id/completion',
  authenticateToken,
  validate(updateCompletionStatusSchema),
  validate(recommendationIdSchema, 'params'),
  updateCompletionStatus,
);
router.delete(
  '/:id',
  authenticateToken,
  validate(recommendationIdSchema, 'params'),
  deleteRecommendation,
);
// Tambahkan baris ini di file Router kamu
router.put(
  '/date/:target_date',
  authenticateToken,
  validate(getRecommendationByDateSchema, 'params'), // Asumsi schemanya sama (butuh target_date)
  validate(createRecommendationSchema), // Validasi body datanya
  createAiRecommendation // Kita pakai controller yang sama karena fungsinya sudah upsert
);

export default router;
