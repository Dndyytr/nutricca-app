export const up = (pgm) => {
  pgm.addColumns('user_weekly_activities', {
    exercise_level: { type: 'varchar(50)' },
    cardio_level: { type: 'varchar(50)' },
  });
  pgm.sql(`
    UPDATE user_weekly_activities
    SET exercise_level = level, cardio_level = level
    WHERE exercise_level IS NULL OR cardio_level IS NULL
  `);
};

export const down = (pgm) => {
  pgm.dropColumns('user_weekly_activities', [
    'exercise_level',
    'cardio_level',
  ]);
};
