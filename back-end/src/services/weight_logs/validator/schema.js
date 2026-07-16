import Joi from 'joi';

export const weightLogSchema = Joi.object({
  weight_kg: Joi.number().min(1).max(500).required(),
  log_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  note: Joi.string().max(200).optional().allow(''),
});
