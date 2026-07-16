import LifestyleAssessmentRepository from '../repositories/lifestyle_assessment-repositories.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';

export const addLifestyleAssessment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      dietary_pattern: dietaryPattern,
      meals_per_day: mealsPerDay,
      daily_water_intake_goal: dailyWaterIntakeGoal,
      avg_sleep_hours: avgSleepHours,
    } = req.validated;

    const isUserExist =
      await LifestyleAssessmentRepository.getLifestyleAssessmentByUserId(
        userId,
      );

    if (isUserExist) {
      return next(
        new InvariantError(
          'Failed to add lifestyle assessment. User already has a lifestyle assessment.',
        ),
      );
    }

    const lifestyleAssessment =
      await LifestyleAssessmentRepository.addLifestyleAssessment({
        userId,
        dietaryPattern,
        mealsPerDay,
        dailyWaterIntakeGoal,
        avgSleepHours,
      });

    if (!lifestyleAssessment) {
      return next(new InvariantError('Failed to add lifestyle assessment.'));
    }

    return response(res, 201, 'Lifestyle assessment successfully added', {
      id: lifestyleAssessment.id,
    });
  } catch (error) {
    next(error);
  }
};

export const getLifestyleAssessmentByUserId = async (req, res, next) => {
  const userId = req.user.id;

  const lifestyleAssessment =
    await LifestyleAssessmentRepository.getLifestyleAssessmentByUserId(userId);

  if (!lifestyleAssessment) {
    return next(new NotFoundError('Lifestyle assessment not found.'));
  }

  return response(res, 200, 'Lifestyle assessment successfully retrieved', {
    lifestyleAssessment,
  });
};

export const editLifestyleAssessmentByUserId = async (req, res, next) => {
  const userId = req.user.id;

  const {
    dietary_pattern: dietaryPattern,
    meals_per_day: mealsPerDay,
    daily_water_intake_goal: dailyWaterIntakeGoal,
    avg_sleep_hours: avgSleepHours,
  } = req.validated;

  const lifestyleAssessment =
    await LifestyleAssessmentRepository.editLifestyleAssessmentByUserId(
      userId,
      {
        dietaryPattern,
        mealsPerDay,
        dailyWaterIntakeGoal,
        avgSleepHours,
      },
    );

  if (!lifestyleAssessment) {
    return next(new InvariantError('Failed to update lifestyle assessment.'));
  }

  return response(res, 200, 'Lifestyle assessment successfully updated', {
    id: lifestyleAssessment.id,
  });
};
