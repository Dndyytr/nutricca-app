import DailyLogRepository from '../repositories/daily_logs-repositories.js';
import AiRecommendationRepository from '../../ai_recommendations/repositories/ai_recommendation-repositories.js';
import response from '../../../utils/response.js';

export const getTodaySchedule = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const today = new Date().toISOString().split('T')[0];

    let dailyProgress = await DailyLogRepository.getDailyLogByDate(
      userId,
      today,
    );

    // Lazy Initialization
    if (!dailyProgress) {
      dailyProgress = await DailyLogRepository.addDailyLog({
        userId,
        logDate: today, // Passed as camelCase to match repository params
      });
    }

    let dailyPlan = await AiRecommendationRepository.getRecommendationByDate(
      userId,
      today,
    );

    if (!dailyPlan) {
      dailyPlan = {
        meal_plan_json: null,
        workout_plan_json: null,
        is_completed: false,
      };
    }

    return response(res, 200, 'Daily schedule successfully loaded', {
      date: today,
      progress: {
        water_ml: dailyProgress.total_water_ml,
        steps: dailyProgress.total_steps,
        calories_in: dailyProgress.total_calories_in,
        calories_out: dailyProgress.total_calories_out,
      },
      schedule: {
        meals: dailyPlan.meal_plan_json,
        workouts: dailyPlan.workout_plan_json,
        status: dailyPlan.is_completed,
      },
    });
  } catch (error) {
    return next(error);
  }
};
