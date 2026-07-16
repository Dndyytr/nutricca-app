import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class DailyLogRepository {
  constructor() {
    this.pool = new Pool();
  }

  // Menggunakan default parameter objek agar tidak crash jika argumen kosong
  async addDailyLog({
    userId,
    logDate,
    totalWaterMl = 0,
    sleepStartTime = null,
    sleepEndTime = null,
    totalCaloriesIn = 0,
    totalCaloriesOut = 0,
    totalSteps = 0,
    dailyScore = 0,
    dailyStatus = 'normal',
  }) {
    const id = `daily-${nanoid(16)}`;

    const query = {
      text: `
        INSERT INTO daily_logs (
          id, user_id, log_date, total_water_ml, 
          sleep_start_time, sleep_end_time, 
          total_calories_in, total_calories_out, 
          total_steps, daily_score, daily_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `,
      values: [
        id,
        userId,
        logDate,
        totalWaterMl,
        sleepStartTime,
        sleepEndTime,
        totalCaloriesIn,
        totalCaloriesOut,
        totalSteps,
        dailyScore,
        dailyStatus,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getDailyLogByDate(userId, logDate) {
    const query = {
      text: 'SELECT * FROM daily_logs WHERE user_id = $1 AND log_date = $2',
      values: [userId, logDate],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getDailyLogById(id) {
    const query = {
      text: 'SELECT * FROM daily_logs WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getDailyLogByUserId(userId) {
    const query = {
      text: 'SELECT * FROM daily_logs WHERE user_id = $1 ORDER BY log_date DESC',
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  // UPDATE menggunakan teknik COALESCE agar jika field tidak dikirim, nilai lama tidak terhapus
  async updateDailyLog(
    id,
    userId,
    {
      totalWaterMl,
      sleepStartTime,
      sleepEndTime,
      totalCaloriesIn,
      totalCaloriesOut,
      totalSteps,
      dailyScore,
      dailyStatus,
    },
  ) {
    const query = {
      text: `
        UPDATE daily_logs
        SET 
          total_water_ml = COALESCE($3, total_water_ml),
          sleep_start_time = COALESCE($4, sleep_start_time),
          sleep_end_time = COALESCE($5, sleep_end_time),
          total_calories_in = COALESCE($6, total_calories_in),
          total_calories_out = COALESCE($7, total_calories_out),
          total_steps = COALESCE($8, total_steps),
          daily_score = COALESCE($9, daily_score),
          daily_status = COALESCE($10, daily_status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `,
      values: [
        id,
        userId,
        totalWaterMl !== undefined ? totalWaterMl : null,
        sleepStartTime !== undefined ? sleepStartTime : null,
        sleepEndTime !== undefined ? sleepEndTime : null,
        totalCaloriesIn !== undefined ? totalCaloriesIn : null,
        totalCaloriesOut !== undefined ? totalCaloriesOut : null,
        totalSteps !== undefined ? totalSteps : null,
        dailyScore !== undefined ? dailyScore : null,
        dailyStatus !== undefined ? dailyStatus : null,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteDailyLog(id, userId) {
    const query = {
      text: 'DELETE FROM daily_logs WHERE id = $1 AND user_id = $2 RETURNING id',
      values: [id, userId],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getAllLogsByDate(logDate) {
    const query = {
      text: 'SELECT * FROM daily_logs WHERE log_date = $1',
      values: [logDate],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async updateDailyEvaluation(id, dailyScore, dailyStatus) {
    const query = {
      text: `
        UPDATE daily_logs
        SET daily_score = $2, daily_status = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      values: [id, dailyScore, dailyStatus],
    };
    await this.pool.query(query);
  }
}

export default new DailyLogRepository();
