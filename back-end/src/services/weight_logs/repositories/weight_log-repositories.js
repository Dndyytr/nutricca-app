import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class WeightLogRepository {
  constructor() {
    this.pool = new Pool();
  }

  async upsertWeightLog({ userId, weightKg, logDate, note }) {
    const id = `wlog-${nanoid(16)}`;
    const query = {
      text: `
        INSERT INTO weight_logs (id, user_id, weight_kg, log_date, note)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, log_date) DO UPDATE
          SET weight_kg = EXCLUDED.weight_kg, note = EXCLUDED.note
        RETURNING *
      `,
      values: [id, userId, weightKg, logDate, note || null],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getWeightLogsByUserId(userId, limit = 90) {
    const query = {
      text: `SELECT * FROM weight_logs WHERE user_id = $1 ORDER BY log_date ASC LIMIT $2`,
      values: [userId, limit],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }
}

export default new WeightLogRepository();
