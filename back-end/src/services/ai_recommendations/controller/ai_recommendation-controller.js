import AiRecommendationRepository from '../repositories/ai_recommendation-repositories.js';
import AiRecommendationService from '../repositories/ai_recommendation-service.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import response from '../../../utils/response.js';

export const createAiRecommendation = async (req, res, next) => {
  const {
    user_id: userId,
    target_date: targetDate,
    meal_plan_json: mealPlanJson,
    workout_plan_json: workoutPlanJson,
  } = req.validated;

  try {
    // UBAH PANGGILAN REPOSITORY DI SINI
    const recommendation =
      await AiRecommendationRepository.upsertAiRecommendation({
        userId,
        targetDate,
        mealPlanJson,
        workoutPlanJson,
      });

    if (!recommendation) {
      return next(new InvariantError('Failed to save recommendation.'));
    }

    return response(res, 201, 'Recommendation successfully saved (Upserted)', {
      recommendation,
    });
  } catch (error) {
    return next(error);
  }
};

export const getRecommendationByDate = async (req, res, next) => {
  const { id: userId } = req.user;
  const { target_date: targetDate } = req.params;

  try {
    const recommendation =
      await AiRecommendationRepository.getRecommendationByDate(
        userId,
        targetDate,
      );

    if (!recommendation) {
      return next(
        new NotFoundError('Recommendation for the specified date not found.'),
      );
    }

    return response(res, 200, 'Recommendation successfully retrieved', {
      recommendation,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllRecommendationsByUserId = async (req, res, next) => {
  const { id: userId } = req.user;

  try {
    const recommendations =
      await AiRecommendationRepository.getAllRecommendationsByUserId(userId);

    // Gracefully handle empty states
    if (!recommendations || recommendations.length === 0) {
      return response(res, 200, 'No recommendations found for this user', {
        recommendations: [],
      });
    }

    return response(res, 200, 'Recommendations successfully retrieved', {
      recommendations,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCompletionStatus = async (req, res, next) => {
  const { id: userId } = req.user;
  const { id } = req.params;
  const { is_completed: isCompleted } = req.validated;

  try {
    const updatedRecommendation =
      await AiRecommendationRepository.updateCompletionStatus(
        id,
        userId,
        isCompleted,
      );

    if (!updatedRecommendation) {
      return next(
        new NotFoundError('Recommendation not found or failed to update.'),
      );
    }

    return response(res, 200, 'Recommendation status successfully updated', {
      recommendation: updatedRecommendation,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteRecommendation = async (req, res, next) => {
  const { id: userId } = req.user;
  const { id } = req.params;

  try {
    const deletedRecommendation =
      await AiRecommendationRepository.deleteRecommendationById(id, userId);

    if (!deletedRecommendation) {
      return next(new NotFoundError('Recommendation not found.'));
    }

    return response(res, 200, 'Recommendation successfully deleted', {
      recommendation: deletedRecommendation,
    });
  } catch (error) {
    return next(error);
  }
};

export const generateDailyPlan = async (req, res, next) => {
  const userId = req.user.id;
  // FIX: baca dari req.validated (sudah diproses middleware) dengan fallback ke req.body
  const targetDate = (req.validated || req.body)?.target_date;

  if (!targetDate) {
    return next(new InvariantError('target_date is required.'));
  }

  try {
    const recommendation =
      await AiRecommendationService.generateAndSaveDailyPlan(
        userId,
        targetDate,
      );
    return response(
      res,
      201,
      'AI Daily Plan successfully generated and saved',
      { recommendation },
    );
  } catch (error) {
    return next(error);
  }
};
