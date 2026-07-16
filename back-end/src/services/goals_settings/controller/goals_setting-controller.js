import GoalSettingRepository from '../repositories/goals_setting-repositories.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';

export const addGoalSetting = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      primary_goal: primaryGoal,
      target_weight_kg: targetWeightKg,
      commitment_days: commitmentDays,
      preferred_activity: preferredActivity,
    } = req.validated;

    const existingGoal =
      await GoalSettingRepository.getGoalSettingByUserId(userId);

    if (existingGoal) {
      return next(
        new InvariantError(
          'Failed to add goal setting. User already has a goal setting.',
        ),
      );
    }

    const goalSettingId = await GoalSettingRepository.addGoalSetting({
      userId,
      primaryGoal,
      targetWeightKg,
      commitmentDays,
      preferredActivity,
    });

    if (!goalSettingId) {
      return next(new InvariantError('Failed to add goal setting.'));
    }

    return response(res, 201, 'Goal setting successfully added', {
      id: goalSettingId,
    });
  } catch (error) {
    next(error);
  }
  // Map snake_case to camelCase
};

export const getGoalSettingByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const goalSetting =
      await GoalSettingRepository.getGoalSettingByUserId(userId);

    if (!goalSetting) {
      return next(new NotFoundError('Goal setting not found.'));
    }

    return response(res, 200, 'Goal setting successfully retrieved', {
      goalSetting,
    });
  } catch (error) {
    next(error);
  }
};

export const editGoalSettingByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Map snake_case to camelCase
    const {
      primary_goal: primaryGoal,
      target_weight_kg: targetWeightKg,
      commitment_days: commitmentDays,
      preferred_activity: preferredActivity,
    } = req.validated;

    // Fetch the existing record to get its Primary Key (id)
    const existingGoal =
      await GoalSettingRepository.getGoalSettingByUserId(userId);

    if (!existingGoal) {
      return next(new NotFoundError('Goal setting not found.'));
    }

    // Use the extracted 'id' to perform the update
    const updatedGoalSettingId =
      await GoalSettingRepository.updateGoalSettingById(existingGoal.id, {
        primaryGoal,
        targetWeightKg,
        commitmentDays,
        preferredActivity,
      });

    if (!updatedGoalSettingId) {
      return next(new InvariantError('Failed to update goal setting.'));
    }

    return response(res, 200, 'Goal setting successfully updated', {
      id: updatedGoalSettingId,
    });
  } catch (error) {
    next(error);
  }
};
