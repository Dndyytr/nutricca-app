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

  const exercisesQuery = `
    SELECT me.id, me.name, me.type, me.icon_url, me.description, me.target_reps, me.calories_per_unit, me.duration_days
    FROM master_exercises me
    JOIN user_activity_exercises uae ON me.id = uae.exercise_id
    WHERE uae.user_activity_id = $1
    ORDER BY me.name ASC
  `;
  const exercisesResult = await client.query(exercisesQuery, [activityId]);

  const cardiosQuery = `
    SELECT mc.id, mc.name, mc.type, mc.icon_url, mc.description, mc.target_distance, mc.calories_per_unit, mc.duration_days
    FROM master_cardios mc
    JOIN user_activity_cardios uac ON mc.id = uac.cardio_id
    WHERE uac.user_activity_id = $1
    ORDER BY mc.name ASC
  `;
  const cardiosResult = await client.query(cardiosQuery, [activityId]);

  return {
    ...activity,
    exercises: exercisesResult.rows,
    cardios: cardiosResult.rows,
  };
};

/**
 * Ambil daftar exercise yang dipilih user untuk sebuah activity,
 * dilengkapi ringkasan progress (hari mana aja yang sudah completed).
 * Dipakai untuk render progress bar "X/Y days" di halaman Weekly Activity.
 */
const getExercisesWithProgress = async (client, activityId) => {
  const query = `
    SELECT 
      me.id, me.name, me.type, me.icon_url, me.description, 
      me.target_reps, me.calories_per_unit, me.duration_days,
      COALESCE(
        json_agg(
          json_build_object(
            'progress_id', ap.id,
            'day_of_week', ap.day_of_week,
            'completed', ap.completed,
            'reps_done', ap.reps_done
          ) ORDER BY ap.day_of_week
        ) FILTER (WHERE ap.id IS NOT NULL),
        '[]'
      ) AS progress
    FROM master_exercises me
    JOIN user_activity_exercises uae ON me.id = uae.exercise_id
    LEFT JOIN activity_progress ap 
      ON ap.exercise_id = me.id AND ap.user_activity_id = uae.user_activity_id
    WHERE uae.user_activity_id = $1
    GROUP BY me.id
    ORDER BY me.name ASC
  `;
  const result = await client.query(query, [activityId]);
  return result.rows.map((row) => ({
    ...row,
    days_completed: row.progress.filter((p) => p.completed).length,
    target_days: row.duration_days,
  }));
};

/**
 * Sama seperti di atas, versi cardio. Progress dilengkapi total jarak yang
 * sudah ditempuh minggu ini (dibanding target_distance).
 */
const getCardiosWithProgress = async (client, activityId) => {
  const query = `
    SELECT 
      mc.id, mc.name, mc.type, mc.icon_url, mc.description, 
      mc.target_distance, mc.calories_per_unit, mc.duration_days,
      COALESCE(
        json_agg(
          json_build_object(
            'progress_id', ap.id,
            'day_of_week', ap.day_of_week,
            'completed', ap.completed,
            'distance_done', ap.distance_done
          ) ORDER BY ap.day_of_week
        ) FILTER (WHERE ap.id IS NOT NULL),
        '[]'
      ) AS progress
    FROM master_cardios mc
    JOIN user_activity_cardios uac ON mc.id = uac.cardio_id
    LEFT JOIN activity_progress ap 
      ON ap.cardio_id = mc.id AND ap.user_activity_id = uac.user_activity_id
    WHERE uac.user_activity_id = $1
    GROUP BY mc.id
    ORDER BY mc.name ASC
  `;
  const result = await client.query(query, [activityId]);
  return result.rows.map((row) => ({
    ...row,
    days_completed: row.progress.filter((p) => p.completed).length,
    target_days: row.duration_days,
    total_distance_done: row.progress.reduce(
      (sum, p) => sum + (Number(p.distance_done) || 0),
      0,
    ),
  }));
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

    for (const exerciseId of exerciseIds) {
      await client.query(
        `INSERT INTO user_activity_exercises (user_activity_id, exercise_id)
         VALUES ($1, $2)`,
        [activity.id, exerciseId],
      );
    }

    for (const cardioId of cardioIds) {
      await client.query(
        `INSERT INTO user_activity_cardios (user_activity_id, cardio_id)
         VALUES ($1, $2)`,
        [activity.id, cardioId],
      );
    }

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

/**
 * Ambil weekly activity milik user untuk minggu berjalan (Senin minggu ini),
 * lengkap dengan ringkasan progress tiap exercise/cardio.
 * Dipakai untuk render halaman "Weekly Activity" (Weekly Exercise + Weekly Cardio).
 * Return null jika user belum bikin weekly activity untuk minggu ini.
 */
export const getCurrentWeeklyActivityByUserId = async (userId) => {
  const client = await pool.connect();
  try {
    const activityQuery = `
      SELECT id, user_id, level, week_start_date, created_at, updated_at
      FROM user_weekly_activities
      WHERE user_id = $1 AND week_start_date = date_trunc('week', CURRENT_DATE)::date
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const activityResult = await client.query(activityQuery, [userId]);
    const activity = activityResult.rows[0];

    if (!activity) {
      return null;
    }

    const [exercises, cardios] = await Promise.all([
      getExercisesWithProgress(client, activity.id),
      getCardiosWithProgress(client, activity.id),
    ]);

    return {
      ...activity,
      exercises,
      cardios,
    };
  } finally {
    client.release();
  }
};

export const updateUserWeeklyActivity = async (activityId, updateData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (updateData.level) {
      await client.query(
        `UPDATE user_weekly_activities SET level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [updateData.level, activityId],
      );
    }

    if (updateData.selected_exercise_ids) {
      await client.query(
        `DELETE FROM user_activity_exercises WHERE user_activity_id = $1`,
        [activityId],
      );

      for (const exerciseId of updateData.selected_exercise_ids) {
        await client.query(
          `INSERT INTO user_activity_exercises (user_activity_id, exercise_id)
           VALUES ($1, $2)`,
          [activityId, exerciseId],
        );
      }
    }

    if (updateData.selected_cardio_ids) {
      await client.query(
        `DELETE FROM user_activity_cardios WHERE user_activity_id = $1`,
        [activityId],
      );

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

export const getActivityOwner = async (activityId) => {
  const query = `SELECT user_id FROM user_weekly_activities WHERE id = $1`;
  const result = await pool.query(query, [activityId]);
  return result.rows[0]?.user_id ?? null;
};
