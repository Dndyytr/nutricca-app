export const up = (pgm) => {
  pgm.sql(`
    WITH weekly_days AS (
      SELECT DISTINCT
        uwa.user_id,
        (uwa.week_start_date + ap.day_of_week)::date AS log_date
      FROM activity_progress ap
      JOIN user_weekly_activities uwa ON uwa.id = ap.user_activity_id
      WHERE ap.completed = true
        AND (uwa.week_start_date + ap.day_of_week)::date <= CURRENT_DATE
    )
    INSERT INTO daily_logs (id, user_id, log_date)
    SELECT
      'daily-sync-' || md5(wd.user_id || wd.log_date::text),
      wd.user_id,
      wd.log_date
    FROM weekly_days wd
    ON CONFLICT (user_id, log_date) DO NOTHING;

    UPDATE daily_logs dl
    SET total_calories_out =
      COALESCE((
        SELECT SUM(al.calories_burned)
        FROM activity_logs al
        WHERE al.daily_log_id = dl.id
      ), 0) +
      COALESCE((
        SELECT SUM(ap.calories_burned)
        FROM activity_progress ap
        JOIN user_weekly_activities uwa ON uwa.id = ap.user_activity_id
        WHERE uwa.user_id = dl.user_id
          AND ap.completed = true
          AND (uwa.week_start_date + ap.day_of_week)::date = dl.log_date
      ), 0),
      updated_at = CURRENT_TIMESTAMP
    WHERE EXISTS (
      SELECT 1
      FROM activity_progress ap
      JOIN user_weekly_activities uwa ON uwa.id = ap.user_activity_id
      WHERE uwa.user_id = dl.user_id
        AND ap.completed = true
        AND (uwa.week_start_date + ap.day_of_week)::date = dl.log_date
        AND dl.log_date <= CURRENT_DATE
    );
  `);
};

export const down = () => {};
