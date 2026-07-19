import { Pool } from 'pg';
import * as MasterExercisesRepo from './master_exercises.js';
import * as MasterCardiosRepo from './master_cardios.js';

const pool = new Pool();

const getActivityWithDetails = async (client, activityId) => {
  const activityQuery = `
    SELECT id, user_id, level, week_start_date, created_at, updated_at
    FROM user_weekly_activities
    WHERE id = $1
  `;
  const activityResult = await client.query(activityQuery, [activityId]);
  const activity = activityResult.rows[0];

  if (!activity) {
    return null;
  }

  // Get selected exercises
  const exercisesQuery = `
    SELECT me.id, me.name, me.type, me.icon_url, me.description, me.target_reps, me.calories_per_unit, me.duration_days, me.level
    FROM master_exercises me
    JOIN user_activity_exercises uae ON me.id = uae.exercise_id
    WHERE uae.user_activity_id = $1
  `;
  const exercisesResult = await client.query(exercisesQuery, [activityId]);

  // Get selected cardios
  const cardiosQuery = `
    SELECT mc.id, mc.name, mc.type, mc.icon_url, mc.description, mc.target_distance, mc.calories_per_unit, mc.duration_days, mc.level
    FROM master_cardios mc
    JOIN user_activity_cardios uac ON mc.id = uac.cardio_id
    WHERE uac.user_activity_id = $1
  `;
  const cardiosResult = await client.query(cardiosQuery, [activityId]);

  return {
    ...activity,
    exercises: exercisesResult.rows,
    cardios: cardiosResult.rows,
  };
};

export const createUserWeeklyActivity = async (
  userId,
  level,
  weekStartDate,
  exerciseIds,
  cardioIds,
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create weekly activity
    const activityQuery = `
      INSERT INTO user_weekly_activities (user_id, level, week_start_date)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const activityResult = await client.query(activityQuery, [
      userId,
      level,
      weekStartDate,
    ]);
    const activity = activityResult.rows[0];

    // Insert selected exercises
    for (const exerciseId of exerciseIds) {
      await client.query(
        `INSERT INTO user_activity_exercises (user_activity_id, exercise_id)
         VALUES ($1, $2)`,
        [activity.id, exerciseId],
      );
    }

    // Insert selected cardios
    for (const cardioId of cardioIds) {
      await client.query(
        `INSERT INTO user_activity_cardios (user_activity_id, cardio_id)
         VALUES ($1, $2)`,
        [activity.id, cardioId],
      );
    }

    // Fetch complete activity with exercises and cardios
    const completeActivity = await getActivityWithDetails(client, activity.id);

    await client.query('COMMIT');
    return completeActivity;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getUserWeeklyActivity = async (activityId) => {
  const client = await pool.connect();
  try {
    return await getActivityWithDetails(client, activityId);
  } finally {
    client.release();
  }
};

export const updateUserWeeklyActivity = async (activityId, updateData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update level if provided
    if (updateData.level) {
      await client.query(
        `UPDATE user_weekly_activities SET level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [updateData.level, activityId],
      );
    }

    // Update exercises if provided
    if (updateData.selected_exercise_ids) {
      // Delete existing exercises
      await client.query(`DELETE FROM user_activity_exercises WHERE user_activity_id = $1`, [
        activityId,
      ]);

      // Insert new exercises
      for (const exerciseId of updateData.selected_exercise_ids) {
        await client.query(
          `INSERT INTO user_activity_exercises (user_activity_id, exercise_id)
           VALUES ($1, $2)`,
          [activityId, exerciseId],
        );
      }
    }

    // Update cardios if provided
    if (updateData.selected_cardio_ids) {
      // Delete existing cardios
      await client.query(`DELETE FROM user_activity_cardios WHERE user_activity_id = $1`, [
        activityId,
      ]);

      // Insert new cardios
      for (const cardioId of updateData.selected_cardio_ids) {
        await client.query(
          `INSERT INTO user_activity_cardios (user_activity_id, cardio_id)
           VALUES ($1, $2)`,
          [activityId, cardioId],
        );
      }
    }

    const completeActivity = await getActivityWithDetails(client, activityId);
    await client.query('COMMIT');
    return completeActivity;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
