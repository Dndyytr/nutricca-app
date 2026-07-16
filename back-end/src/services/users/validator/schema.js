import Joi from 'joi';

export const UserPayloadSchema = Joi.object({
  fullname: Joi.string().min(3).max(50).required(), // Disesuaikan dengan DB kolom 'fullname'
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// LENGKAPI INI
export const updateUserPayloadSchema = Joi.object({
  fullname: Joi.string().min(3).max(50).required(),
  // Tambahkan kolom lain di sini jika nanti user bisa update email/password
});