import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class ActivityLogRepository {
  constructor() {
    this.pool = new Pool();
  }

  // 1. Ambil data master berdasarkan nama (Frontend mengirim string)
  async getActivityMasterByName(name) {
    const query = {
      text: 'SELECT * FROM master_activities WHERE name = $1',
      values: [name],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // 2. Hitung total jarak lari/jalan minggu ini
  async getCurrentWeeklyRunDistance(userId) {
    const query = {
      text: `
        SELECT COALESCE(SUM(al.input_value), 0) AS total_distance
        FROM activity_logs al
        JOIN master_activities ma ON al.activity_id = ma.id
        JOIN daily_logs dl ON al.daily_log_id = dl.id
        WHERE dl.user_id = $1 
          AND ma.category = 'weekly_run'
          AND dl.log_date >= DATE_TRUNC('week', CURRENT_DATE)
      `,
      values: [userId],
    };

    const result = await this.pool.query(query);
    return parseFloat(result.rows[0].total_distance);
  }

  // 3. Tambah Log Baru
  async addActivityLog({ dailyLogId, activityId, inputValue, caloriesBurned }) {
    const id = `actlog-${nanoid(16)}`;
    const query = {
      text: `
        INSERT INTO activity_logs (id, daily_log_id, activity_id, input_value, calories_burned)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, calories_burned
      `,
      values: [id, dailyLogId, activityId, inputValue, caloriesBurned],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // 4. Update akumulasi kalori di daily_logs
  async updateDailyCaloriesOut(dailyLogId, calories, isAdding = true) {
    const operator = isAdding ? '+' : '-';
    const query = {
      text: `
        UPDATE daily_logs 
        SET total_calories_out = total_calories_out ${operator} $1,
            updated_at = current_timestamp
        WHERE id = $2
      `,
      values: [calories, dailyLogId],
    };
    await this.pool.query(query);
  }

  // 5. Ambil data beserta nama olahraganya
  async getActivitiesByDailyLogId(dailyLogId) {
    const query = {
      text: `
        SELECT 
          al.id, 
          al.input_value, 
          al.calories_burned, 
          al.created_at,
          ma.name AS activity_name, 
          ma.input_type, 
          ma.category
        FROM activity_logs al
        JOIN master_activities ma ON al.activity_id = ma.id
        WHERE al.daily_log_id = $1 
        ORDER BY al.created_at ASC
      `,
      values: [dailyLogId],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  // 6. Hapus log dan kembalikan nilai kalori untuk dikurangi dari daily_logs
  async deleteActivityLogById(id) {
    const query = {
      text: 'DELETE FROM activity_logs WHERE id = $1 RETURNING id, daily_log_id, calories_burned',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new ActivityLogRepository();
