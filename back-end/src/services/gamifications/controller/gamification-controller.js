import GamificationRepository from '../repositories/gamification-repositories.js'; // Make sure the path matches your structure
import NotFoundError from '../../../exceptions/not-found-error.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import response from '../../../utils/response.js';

export const getGamificationByUserId = async (req, res, next) => {
  const { id: userId } = req.user;

  try {
    const gamification = await GamificationRepository.getByUserId(userId);

    if (!gamification) {
      return next(new NotFoundError('Gamification profile not found.'));
    }

    return response(res, 200, 'Gamification profile successfully retrieved', {
      gamification,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateGamification = async (req, res, next) => {
  const { id: userId } = req.user;

  // Map snake_case to camelCase
  const {
    xp_points: xpPoints,
    health_rank: healthRank,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    unlocked_badges: unlockedBadges,
  } = req.validated;

  try {
    const updatedGamification = await GamificationRepository.updateGamification(
      userId,
      {
        xpPoints,
        healthRank,
        currentStreak,
        longestStreak,
        unlockedBadges,
      },
    );

    if (!updatedGamification) {
      return next(new InvariantError('Failed to update gamification profile.'));
    }

    return response(res, 200, 'Gamification profile successfully updated', {
      gamification: updatedGamification,
    });
  } catch (error) {
    return next(error);
  }
};
