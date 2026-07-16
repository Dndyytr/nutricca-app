export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('weight_logs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    weight_kg: { type: 'FLOAT', notNull: true },
    log_date: { type: 'DATE', notNull: true },
    note: { type: 'TEXT', notNull: false },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('weight_logs', 'weight_logs_user_date_unique', 'UNIQUE(user_id, log_date)');
};

export const down = (pgm) => {
  pgm.dropTable('weight_logs');
};
