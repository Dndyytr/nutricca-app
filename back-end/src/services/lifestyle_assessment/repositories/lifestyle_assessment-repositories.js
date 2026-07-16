import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class LifestyleAssessmentRepository {
  constructor() {
    this.pool = new Pool();
  }

  async addLifestyleAssessment({
    dietaryPattern,
    mealsPerDay,
    dailyWaterIntakeGoal,
    avgSleepHours,
    userId,
  }) {
    // Menambahkan prefix 'lsa-' agar seragam dan mudah diidentifikasi
    const id = `lsa-${nanoid(16)}`;

    const query = {
      text: `
        INSERT INTO lifestyle_assessments (
          id,
          user_id,
          dietary_pattern,
          meals_per_day,
          daily_water_intake_goal,
          avg_sleep_hours
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      values: [
        id,
        userId,
        dietaryPattern,
        mealsPerDay,
        dailyWaterIntakeGoal,
        avgSleepHours,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getLifestyleAssessmentByUserId(userId) {
    const query = {
      text: 'SELECT * FROM lifestyle_assessments WHERE user_id = $1',
      values: [userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async editLifestyleAssessmentByUserId(
    userId,
    { dietaryPattern, mealsPerDay, dailyWaterIntakeGoal, avgSleepHours },
  ) {
    const query = {
      text: `
        UPDATE lifestyle_assessments
        SET
          dietary_pattern = $1,
          meals_per_day = $2,
          daily_water_intake_goal = $3,
          avg_sleep_hours = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $5
        RETURNING *
      `,
      values: [
        dietaryPattern,
        mealsPerDay,
        dailyWaterIntakeGoal,
        avgSleepHours,
        userId,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new LifestyleAssessmentRepository();
