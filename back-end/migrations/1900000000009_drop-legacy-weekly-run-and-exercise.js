/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * weekly_run dan weekly_exercise adalah tabel legacy untuk fitur "Weekly Activity".
 * Sudah digantikan sepenuhnya oleh sistem baru:
 *   master_exercises / master_cardios   -> katalog exercise & cardio
 *   user_weekly_activities              -> 1 baris per user per minggu (level, week_start_date)
 *   user_activity_exercises / user_activity_cardios -> exercise/cardio yang dipilih user minggu itu
 *   activity_progress                   -> checklist harian (completed, reps/distance_done, calories_burned)
 *
 * Sistem baru sudah mendukung progress per-hari & activity history, yang tidak
 * bisa dilakukan oleh weekly_run/weekly_exercise (cuma 1 row snapshot tanpa histori).
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.dropTable('weekly_run');
  pgm.dropTable('weekly_exercise');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.createTable('weekly_run', {
    id: { type: 'TEXT', primaryKey: true },
    user_id: { type: 'TEXT', notNull: true, references: 'users', onDelete: 'CASCADE' },
    level: { type: 'TEXT', notNull: true, default: 1 },
    target_distance: { type: 'FLOAT', notNull: true, default: 12.0 },
    mon: { type: 'FLOAT', notNull: true, default: 0 },
    tue: { type: 'FLOAT', notNull: true, default: 0 },
    wed: { type: 'FLOAT', notNull: true, default: 0 },
    thu: { type: 'FLOAT', notNull: true, default: 0 },
    fri: { type: 'FLOAT', notNull: true, default: 0 },
    sat: { type: 'FLOAT', notNull: true, default: 0 },
    sun: { type: 'FLOAT', notNull: true, default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('weekly_exercise', {
    id: { type: 'TEXT', primaryKey: true },
    user_id: { type: 'TEXT', notNull: true, references: 'users', onDelete: 'CASCADE' },
    level: { type: 'TEXT', notNull: true },
    exercises_data: { type: 'JSONB', notNull: true, default: '[]' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};
