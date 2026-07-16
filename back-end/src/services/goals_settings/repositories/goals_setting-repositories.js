import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class GoalSettingRepository {
  constructor() {
    this.pool = new Pool();
  }

  async addGoalSetting({
    userId,
    primaryGoal,
    targetWeightKg,
    commitmentDays,
    preferredActivity,
  }) {
    const id = `goal-${nanoid(16)}`;

    const query = {
      text: `
        INSERT INTO goal_settings (
          id,
          user_id,
          primary_goal,
          target_weight_kg,
          commitment_days,
          preferred_activity
        )
        VALUES (
          $1, $2, $3, $4, $5, $6
        )
        RETURNING id
      `,
      values: [
        id,
        userId,
        primaryGoal,
        targetWeightKg,
        commitmentDays,
        preferredActivity,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0].id;
  }

  async getGoalSettingByUserId(userId) {
    const query = {
      text: `
        SELECT
          id,
          user_id,
          primary_goal,
          target_weight_kg,
          commitment_days,
          preferred_activity,
          created_at,
          updated_at
        FROM goal_settings
        WHERE user_id = $1
      `,
      values: [userId],
    };

    const result = await this.pool.query(query);
    // Mengembalikan rows[0] karena biasanya 1 user = 1 setting goals
    return result.rows[0];
  }

  async getGoalSettingById(id) {
    const query = {
      text: `
        SELECT
          id,
          user_id,
          primary_goal,
          target_weight_kg,
          commitment_days,
          preferred_activity,
          created_at,
          updated_at
        FROM goal_settings
        WHERE id = $1
      `,
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateGoalSettingById(
    id,
    { primaryGoal, targetWeightKg, commitmentDays, preferredActivity },
  ) {
    const query = {
      text: `
        UPDATE goal_settings
        SET
          primary_goal = $1,
          target_weight_kg = $2,
          commitment_days = $3,
          preferred_activity = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id
      `,
      values: [
        primaryGoal,
        targetWeightKg,
        commitmentDays,
        preferredActivity,
        id,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new GoalSettingRepository();
