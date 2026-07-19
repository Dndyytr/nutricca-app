import { Pool } from 'pg';

const pool = new Pool();

export const getAllMasterCardios = async () => {
  const query = `
    SELECT id, name, type, icon_url, description, target_distance, calories_per_unit, duration_days, created_at, level
    FROM master_cardios
    ORDER BY name ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getMasterCardioByLevel = async (level) => {
  const query = `
    SELECT id, name, type, icon_url, description, target_distance, calories_per_unit, duration_days, created_at, level
    FROM master_cardios
    WHERE level = $1
    ORDER BY name ASC
  `;
  const result = await pool.query(query, [level]);
  return result.rows;
};

export const getMasterCardioById = async (id) => {
  const query = `
    SELECT id, name, type, icon_url, description, target_distance, calories_per_unit, duration_days, created_at, level
    FROM master_cardios
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
