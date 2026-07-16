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
  pgm.createTable('weekly_run', {
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
    // Kolom level yang baru ditambahkan
    level: {
      type: 'TEXT', // Ubah ke 'TEXT' jika level berupa string
      notNull: true,
      default: 1,
    },
    // Target lari mingguan (berdasarkan teks "Weekly target: 12 km")
    target_distance: {
      type: 'FLOAT',
      notNull: true,
      default: 12.0,
    },
    // Input jarak lari harian (Mon - Sun)
    mon: {
      type: 'FLOAT',
      notNull: true,
      default: 0,
    },
    tue: {
      type: 'FLOAT',
      notNull: true,
      default: 0,
    },
    wed: {
      type: 'FLOAT',
      notNull: true,
      default: 0,
    },
    thu: {
      type: 'FLOAT',
      notNull: true,
      default: 0,
    },
    fri: {
      type: 'FLOAT',
      notNull: true,
      default: 0,
    },
    sat: {
      type: 'FLOAT',
      notNull: true,
      default: 0,
    },
    sun: {
      type: 'FLOAT',
      notNull: true,
      default: 0,
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
  // Menghapus tabel jika dilakukan rollback (migrate down)
  pgm.dropTable('weekly_run');
};
