import Joi from 'joi';

export const updateGamificationSchema = Joi.object({
  xp_points: Joi.number().integer().min(0).required(),
  health_rank: Joi.string()
    .valid('NOVICE', 'INTERMEDIATE', 'PRO', 'ELITE')
    .required(),
  current_streak: Joi.number().integer().min(0).required(),
  longest_streak: Joi.number().integer().min(0).required(),
  unlocked_badges: Joi.array().items(Joi.string()).required(),
});
