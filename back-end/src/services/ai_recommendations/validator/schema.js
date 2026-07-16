import Joi from 'joi';

export const createRecommendationSchema = Joi.object({
  target_date: Joi.date().iso().required(),
  meal_plan_json: Joi.alternatives()
    .try(Joi.object(), Joi.array())
    .optional()
    .allow(null),

  workout_plan_json: Joi.alternatives()
    .try(Joi.object(), Joi.array())
    .optional()
    .allow(null),
});

export const getRecommendationByDateSchema = Joi.object({
  target_date: Joi.date().iso().required(),
});

export const updateCompletionStatusSchema = Joi.object({
  is_completed: Joi.boolean().required(),
});

export const recommendationIdSchema = Joi.object({
  id: Joi.string().required(),
});
