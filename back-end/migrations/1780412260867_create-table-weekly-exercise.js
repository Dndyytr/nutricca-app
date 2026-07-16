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
  pgm.createTable('weekly_exercise', {
    id: {
      type: 'TEXT',
      primaryKey: true,
    },
    user_id: {
      type: 'TEXT',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    // Menyimpan level saat ini (misal: 'Intermediate')
    level: {
      type: 'TEXT',
      notNull: true,
    },
    // Di sinilah keajaiban PostgreSQL.
    // Semua data latihan (nama, reps, sets, dan status checklist Mon-Sun) masuk ke sini.
    exercises_data: {
      type: 'JSONB',
      notNull: true,
      default: '[]', // Default array kosong
    },
    // Metadata standar
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
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
  pgm.dropTable('weekly_exercise');
};
