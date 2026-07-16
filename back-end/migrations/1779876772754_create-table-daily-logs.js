/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('daily_logs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    log_date: { type: 'DATE', notNull: true },
    total_water_ml: { type: 'INTEGER', notNull: true, default: 0 },
    sleep_start_time: { type: 'TIMESTAMP', notNull: false },
    sleep_end_time: { type: 'TIMESTAMP', notNull: false },
    total_calories_in: { type: 'FLOAT', notNull: true, default: 0 },
    total_calories_out: { type: 'FLOAT', notNull: true, default: 0 },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint('daily_logs', 'unique_user_log_date', {
    unique: ['user_id', 'log_date'],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('daily_logs');
};
