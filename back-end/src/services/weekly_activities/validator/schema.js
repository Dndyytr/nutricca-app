import Joi from 'joi';

// Skema untuk POST (Create)
export const CreateWeeklyRunSchema = Joi.object({
  level: Joi.number().integer().required(),
  target_distance: Joi.number().required(),
  mon: Joi.number().default(0),
  tue: Joi.number().default(0),
  wed: Joi.number().default(0),
  thu: Joi.number().default(0),
  fri: Joi.number().default(0),
  sat: Joi.number().default(0),
  sun: Joi.number().default(0),
});

export const CreateWeeklyExerciseSchema = Joi.object({
  level: Joi.string().required(),
  exercises_data: Joi.array()
    .items(
      Joi.object({
        exercise_name: Joi.string().required(),
        mon: Joi.boolean().default(false),
        tue: Joi.boolean().default(false),
        wed: Joi.boolean().default(false),
        thu: Joi.boolean().default(false),
        fri: Joi.boolean().default(false),
        sat: Joi.boolean().default(false),
        sun: Joi.boolean().default(false),
      }),
    )
    .required(),
});

// Skema untuk PUT (Update) - Menggunakan skema yang sama dengan Create untuk body-nya
export const UpdateWeeklyRunSchema = CreateWeeklyRunSchema;
export const UpdateWeeklyExerciseSchema = CreateWeeklyExerciseSchema;
