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
  pgm.createTable('otp_codes', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    email: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    otp: {
      type: 'VARCHAR(6)',
      notNull: true,
    },
    expired_at: {
      type: 'TIMESTAMP',
      notNull: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};
