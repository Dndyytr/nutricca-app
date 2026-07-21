import { Pool } from 'pg';

const pool = new Pool();

export const getAllMasterExercises = async () => {
  const query = `
    SELECT id, name, type, icon_url, description, target_reps, calories_per_unit, duration_days, created_at, level
    FROM master_exercises
    ORDER BY name ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getMasterExerciseByLevel = async (level) => {
  // ponytail: fall back to beginner until each level has its own master catalog.
  const query = `
    SELECT id, name, type, icon_url, description, target_reps, calories_per_unit, duration_days, created_at, level
    FROM master_exercises
    WHERE level = $1
      OR (
        level = 'beginner'
        AND NOT EXISTS (SELECT 1 FROM master_exercises WHERE level = $1)
      )
    ORDER BY name ASC
  `;
  const result = await pool.query(query, [level]);
  return result.rows;
}

export const getMasterExerciseById = async (id) => {
  const query = `
    SELECT id, name, type, icon_url, description, target_reps, calories_per_unit, duration_days, created_at, level
    FROM master_exercises
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
