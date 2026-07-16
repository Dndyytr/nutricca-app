import Joi from 'joi';

export const createNutritionLogSchema = Joi.object({
  daily_log_id: Joi.string().required(), // Wajib ada untuk relasi ke Daily Log

  // Memvalidasi array of objects untuk properti meals
  meals: Joi.array()
    .items(
      Joi.object({
        meal_type: Joi.string()
          .valid(
            'Breakfast',
            'Lunch',
            'Dinner',
            'Snack',
            'breakfast',
            'lunch',
            'dinner',
            'snack',
          )
          .required(),
        food_name: Joi.string().required(),
      }),
    )
    .required(), // Boleh diganti .default([]) jika tidak wajib diisi dari frontend

  // Validasi total nutrisi harian (bisa menerima float/desimal)
  total_calories: Joi.number().min(0).required(),
  total_protein_g: Joi.number().min(0).required(),
  total_carbs_g: Joi.number().min(0).required(),
  total_fat_g: Joi.number().min(0).required(),
});
