import Joi from 'joi';

export const postAuthenticationPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const postAuthenticationGooglePayloadSchema = Joi.object({
  token: Joi.string().required(),
});

export const putAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const deleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const otpValidationPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const forgotPasswordPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required(),
});

