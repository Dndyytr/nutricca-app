import Joi from 'joi';

const goals = ['Weight Loss', 'Muscle Gain', 'Endurance', 'General Well-being'];

const activities = [
  'Yoga',
  'Running',
  'Weight Training',
  'Walking',
  'Swimming',
  'Cycling',
  'HIIT',
  'Pilates',
];

export const createGoalSettingSchema = Joi.object({
  primary_goal: Joi.string()
    .valid(...goals)
    .required()
    .messages({
      'any.only': 'Invalid primary goal',
      'string.empty': 'Primary goal is required',
      'any.required': 'Primary goal is required',
    }),

  target_weight_kg: Joi.number()
    .positive()
    .min(30)
    .max(300)
    .required()
    .messages({
      'number.base': 'Target weight must be a number',
      'number.positive': 'Target weight must be positive',
      'number.min': 'Target weight must be at least 30 kg',
      'number.max': 'Target weight must not exceed 300 kg',
      'any.required': 'Target weight is required',
    }),

  commitment_days: Joi.number().integer().min(1).max(7).required().messages({
    'number.base': 'Commitment days must be a number',
    'number.integer': 'Commitment days must be an integer',
    'number.min': 'Commitment days must be at least 1 day',
    'number.max': 'Commitment days must not exceed 7 days',
    'any.required': 'Commitment days is required',
  }),

  preferred_activity: Joi.string().required().messages({
    'string.empty': 'Preferred activity is required',
    'any.required': 'Preferred activity is required',
  }),
});

export const updateGoalSettingSchema = Joi.object({
  primary_goal: Joi.string()
    .valid(...goals)
    .optional()
    .messages({
      'any.only': 'Invalid primary goal',
    }),

  target_weight_kg: Joi.number()
    .positive()
    .min(30)
    .max(300)
    .optional()
    .messages({
      'number.base': 'Target weight must be a number',
      'number.positive': 'Target weight must be positive',
      'number.min': 'Target weight must be at least 30 kg',
      'number.max': 'Target weight must not exceed 300 kg',
    }),

  commitment_days: Joi.number().integer().min(1).max(7).optional().messages({
    'number.base': 'Commitment days must be a number',
    'number.integer': 'Commitment days must be an integer',
    'number.min': 'Commitment days must be at least 1 day',
    'number.max': 'Commitment days must not exceed 7 days',
  }),

  preferred_activity: Joi.string().optional(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
