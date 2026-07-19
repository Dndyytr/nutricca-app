export const up = async (pgm) => {
  // Create master_exercises table
  pgm.createTable('master_exercises', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    type: {
      type: 'varchar(100)',
      notNull: true,
      comment: 'e.g., push_up, pull_up, plank, etc',
    },
    icon_url: {
      type: 'varchar(500)',
      isNull: true,
      comment: 'URL to exercise icon (will be filled manually)',
    },
    description: {
      type: 'text',
      isNull: true,
    },
    target_reps: {
      type: 'int',
      isNull: true,
      comment: 'Target repetitions per session',
    },
    calories_per_unit: {
      type: 'float',
      notNull: true,
      default: 0,
      comment: 'Calories burned per repetition',
    },
    duration_days: {
      type: 'int',
      notNull: true,
      default: 5,
      comment: 'How many days per week to do this exercise',
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create master_cardios table
  pgm.createTable('master_cardios', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    type: {
      type: 'varchar(100)',
      notNull: true,
      comment: 'e.g., running, walking, mountain_climbing, etc',
    },
    icon_url: {
      type: 'varchar(500)',
      isNull: true,
      comment: 'URL to cardio icon (will be filled manually)',
    },
    description: {
      type: 'text',
      isNull: true,
    },
    target_distance: {
      type: 'float',
      isNull: true,
      comment: 'Target distance in KM per session',
    },
    calories_per_unit: {
      type: 'float',
      notNull: true,
      default: 0,
      comment: 'Calories burned per KM',
    },
    duration_days: {
      type: 'int',
      notNull: true,
      default: 5,
      comment: 'How many days per week to do this cardio',
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create user_weekly_activities table
  pgm.createTable('user_weekly_activities', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_id: {
      type: 'int',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'cascade',
    },
    level: {
      type: 'varchar(50)',
      notNull: true,
      default: 'beginner',
      comment: 'beginner, intermediate, advanced',
    },
    week_start_date: {
      type: 'date',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create junction table for user selected exercises
  pgm.createTable('user_activity_exercises', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_activity_id: {
      type: 'int',
      notNull: true,
      references: '"user_weekly_activities"(id)',
      onDelete: 'cascade',
    },
    exercise_id: {
      type: 'int',
      notNull: true,
      references: '"master_exercises"(id)',
      onDelete: 'cascade',
    },
  });

  // Add unique constraint for exercise selection
  pgm.addConstraint('user_activity_exercises', 'unique_activity_exercise', {
    unique: ['user_activity_id', 'exercise_id'],
  });

  // Create junction table for user selected cardios
  pgm.createTable('user_activity_cardios', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_activity_id: {
      type: 'int',
      notNull: true,
      references: '"user_weekly_activities"(id)',
      onDelete: 'cascade',
    },
    cardio_id: {
      type: 'int',
      notNull: true,
      references: '"master_cardios"(id)',
      onDelete: 'cascade',
    },
  });

  // Add unique constraint for cardio selection
  pgm.addConstraint('user_activity_cardios', 'unique_activity_cardio', {
    unique: ['user_activity_id', 'cardio_id'],
  });

  // Create activity progress table with calories_burned field
  pgm.createTable('activity_progress', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_activity_id: {
      type: 'int',
      notNull: true,
      references: '"user_weekly_activities"(id)',
      onDelete: 'cascade',
    },
    exercise_id: {
      type: 'int',
      isNull: true,
      references: '"master_exercises"(id)',
      onDelete: 'cascade',
    },
    cardio_id: {
      type: 'int',
      isNull: true,
      references: '"master_cardios"(id)',
      onDelete: 'cascade',
    },
    day_of_week: {
      type: 'int',
      notNull: true,
      comment: '0=Sunday, 1=Monday, ..., 6=Saturday',
    },
    completed: {
      type: 'boolean',
      default: false,
    },
    reps_done: {
      type: 'int',
      isNull: true,
      comment: 'For exercises',
    },
    distance_done: {
      type: 'float',
      isNull: true,
      comment: 'For cardios, in KM',
    },
    calories_burned: {
      type: 'float',
      default: 0,
      comment: 'Auto-calculated: reps_done × exercise.calories_per_unit OR distance_done × cardio.calories_per_unit',
    },
    notes: {
      type: 'text',
      isNull: true,
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Add indexes for better query performance
  pgm.createIndex('user_weekly_activities', 'user_id');
  pgm.createIndex('user_weekly_activities', ['user_id', 'week_start_date']);
  pgm.createIndex('activity_progress', 'user_activity_id');
  pgm.createIndex('user_activity_exercises', 'user_activity_id');
  pgm.createIndex('user_activity_cardios', 'user_activity_id');
};

export const down = async (pgm) => {
  pgm.dropTable('activity_progress');
  pgm.dropTable('user_activity_cardios');
  pgm.dropTable('user_activity_exercises');
  pgm.dropTable('user_weekly_activities');
  pgm.dropTable('master_cardios');
  pgm.dropTable('master_exercises');
};
