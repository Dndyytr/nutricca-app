import Joi from 'joi';

export const createBasicIdentitySchema = Joi.object({
  age: Joi.number().integer().min(1).max(120).required(),
  gender: Joi.string()
    .valid('Male', 'Female', 'Laki-laki', 'Perempuan')
    .required(),
  weight: Joi.number().positive().required(),
  height: Joi.number().positive().required(),
  activity_level: Joi.string()
    .valid(
      'Sedentary',
      'Lightly Active',
      'Moderately Active',
      'Very Active',
      'Extra Active',
    )
    .required(),
});

export const updateBasicIdentitySchema = createBasicIdentitySchema
  .optional()
  .min(1);
