import Joi from 'joi';

export const createWeeklyActivityPayloadSchema = Joi.object({
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  week_start_date: Joi.date().iso().required(),
  selected_exercise_ids: Joi.array()
    .items(Joi.number().positive())
    .min(1)
    .required(),
  selected_cardio_ids: Joi.array()
    .items(Joi.number().positive())
    .min(1)
    .required(),
}).strict();

export const updateWeeklyActivityPayloadSchema = Joi.object({
  level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  selected_exercise_ids: Joi.array().items(Joi.number().positive()).min(1),
  selected_cardio_ids: Joi.array().items(Joi.number().positive()).min(1),
}).strict();

/**
 * Validasi progress dengan aturan kondisional:
 * - Kalau exercise_id: wajib isi reps_done
 * - Kalau cardio_id: wajib isi distance_done
 */
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
  .when('exercise_id', {
    is: Joi.exist(),
    then: Joi.object({
      reps_done: Joi.number().positive().required(),
    }),
  })
  .when('cardio_id', {
    is: Joi.exist(),
    then: Joi.object({
      distance_done: Joi.number().positive().required(),
    }),
  })
  .strict();

/**
 * Query params untuk GET /history (semua opsional)
 */
export const activityHistoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(5),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  search: Joi.string().max(100),
  type: Joi.string().valid('exercise', 'cardio'),
  sort: Joi.string().valid('newest', 'oldest'),
});
