import Joi from 'joi';

export const createWeeklyActivityPayloadSchema = Joi.object({
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  week_start_date: Joi.date().iso().required(),
  selected_exercise_ids: Joi.array().items(Joi.number().positive()).min(1).required(),
  selected_cardio_ids: Joi.array().items(Joi.number().positive()).min(1).required(),
}).strict();

export const updateWeeklyActivityPayloadSchema = Joi.object({
  level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  selected_exercise_ids: Joi.array().items(Joi.number().positive()).min(1),
  selected_cardio_ids: Joi.array().items(Joi.number().positive()).min(1),
}).strict();

export const activityProgressPayloadSchema = Joi.object({
  exercise_id: Joi.number().positive(),
  cardio_id: Joi.number().positive(),
  day_of_week: Joi.number().integer().min(0).max(6).required(),
  completed: Joi.boolean(),
  reps_done: Joi.number().positive(),
  distance_done: Joi.number().positive(),
  notes: Joi.string().max(500),
})
  .or('exercise_id', 'cardio_id')
  .strict();
