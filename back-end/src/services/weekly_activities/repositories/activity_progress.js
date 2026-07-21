import { Pool } from 'pg';
import { nanoid } from 'nanoid';

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

// ponytail: recompute one day from source rows; avoids double-counting weekly and manual activity logs.
const syncDailyCaloriesOut = async (client, progressId) => {
  const source = await client.query(
    `
      SELECT uwa.user_id, (uwa.week_start_date + ap.day_of_week)::date AS log_date
      FROM activity_progress ap
      JOIN user_weekly_activities uwa ON uwa.id = ap.user_activity_id
      WHERE ap.id = $1
        AND (uwa.week_start_date + ap.day_of_week)::date <= CURRENT_DATE
    `,
    [progressId],
  );

  if (!source.rows[0]) return;

  const { user_id: userId, log_date: logDate } = source.rows[0];
  await client.query(
    `
      INSERT INTO daily_logs (id, user_id, log_date)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, log_date) DO NOTHING
    `,
    [`daily-${nanoid(16)}`, userId, logDate],
  );

  await client.query(
    `
      UPDATE daily_logs dl
      SET total_calories_out =
        COALESCE((
          SELECT SUM(al.calories_burned)
          FROM activity_logs al
          WHERE al.daily_log_id = dl.id
        ), 0) +
        COALESCE((
          SELECT SUM(ap.calories_burned)
          FROM activity_progress ap
          JOIN user_weekly_activities uwa ON uwa.id = ap.user_activity_id
          WHERE uwa.user_id = dl.user_id
            AND ap.completed = true
            AND (uwa.week_start_date + ap.day_of_week)::date = dl.log_date
        ), 0),
        updated_at = CURRENT_TIMESTAMP
      WHERE dl.user_id = $1 AND dl.log_date = $2
    `,
    [userId, logDate],
  );
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const caloriesBurned = await calculateCaloriesBurned(
      progressData.exercise_id,
      progressData.cardio_id,
      progressData.reps_done || progressData.distance_done || 0,
    );
    const result = await client.query(
      `
        INSERT INTO activity_progress
        (user_activity_id, exercise_id, cardio_id, day_of_week, completed, reps_done, distance_done, calories_burned, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        activityId,
        progressData.exercise_id || null,
        progressData.cardio_id || null,
        progressData.day_of_week,
        progressData.completed || false,
        progressData.reps_done || null,
        progressData.distance_done || null,
        caloriesBurned,
        progressData.notes || null,
      ],
    );

    await syncDailyCaloriesOut(client, result.rows[0].id);
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
 * Update activity progress dengan kalkulasi ulang kalori di sisi SQL
 * (menghindari race condition dibanding hitung di JS).
 */
export const updateActivityProgress = async (progressId, progressData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updates = [];
    const values = [progressId];
    let paramCount = 2;

    if (progressData.completed !== undefined) {
      updates.push(`completed = $${paramCount}`);
      values.push(progressData.completed);
      paramCount++;
    }

    if (progressData.reps_done !== undefined) {
      updates.push(`reps_done = $${paramCount}`);
      values.push(progressData.reps_done);
      paramCount++;
    }

    if (progressData.distance_done !== undefined) {
      updates.push(`distance_done = $${paramCount}`);
      values.push(progressData.distance_done);
      paramCount++;
    }

    if (progressData.notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(progressData.notes);
      paramCount++;
    }

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

    await syncDailyCaloriesOut(client, progressId);
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
 * Total kalori terbakar untuk 1 weekly activity (dari progress yang completed).
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

/**
 * Ambil history checklist aktivitas (yang completed = true) milik seorang user,
 * lintas minggu, dengan pagination + filter. Dipakai untuk halaman "Activity History".
 */
export const getActivityHistoryByUserId = async (
  userId,
  limit,
  offset,
  filters = {},
  sort = 'newest',
) => {
  const values = [userId];
  let whereClause = 'WHERE uwa.user_id = $1 AND ap.completed = true';

  if (filters.type === 'exercise') {
    whereClause += ' AND ap.exercise_id IS NOT NULL';
  } else if (filters.type === 'cardio') {
    whereClause += ' AND ap.cardio_id IS NOT NULL';
  }

  if (filters.startDate) {
    values.push(filters.startDate);
    whereClause += ` AND uwa.week_start_date >= $${values.length}`;
  }
  if (filters.endDate) {
    values.push(filters.endDate);
    whereClause += ` AND uwa.week_start_date <= $${values.length}`;
  }
  if (filters.search) {
    values.push(`%${filters.search}%`);
    whereClause += ` AND COALESCE(me.name, mc.name) ILIKE $${values.length}`;
  }

  const orderClause =
    sort === 'oldest'
      ? 'ORDER BY ap.updated_at ASC'
      : 'ORDER BY ap.updated_at DESC';

  const dataValues = [...values, limit, offset];
  const dataQuery = {
    text: `
      SELECT 
        ap.id,
        ap.user_activity_id,
        ap.day_of_week,
        ap.completed,
        ap.reps_done,
        ap.distance_done,
        ap.calories_burned,
        ap.notes,
        ap.updated_at,
        uwa.week_start_date,
        uwa.level,
        CASE WHEN ap.exercise_id IS NOT NULL THEN 'exercise' ELSE 'cardio' END AS type,
        COALESCE(me.id, mc.id) AS item_id,
        COALESCE(me.name, mc.name) AS item_name,
        COALESCE(me.icon_url, mc.icon_url) AS icon_url
      FROM activity_progress ap
      JOIN user_weekly_activities uwa ON ap.user_activity_id = uwa.id
      LEFT JOIN master_exercises me ON ap.exercise_id = me.id
      LEFT JOIN master_cardios mc ON ap.cardio_id = mc.id
      ${whereClause}
      ${orderClause}
      LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}
    `,
    values: dataValues,
  };

  const countQuery = {
    text: `
      SELECT COUNT(*)
      FROM activity_progress ap
      JOIN user_weekly_activities uwa ON ap.user_activity_id = uwa.id
      LEFT JOIN master_exercises me ON ap.exercise_id = me.id
      LEFT JOIN master_cardios mc ON ap.cardio_id = mc.id
      ${whereClause}
    `,
    values,
  };

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery),
    pool.query(countQuery),
  ]);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

// ponytail: one aggregate query is enough for the history list; detail stays out until its page exists.
export const getWeeklyActivityHistoryByUserId = async (
  userId,
  limit,
  offset,
  filters = {},
  sort = 'newest',
) => {
  const values = [userId];
  const baseFilters = ['uwa.user_id = $1'];

  if (filters.startDate) {
    values.push(filters.startDate);
    baseFilters.push(`(uwa.week_start_date + 6) >= $${values.length}`);
  }
  if (filters.endDate) {
    values.push(filters.endDate);
    baseFilters.push(`uwa.week_start_date <= $${values.length}`);
  }

  const baseQuery = `
    WITH weekly_history AS (
      SELECT
        uwa.id,
        uwa.week_start_date,
        ARRAY(
          SELECT me.name
          FROM user_activity_exercises uae
          JOIN master_exercises me ON me.id = uae.exercise_id
          WHERE uae.user_activity_id = uwa.id
          ORDER BY me.name
        ) AS exercise_names,
        ARRAY(
          SELECT mc.name
          FROM user_activity_cardios uac
          JOIN master_cardios mc ON mc.id = uac.cardio_id
          WHERE uac.user_activity_id = uwa.id
          ORDER BY mc.name
        ) AS cardio_names,
        COALESCE((
          SELECT COUNT(DISTINCT ap.day_of_week)
          FROM activity_progress ap
          WHERE ap.user_activity_id = uwa.id
            AND ap.exercise_id IS NOT NULL
            AND ap.completed = true
        ), 0) AS exercise_completed_days,
        COALESCE((
          SELECT MAX(me.duration_days)
          FROM user_activity_exercises uae
          JOIN master_exercises me ON me.id = uae.exercise_id
          WHERE uae.user_activity_id = uwa.id
        ), 0) AS exercise_target_days,
        COALESCE((
          SELECT COUNT(DISTINCT ap.day_of_week)
          FROM activity_progress ap
          WHERE ap.user_activity_id = uwa.id
            AND ap.cardio_id IS NOT NULL
            AND ap.completed = true
        ), 0) AS cardio_completed_days,
        COALESCE((
          SELECT MAX(mc.duration_days)
          FROM user_activity_cardios uac
          JOIN master_cardios mc ON mc.id = uac.cardio_id
          WHERE uac.user_activity_id = uwa.id
        ), 0) AS cardio_target_days,
        COALESCE((
          SELECT SUM(ap.calories_burned)
          FROM activity_progress ap
          WHERE ap.user_activity_id = uwa.id AND ap.completed = true
        ), 0) AS total_calories_burned
      FROM user_weekly_activities uwa
      WHERE ${baseFilters.join(' AND ')}
    )
  `;

  let searchClause = '';
  if (filters.search) {
    values.push(`%${filters.search}%`);
    const searchParam = `$${values.length}`;
    searchClause = `
      WHERE COALESCE(array_to_string(exercise_names, ' '), '') ILIKE ${searchParam}
         OR COALESCE(array_to_string(cardio_names, ' '), '') ILIKE ${searchParam}
    `;
  }

  const orderClause = sort === 'oldest' ? 'ASC' : 'DESC';
  const dataValues = [...values, limit, offset];
  const dataQuery = `${baseQuery}
    SELECT *
    FROM weekly_history
    ${searchClause}
    ORDER BY week_start_date ${orderClause}
    LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}
  `;
  const countQuery = `${baseQuery}
    SELECT COUNT(*) FROM weekly_history ${searchClause}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, dataValues),
    pool.query(countQuery, values),
  ]);

  return {
    rows: dataResult.rows,
    total: Number(countResult.rows[0].count),
  };
};
