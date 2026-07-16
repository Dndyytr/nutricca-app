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
  pgm.createTable('gamifications', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    xp_points: { type: 'INTEGER', notNull: true, default: 0 },
    health_rank: { type: 'VARCHAR(50)', notNull: true, default: 'NOVICE' },
    current_streak: { type: 'INTEGER', notNull: true, default: 0 },
    longest_streak: { type: 'INTEGER', notNull: true, default: 0 },
    unlocked_badges: { type: 'JSONB', notNull: true, default: '[]' },
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
  pgm.dropTable('gamifications');
};
