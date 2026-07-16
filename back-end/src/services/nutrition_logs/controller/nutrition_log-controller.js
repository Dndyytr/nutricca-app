import NutritionLogRepository from '../repositories/nutrition_log-repositories.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';

export const addNutritionLog = async (req, res, next) => {
  // Map snake_case dari request body ke camelCase untuk repository
  const {
    daily_log_id: dailyLogId,
    meals,
    total_calories: totalCalories,
    total_protein_g: totalProteinG,
    total_carbs_g: totalCarbsG,
    total_fat_g: totalFatG,
  } = req.validated;

  const nutritionLog = await NutritionLogRepository.addNutritionLog({
    dailyLogId,
    meals,
    totalCalories,
    totalProteinG,
    totalCarbsG,
    totalFatG,
  });

  if (!nutritionLog) {
    return next(new InvariantError('Failed to add nutrition log.'));
  }

  // Update total_calories_in di daily_log berdasarkan SUM semua nutrition logs
  await NutritionLogRepository.recalcCaloriesIn(dailyLogId);

  return response(res, 201, 'Nutrition log successfully added', {
    id: nutritionLog.id,
    meals: nutritionLog.meals,
    total_calories: nutritionLog.total_calories,
    total_protein_g: nutritionLog.total_protein_g,
    total_carbs_g: nutritionLog.total_carbs_g,
    total_fat_g: nutritionLog.total_fat_g,
  });
};

export const getNutritionLogsByDailyLogId = async (req, res, next) => {
  const { daily_log_id: dailyLogId } = req.params;

  const nutritionLogs =
    await NutritionLogRepository.getNutritionLogsByDailyLogId(dailyLogId);

  if (!nutritionLogs || nutritionLogs.length === 0) {
    return next(new NotFoundError('Nutrition logs not found.'));
  }

  return response(res, 200, 'Nutrition logs successfully retrieved', {
    nutritionLogs,
  });
};

export const deleteNutritionLogById = async (req, res, next) => {
  const { id } = req.params;

  const deletedNutritionLog =
    await NutritionLogRepository.deleteNutritionLogById(id);

  if (!deletedNutritionLog) {
    return next(new NotFoundError('Nutrition log not found.'));
  }

  // Recalc calories setelah delete
  await NutritionLogRepository.recalcCaloriesIn(deletedNutritionLog.daily_log_id);

  return response(res, 200, 'Nutrition log successfully deleted', {
    id: deletedNutritionLog.id,
    total_calories: deletedNutritionLog.total_calories, // Disesuaikan dengan skema baru
  });
};
