import { Router } from 'express';
import users from '../services/users/routes/index.js';
import authentications from '../services/authentications/routes/index.js';
import basicIdentity from '../services/basic_identity/routes/index.js';
import lifestyleAssessment from '../services/lifestyle_assessment/routes/index.js';
import healthSecurity from '../services/health_security/routes/index.js';
import goalSetting from '../services/goals_settings/routes/index.js';
import aiRecommendation from '../services/ai_recommendations/routes/index.js';
import dailyLogs from '../services/daily_logs/routes/index.js';
import activityLogs from '../services/activity_logs/routes/index.js';
import nutritionLogs from '../services/nutrition_logs/routes/index.js';
import gamification from '../services/gamifications/routes/index.js';
import weeklyActivities from '../services/weekly_activities/routes/index.js';
import weightLogs from '../services/weight_logs/routes/index.js';

const router = Router();

// Base Routes
router.use('/api/v1/users', users);
router.use('/api/v1/auth', authentications);

// Profile & Assessment Routes
router.use('/api/v1/basic-identity', basicIdentity);
router.use('/api/v1/lifestyle-assessment', lifestyleAssessment);
router.use('/api/v1/health-security', healthSecurity);
router.use('/api/v1/goal-setting', goalSetting);

router.use('/api/v1/ai-recommendations', aiRecommendation);
// Tracking Routes
router.use('/api/v1/daily-logs', dailyLogs);
router.use('/api/v1/activity-logs', activityLogs);
router.use('/api/v1/nutrition-logs', nutritionLogs);
router.use('/api/v1/weekly-activities', weeklyActivities);
router.use('/api/v1/weight-logs', weightLogs);
router.use('/api/v1/gamification', gamification);

export default router;
