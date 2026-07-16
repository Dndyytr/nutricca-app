import cron from 'node-cron';
import DailyLogRepository from '../services/daily_logs/repositories/daily_logs-repositories.js';
import GamificationRepository from '../services/gamifications/repositories/gamification-repositories.js';

const calculateSleepHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let startTotalMinutes = startHour * 60 + startMin;
  let endTotalMinutes = endHour * 60 + endMin;

  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  return (endTotalMinutes - startTotalMinutes) / 60;
};

export const startDailyEvaluator = () => {
  cron.schedule(
    '59 23 * * *',
    async () => {
      console.log('⏳ [CRON] Starting daily batch evaluation...');

      try {
        const today = new Date().toLocaleDateString('en-CA', {
          timeZone: 'Asia/Jakarta',
        });

        const logsToday = await DailyLogRepository.getAllLogsByDate(today);
        console.log(
          `[CRON] Found ${logsToday.length} logs to evaluate today (${today}).`,
        );

        for (const log of logsToday) {
          try {
            let score = 0;
            // Assuming the pg driver returns columns in snake_case
            if (log.total_water_ml >= 2000) score++;
            if (log.total_steps >= 8000) score++;
            if (log.total_calories_out > 0) score++;
            if (log.total_calories_in >= 1800 && log.total_calories_in <= 2200)
              score++;

            const sleepDuration = calculateSleepHours(
              log.sleep_start_time,
              log.sleep_end_time,
            );
            if (sleepDuration >= 7) score++;

            let dailyStatus = 'POOR';
            if (score === 3 || score === 4) dailyStatus = 'MEDIUM';
            if (score === 5) dailyStatus = 'EXCELLENT';

            // Using the new dedicated repository method
            await DailyLogRepository.updateDailyEvaluation(
              log.id,
              score,
              dailyStatus,
            );

            if (dailyStatus === 'EXCELLENT') {
              await GamificationRepository.addStreak(log.user_id);
              console.log(
                `[CRON] User ${log.user_id} achieved EXCELLENT. Streak incremented!`,
              );
            } else {
              await GamificationRepository.resetStreak(log.user_id);
              console.log(
                `[CRON] User ${log.user_id} achieved ${dailyStatus}. Streak reset.`,
              );
            }
          } catch (userError) {
            console.error(
              `[CRON] Failed to evaluate User ID: ${log.user_id}:`,
              userError.message,
            );
          }
        }

        console.log('[CRON] Daily evaluation batch completed successfully.');
      } catch (globalError) {
        console.error(
          '[CRON] Fatal system failure in global cron execution:',
          globalError,
        );
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Jakarta',
    },
  );
};
