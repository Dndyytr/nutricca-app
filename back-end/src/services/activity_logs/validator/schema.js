import Joi from 'joi';

export const createActivityLogSchema = Joi.object({
  daily_log_id: Joi.string().required(),
  activity_name: Joi.string().required(), // Misal: 'Walking', 'Gym'
  input_value: Joi.number().min(0.1).required(), // Bisa merepresentasikan 2.5 (km) atau 30 (menit)
});

// Schema untuk memvalidasi Parameter di URL
export const getActivitiesByDailyLogIdSchema = Joi.object({
  daily_log_id: Joi.string().required(),
});

export const deleteActivityLogByIdSchema = Joi.object({
  id: Joi.string().required(),
});