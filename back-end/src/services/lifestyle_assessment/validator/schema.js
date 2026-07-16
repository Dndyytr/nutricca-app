import Joi from 'joi';

export const createLifestyleAssessmentSchema = Joi.object({
  dietary_pattern: Joi.string()
    .allow('', null)
    .optional()
    .valid('High Protein', 'Low Protein', 'High Fiber', 'Vegan'),
  meals_per_day: Joi.number().integer().min(1).allow(null).optional(),
  daily_water_intake_goal: Joi.number().integer().min(0).allow(null).optional(),
  avg_sleep_hours: Joi.number().precision(2).min(4).max(12).required(), // Check constraint di DB: >=4 AND <=12
});

export const updateLifestyleAssessmentSchema = createLifestyleAssessmentSchema
  .optional()
  .min(1);
