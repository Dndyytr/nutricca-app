import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class BasicIdentityRepository {
  constructor() {
    this.pool = new Pool();
  }

  async addUserBasicIdentity({
    userId,
    age,
    gender,
    weight,
    height,
    activityLevel,
  }) {
    const id = `bid-${nanoid(16)}`;

    const query = {
      text: `
        INSERT INTO basic_identities (
          id,
          user_id,
          age,
          gender,
          weight,
          height,
          activity_level
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      values: [id, userId, age, gender, weight, height, activityLevel],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getUserBasicIdentityByUserId(userId) {
    const query = {
      text: 'SELECT * FROM basic_identities WHERE user_id = $1',
      values: [userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async editUserBasicIdentityByUserId(
    userId,
    { age, gender, weight, height, activityLevel },
  ) {
    const query = {
      text: `
        UPDATE basic_identities
        SET
          age = $1,
          gender = $2,
          weight = $3,
          height = $4,
          activity_level = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $6
        RETURNING *
      `,
      values: [age, gender, weight, height, activityLevel, userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new BasicIdentityRepository();
