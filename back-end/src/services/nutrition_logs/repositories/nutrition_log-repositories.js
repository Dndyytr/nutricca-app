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
    userId,
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
          total_fat_g,
          user_id
        )
        VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8)
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
        userId,
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

  async getNutritionLogsByUserId(
    userId,
    limit,
    offset,
    filters = {},
    sort = 'newest',
  ) {
    const values = [userId];
    let whereClause = 'WHERE nl.user_id = $1';
    
    if (filters.startDate) {
      values.push(filters.startDate);
      whereClause += ` AND dl.log_date >= $${values.length}`;
    }
    if (filters.endDate) {
      values.push(filters.endDate);
      whereClause += ` AND dl.log_date <= $${values.length}`;
    }

    const orderClause =
      sort === 'oldest'
        ? 'ORDER BY log_date ASC'
        : 'ORDER BY log_date DESC';

    let searchClause = '';
    if (filters.search?.trim()) {
      values.push(`%${filters.search.trim()}%`);
      const searchValue = `$${values.length}`;
      searchClause = `WHERE (
        meals::text ILIKE ${searchValue}
        OR total_calories::text ILIKE ${searchValue}
        OR total_protein_g::text ILIKE ${searchValue}
        OR total_carbs_g::text ILIKE ${searchValue}
        OR total_fat_g::text ILIKE ${searchValue}
      )`;
    }

    const groupedQuery = `
      WITH daily_nutrition AS (
        SELECT
          dl.log_date,
          jsonb_agg(nl.meals) AS meals,
          COALESCE(SUM(nl.total_calories), 0) AS total_calories,
          COALESCE(SUM(nl.total_protein_g), 0) AS total_protein_g,
          COALESCE(SUM(nl.total_carbs_g), 0) AS total_carbs_g,
          COALESCE(SUM(nl.total_fat_g), 0) AS total_fat_g
        FROM nutrition_logs nl
        JOIN daily_logs dl ON dl.id = nl.daily_log_id
        ${whereClause}
        GROUP BY dl.log_date
      )
    `;

    const dataValues = [...values, limit, offset];
    const dataQuery = {
      text: `${groupedQuery}
        SELECT * FROM daily_nutrition
        ${searchClause}
        ${orderClause}
        LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      values: dataValues,
    };

    const countQuery = {
      text: `${groupedQuery}
        SELECT COUNT(*) FROM daily_nutrition ${searchClause}`,
      values,
    };

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(dataQuery),
      this.pool.query(countQuery),
    ]);

    return {
      rows: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
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
