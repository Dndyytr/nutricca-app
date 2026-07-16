import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class AiRecommendationRepository {
  constructor() {
    this.pool = new Pool();
  }

  // =================================================================
  // 1. FUNGSI CRUD UTAMA AI RECOMMENDATION
  // =================================================================

  async createAiRecommendation({
    userId,
    targetDate,
    mealPlanJson = null,
    workoutPlanJson = null,
  }) {
    const id = `airec-${nanoid(16)}`;

    const query = {
      text: `
        INSERT INTO ai_recommendations (
          id,
          user_id,
          target_date,
          meal_plan_json,
          workout_plan_json
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      values: [
        id,
        userId,
        targetDate,
        // Stringify JSON objek/array agar diterima oleh PostgreSQL
        mealPlanJson ? JSON.stringify(mealPlanJson) : null,
        workoutPlanJson ? JSON.stringify(workoutPlanJson) : null,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getRecommendationByDate(userId, targetDate) {
    const query = {
      text: 'SELECT * FROM ai_recommendations WHERE user_id = $1 AND target_date = $2',
      values: [userId, targetDate],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getAllRecommendationsByUserId(userId) {
    const query = {
      text: 'SELECT * FROM ai_recommendations WHERE user_id = $1 ORDER BY target_date DESC',
      values: [userId],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async updateCompletionStatus(id, userId, isCompleted) {
    const query = {
      text: `
        UPDATE ai_recommendations
        SET 
          is_completed = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `,
      values: [isCompleted, id, userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteRecommendationById(id, userId) {
    const query = {
      text: 'DELETE FROM ai_recommendations WHERE id = $1 AND user_id = $2 RETURNING id',
      values: [id, userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // =================================================================
  // 2. FUNGSI PEMBANTU UNTUK KEBUTUHAN GENERATOR AI
  // =================================================================

  // Mengambil kandidat resep acak untuk dinilai oleh AI Python
  async getRandomRecipes(limit = 30) {
    const query = {
      text: 'SELECT * FROM recipes ORDER BY RANDOM() LIMIT $1',
      values: [limit],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  // Mengambil profil utuh user (gabungan 4 tabel) untuk payload AI
  async getFullUserProfile(userId) {
    const query = {
      text: `
        SELECT 
          bi.age, bi.gender, bi.weight, bi.height, bi.activity_level,
          la.daily_water_intake_goal, la.avg_sleep_hours,
          gs.primary_goal, gs.target_weight_kg,
          hs.blood_pressure, hs.heart_rate, hs.allergy, hs.medical_history
        FROM users u
        LEFT JOIN basic_identities bi ON u.id = bi.user_id
        LEFT JOIN lifestyle_assessments la ON u.id = la.user_id
        LEFT JOIN goal_settings gs ON u.id = gs.user_id
        LEFT JOIN health_securities hs ON u.id = hs.user_id
        WHERE u.id = $1
      `,
      values: [userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async upsertAiRecommendation({
    userId,
    targetDate,
    mealPlanJson = null,
    workoutPlanJson = null,
  }) {
    // Langkah 1: Cek apakah data di tanggal tersebut sudah ada
    const checkQuery = {
      text: 'SELECT id FROM ai_recommendations WHERE user_id = $1 AND target_date = $2',
      values: [userId, targetDate],
    };
    const checkResult = await this.pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      // Langkah 2a: Jika sudah ada, lakukan UPDATE (Timpa data lama)
      const existingId = checkResult.rows[0].id;
      const updateQuery = {
        text: `
          UPDATE ai_recommendations
          SET 
            meal_plan_json = $1,
            workout_plan_json = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *
        `,
        values: [
          mealPlanJson ? JSON.stringify(mealPlanJson) : null,
          workoutPlanJson ? JSON.stringify(workoutPlanJson) : null,
          existingId,
        ],
      };
      const updateResult = await this.pool.query(updateQuery);
      return updateResult.rows[0];
    } else {
      // Langkah 2b: Jika belum ada, lakukan INSERT data baru
      const id = `airec-${nanoid(16)}`;
      const insertQuery = {
        text: `
          INSERT INTO ai_recommendations (
            id, user_id, target_date, meal_plan_json, workout_plan_json
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `,
        values: [
          id,
          userId,
          targetDate,
          mealPlanJson ? JSON.stringify(mealPlanJson) : null,
          workoutPlanJson ? JSON.stringify(workoutPlanJson) : null,
        ],
      };
      const insertResult = await this.pool.query(insertQuery);
      return insertResult.rows[0];
    }
  }
}

export default new AiRecommendationRepository();
