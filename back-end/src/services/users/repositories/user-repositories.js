import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';

class UserRepository {
  constructor() {
    this.pool = new Pool();
  }

  async createUser({ fullname, email, password }) {
    // Prefix 'user-' agar seragam dengan tabel lain
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: `
        INSERT INTO users (
          id,
          fullname,
          email,
          password
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      values: [id, fullname, email, hashedPassword],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async verifyEmail(email) {
    const query = {
      text: 'SELECT email FROM users WHERE email = $1',
      values: [email],
    };

    const result = await this.pool.query(query);
    return result.rowCount > 0;
  }

  async verifyUserById(id) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    // Return boolean: true jika user ada, false jika tidak
    return result.rowCount > 0;
  }

  async getUserById(id) {
    const query = {
      text: `
        SELECT
          id,
          fullname,
          email,
          is_onboarding_completed,
          created_at,
          updated_at
        FROM users
        WHERE id = $1
      `,
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // Fungsi kredensial yang difokuskan di UserRepository
  async verifyUserCredential(email, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE email = $1',
      values: [email],
    };

    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      return null;
    }

    const { id, password: hashedPassword } = result.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      return null;
    }

    return id;
  }

  async editFullnameByUserId(userId, { fullname }) {
    const query = {
      text: `
        UPDATE users
        SET
          fullname = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, fullname, email
      `,
      values: [fullname, userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async editPasswordByUserId(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = {
      text: `
        UPDATE users
        SET
          password = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id
      `,
      values: [hashedPassword, userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async checkOnboardingStatus(userId) {
    const query = {
      text: 'SELECT is_onboarding_completed FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0]?.is_onboarding_completed || false;
  }

  async getFullUserProfile(userId) {
    const query = `
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
    `;

    const result = await this.pool.query(query, [userId]);
    return result.rows[0];
  }

  async setOnboardingCompleted(userId) {
    const query = {
      text: `
        UPDATE users
        SET is_onboarding_completed = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `,
      values: [userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new UserRepository();
