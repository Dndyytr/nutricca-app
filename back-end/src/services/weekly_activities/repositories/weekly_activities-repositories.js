import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class WeeklyActivitiesRepository {
  constructor() {
    this.pool = new Pool();
  }

  // --- WEEKLY RUN ---
  async getWeeklyRunByUserId(userId) {
    const query = {
      text: 'SELECT * FROM weekly_run WHERE user_id = $1',
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async createWeeklyRun({
    userId,
    level,
    targetDistance,
    mon,
    tue,
    wed,
    thu,
    fri,
    sat,
    sun,
  }) {
    const id = `run-${nanoid(16)}`;
    const query = {
      text: `
        INSERT INTO weekly_run (id, user_id, level, target_distance, mon, tue, wed, thu, fri, sat, sun)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `,
      values: [
        id,
        userId,
        level,
        targetDistance,
        mon,
        tue,
        wed,
        thu,
        fri,
        sat,
        sun,
      ],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateWeeklyRunById(
    id,
    userId,
    { level, targetDistance, mon, tue, wed, thu, fri, sat, sun },
  ) {
    const query = {
      text: `
        UPDATE weekly_run 
        SET 
          level = $1, target_distance = $2, mon = $3, tue = $4, wed = $5, 
          thu = $6, fri = $7, sat = $8, sun = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10 AND user_id = $11
        RETURNING *
      `,
      values: [
        level,
        targetDistance,
        mon,
        tue,
        wed,
        thu,
        fri,
        sat,
        sun,
        id,
        userId,
      ],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // --- WEEKLY EXERCISE ---
  async getWeeklyExerciseByUserId(userId) {
    const query = {
      text: 'SELECT * FROM weekly_exercise WHERE user_id = $1',
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async createWeeklyExercise({ userId, level, exercisesData }) {
    const id = `exercise-${nanoid(16)}`;
    const query = {
      text: `
        INSERT INTO weekly_exercise (id, user_id, level, exercises_data)
        VALUES ($1, $2, $3, $4::jsonb)
        RETURNING *
      `,
      values: [id, userId, level, JSON.stringify(exercisesData)],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateWeeklyExerciseById(id, userId, { level, exercisesData }) {
    const query = {
      text: `
        UPDATE weekly_exercise 
        SET level = $1, exercises_data = $2::jsonb, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND user_id = $4
        RETURNING *
      `,
      values: [level, JSON.stringify(exercisesData), id, userId],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new WeeklyActivitiesRepository();
