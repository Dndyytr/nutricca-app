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
  pgm.createTable('nutrition_logs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    daily_log_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'daily_logs',
      onDelete: 'CASCADE',
    },
    // Kolom JSONB untuk menampung array of objects: [{ food_name: "...", meal_type: "..." }]
    meals: { type: 'JSONB', notNull: true, default: '[]' },

    // Rekapan total nutrisi harian
    total_calories: { type: 'FLOAT', notNull: true, default: 0 },
    total_protein_g: { type: 'FLOAT', notNull: true, default: 0 },
    total_carbs_g: { type: 'FLOAT', notNull: true, default: 0 },
    total_fat_g: { type: 'FLOAT', notNull: true, default: 0 },

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
  pgm.dropTable('nutrition_logs');
};
