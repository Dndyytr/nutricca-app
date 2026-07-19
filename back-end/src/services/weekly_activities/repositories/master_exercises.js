import { Pool } from 'pg';

const pool = new Pool();

export const getAllMasterExercises = async () => {
  const query = `
    SELECT id, name, type, icon_url, description, target_reps, calories_per_unit, duration_days, created_at
    FROM master_exercises
    ORDER BY name ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getMasterExerciseById = async (id) => {
  const query = `
    SELECT id, name, type, icon_url, description, target_reps, calories_per_unit, duration_days, created_at
    FROM master_exercises
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
