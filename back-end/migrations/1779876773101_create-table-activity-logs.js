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
  pgm.createTable('activity_logs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    daily_log_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'daily_logs',
      onDelete: 'CASCADE',
    },
    // Kolom baru relasi ke master_activities
    activity_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'master_activities',
      onDelete: 'RESTRICT', // Mencegah log terhapus tidak sengaja jika master diubah
    },
    // Kolom baru pengganti duration_minutes, menampung KM atau Menit
    input_value: { type: 'FLOAT', notNull: true }, 
    calories_burned: { type: 'FLOAT', notNull: true },
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
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('activity_logs');
};