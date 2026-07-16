import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class GamificationRepository {
  constructor() {
    this.pool = new Pool();
  }

  // 1. Dijalankan HANYA saat user baru pertama kali mendaftar (Register)
  async createGamificationProfile(userId) {
    const id = `gamify-${nanoid(16)}`;

    const query = {
      text: `
        INSERT INTO gamifications (id, user_id)
        VALUES ($1, $2)
        RETURNING *
      `,
      values: [id, userId],
      // Nilai xp_points, health_rank, dan unlocked_badges otomatis menggunakan default dari database
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // 2. Dijalankan untuk mengecek rank dan XP user saat ini
  async getByUserId(userId) {
    const query = {
      text: 'SELECT * FROM gamifications WHERE user_id = $1',
      values: [userId],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // Add these to gamification-repositories.js
  async addStreak(userId) {
    const query = {
      text: `
      UPDATE gamifications 
      SET 
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        xp_points = xp_points + 50 -- Give them some XP for an excellent day!
      WHERE user_id = $1
    `,
      values: [userId],
    };
    await this.pool.query(query);
  }

  async resetStreak(userId) {
    const query = {
      text: 'UPDATE gamifications SET current_streak = 0 WHERE user_id = $1',
      values: [userId],
    };
    await this.pool.query(query);
  }

  async updateGamification(
    userId,
    { xpPoints, healthRank, currentStreak, longestStreak, unlockedBadges },
  ) {
    const query = {
      text: `
        UPDATE gamifications
        SET 
          xp_points = $1,
          health_rank = $2,
          current_streak = $3,
          longest_streak = $4,
          unlocked_badges = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $6
        RETURNING *
      `,
      values: [
        xpPoints,
        healthRank,
        currentStreak,
        longestStreak,
        unlockedBadges ?? [],
        userId,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new GamificationRepository();
