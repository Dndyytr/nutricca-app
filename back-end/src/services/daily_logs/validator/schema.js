import Joi from 'joi';

export const addDailyLogSchema = Joi.object({
  log_date: Joi.date().iso().required(),
  total_water_ml: Joi.number().integer().min(0).optional(),
  sleep_start_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .allow(null, '')
    .optional(),
  sleep_end_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .allow(null, '')
    .optional(),
  total_calories_in: Joi.number().min(0).optional(), // Dibuat .number() agar menerima desimal (FLOAT)
  total_calories_out: Joi.number().min(0).optional(),
  total_steps: Joi.number().integer().min(0).optional(),

  daily_score: Joi.number().min(0).optional(),
  daily_status: Joi.string()
    .valid('POOR', 'FAIR', 'GOOD', 'EXCELLENT')
    .allow(null, '')
    .optional(),
});

export const updateDailyLogSchema = addDailyLogSchema
  .fork(['log_date'], (schema) => schema.optional())
  .min(1);
