import { Pool } from 'pg';

const pool = new Pool();

/**
 * Calculate calories burned based on exercise or cardio type
 * @param exerciseId - Optional exercise ID
 * @param cardioId - Optional cardio ID
 * @param quantity - Amount (reps for exercise, distance for cardio)
 * @returns calories_burned value
 */
const calculateCaloriesBurned = async (exerciseId, cardioId, quantity) => {
  if (exerciseId) {
    const query = `SELECT calories_per_unit FROM master_exercises WHERE id = $1`;
    const result = await pool.query(query, [exerciseId]);
    if (result.rows.length > 0) {
      return quantity * result.rows[0].calories_per_unit;
    }
  } else if (cardioId) {
    const query = `SELECT calories_per_unit FROM master_cardios WHERE id = $1`;
    const result = await pool.query(query, [cardioId]);
    if (result.rows.length > 0) {
      return quantity * result.rows[0].calories_per_unit;
    }
  }
  return 0;
};

export const getActivityProgress = async (activityId) => {
  const query = `
    SELECT 
      ap.id,
      ap.day_of_week,
      ap.completed,
      ap.reps_done,
      ap.distance_done,
      ap.calories_burned,
      ap.notes,
      ap.updated_at,
      CASE 
        WHEN ap.exercise_id IS NOT NULL THEN 'exercise'
        ELSE 'cardio'
      END as type,
      COALESCE(me.id, mc.id) as item_id,
      COALESCE(me.name, mc.name) as item_name,
      COALESCE(me.icon_url, mc.icon_url) as icon_url
    FROM activity_progress ap
    LEFT JOIN master_exercises me ON ap.exercise_id = me.id
    LEFT JOIN master_cardios mc ON ap.cardio_id = mc.id
    WHERE ap.user_activity_id = $1
    ORDER BY ap.day_of_week ASC
  `;
  const result = await pool.query(query, [activityId]);
  return result.rows;
};

export const createActivityProgress = async (activityId, progressData) => {
  // Calculate calories burned
  const caloriesBurned = await calculateCaloriesBurned(
    progressData.exercise_id,
    progressData.cardio_id,
    progressData.reps_done || progressData.distance_done || 0,
  );

  const query = `
    INSERT INTO activity_progress 
    (user_activity_id, exercise_id, cardio_id, day_of_week, completed, reps_done, distance_done, calories_burned, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const result = await pool.query(query, [
    activityId,
    progressData.exercise_id || null,
    progressData.cardio_id || null,
    progressData.day_of_week,
    progressData.completed || false,
    progressData.reps_done || null,
    progressData.distance_done || null,
    caloriesBurned,
    progressData.notes || null,
  ]);
  return result.rows[0];
};

/**
 * Update activity progress with database-side calorie recalculation
 * This prevents race conditions by doing calculation in SQL
 */
export const updateActivityProgress = async (progressId, progressData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Build dynamic update query with calorie recalculation in SQL
    const updates = [];
    const values = [progressId];
    let paramCount = 2;

    // Update completed status
    if (progressData.completed !== undefined) {
      updates.push(`completed = $${paramCount}`);
      values.push(progressData.completed);
      paramCount++;
    }

    // Update reps_done
    if (progressData.reps_done !== undefined) {
      updates.push(`reps_done = $${paramCount}`);
      values.push(progressData.reps_done);
      paramCount++;
    }

    // Update distance_done
    if (progressData.distance_done !== undefined) {
      updates.push(`distance_done = $${paramCount}`);
      values.push(progressData.distance_done);
      paramCount++;
    }

    // Update notes
    if (progressData.notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(progressData.notes);
      paramCount++;
    }

    // Always recalculate calories_burned using SQL (prevents race condition)
    updates.push(`calories_burned = CASE
      WHEN exercise_id IS NOT NULL THEN 
        COALESCE(reps_done, (
          SELECT reps_done FROM activity_progress WHERE id = $1
        )) * (SELECT calories_per_unit FROM master_exercises WHERE id = exercise_id)
      WHEN cardio_id IS NOT NULL THEN 
        COALESCE(distance_done, (
          SELECT distance_done FROM activity_progress WHERE id = $1
        )) * (SELECT calories_per_unit FROM master_cardios WHERE id = cardio_id)
      ELSE 0
    END`);

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const updateQuery = `
      UPDATE activity_progress
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      throw new Error('Activity progress not found');
    }

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get total calories burned for a weekly activity
 * Used for dashboard calculation
 */
export const getTotalCaloriesBurned = async (activityId) => {
  const query = `
    SELECT COALESCE(SUM(calories_burned), 0) as total_calories_burned
    FROM activity_progress
    WHERE user_activity_id = $1 AND completed = true
  `;
  const result = await pool.query(query, [activityId]);
  return result.rows[0].total_calories_burned;
};
