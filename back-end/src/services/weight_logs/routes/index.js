import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import { weightLogSchema } from '../validator/schema.js';
import { logWeight, getWeightLogs } from '../controller/weight_log-controller.js';

const router = Router();

router.get('/', authenticateToken, getWeightLogs);
router.post('/', authenticateToken, validate(weightLogSchema), logWeight);

export default router;
