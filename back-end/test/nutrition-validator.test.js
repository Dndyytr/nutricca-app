import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createNutritionLogSchema } from '../src/services/nutrition_logs/validator/schema.js';

describe('Nutrition Logs Schema Unit Tests', () => {
  test('should pass validation with valid nutrition log payload', () => {
    const payload = {
      daily_log_id: 'dl-12345',
      meals: [
        { meal_type: 'Breakfast', food_name: 'Nasi Goreng' },
        { meal_type: 'Dinner', food_name: 'Ayam Bakar' },
      ],
      total_calories: 1250.5,
      total_protein_g: 65,
      total_carbs_g: 150.2,
      total_fat_g: 30.5,
    };
    const { error, value } = createNutritionLogSchema.validate(payload);
    assert.equal(error, undefined);
    assert.equal(value.total_calories, 1250.5);
  });

  test('should fail validation when meal_type is invalid', () => {
    const payload = {
      daily_log_id: 'dl-12345',
      meals: [{ meal_type: 'MidnightSnack', food_name: 'Roti' }],
      total_calories: 200,
      total_protein_g: 5,
      total_carbs_g: 20,
      total_fat_g: 2,
    };
    const { error } = createNutritionLogSchema.validate(payload);
    assert.notEqual(error, undefined);
    assert.match(error.message, /"meals\[0\]\.meal_type" must be one of/);
  });

  test('should fail validation when total_calories is negative', () => {
    const payload = {
      daily_log_id: 'dl-12345',
      meals: [{ meal_type: 'Lunch', food_name: 'Salad' }],
      total_calories: -50,
      total_protein_g: 10,
      total_carbs_g: 15,
      total_fat_g: 5,
    };
    const { error } = createNutritionLogSchema.validate(payload);
    assert.notEqual(error, undefined);
    assert.match(error.message, /"total_calories" must be greater than or equal to 0/);
  });
});
