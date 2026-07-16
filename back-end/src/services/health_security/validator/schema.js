import Joi from 'joi';

export const createHealthSecuritySchema = Joi.object({
  medical_history: Joi.string().allow('', null).optional(),

  physical_injuries: Joi.string().allow('', null).optional(),

  current_medication: Joi.string().allow('', null).optional(),

  blood_pressure: Joi.string()
    .pattern(/^\d{2,3}\/\d{2,3}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.pattern.base':
        'Blood pressure must use format systolic/diastolic (example: 120/80)',
    }),

  heart_rate: Joi.number()
    .integer()
    .min(30)
    .max(200)
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Heart rate must be a number',
      'number.min': 'Heart rate must be at least 30 bpm',
      'number.max': 'Heart rate must not exceed 200 bpm',
    }),

  allergy: Joi.string().allow('', null).optional(),
});

export const updateHealthSecuritySchema = Joi.object({
  medical_history: Joi.string().allow('', null).optional(),

  physical_injuries: Joi.string().allow('', null).optional(),

  current_medication: Joi.string().allow('', null).optional(),

  blood_pressure: Joi.string()
    .pattern(/^\d{2,3}\/\d{2,3}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.pattern.base':
        'Blood pressure must use format systolic/diastolic (example: 120/80)',
    }),

  heart_rate: Joi.number()
    .integer()
    .min(30)
    .max(200)
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Heart rate must be a number',
      'number.min': 'Heart rate must be at least 30 bpm',
      'number.max': 'Heart rate must not exceed 200 bpm',
    }),

  allergy: Joi.string().allow('', null).optional(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
