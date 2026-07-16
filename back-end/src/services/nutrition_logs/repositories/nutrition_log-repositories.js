import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class NutritionLogRepository {
  constructor() {
    this.pool = new Pool();
  }

  async addNutritionLog({
    dailyLogId,
    meals = [], // Array of objects: [{ food_name: '...', meal_type: '...' }]
    totalCalories = 0,
    totalProteinG = 0,
    totalCarbsG = 0,
    totalFatG = 0,
  }) {
    const id = `nutri-${nanoid(16)}`;

    const query = {
      text: `
        INSERT INTO nutrition_logs (
          id,
          daily_log_id,
          meals,
          total_calories,
          total_protein_g,
          total_carbs_g,
          total_fat_g
        )
        VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)
        RETURNING id, meals, total_calories, total_protein_g, total_carbs_g, total_fat_g
      `,
      values: [
        id,
        dailyLogId,
        JSON.stringify(meals),
        totalCalories,
        totalProteinG,
        totalCarbsG,
        totalFatG,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getNutritionLogsByDailyLogId(dailyLogId) {
    const query = {
      text: 'SELECT * FROM nutrition_logs WHERE daily_log_id = $1 ORDER BY created_at ASC',
      values: [dailyLogId],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async deleteNutritionLogById(id) {
    const query = {
      text: 'DELETE FROM nutrition_logs WHERE id = $1 RETURNING id, daily_log_id, total_calories',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async recalcCaloriesIn(dailyLogId) {
    const query = {
      text: `
        UPDATE daily_logs
        SET total_calories_in = (
          SELECT COALESCE(SUM(total_calories), 0)
          FROM nutrition_logs
          WHERE daily_log_id = $1
        )
        WHERE id = $1
      `,
      values: [dailyLogId],
    };
    await this.pool.query(query);
  }
}

export default new NutritionLogRepository();