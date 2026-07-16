import DailyLogRepository from '../repositories/daily_logs-repositories.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';

export const getDailyLogByDate = async (req, res, next) => {
  const { id: userId } = req.user;
  const { date: logDate } = req.query;

  if (!logDate) {
    return next(
      new InvariantError(
        'Please include the ?date=YYYY-MM-DD parameter in the URL.',
      ),
    );
  }

  try {
    let dailyLog = await DailyLogRepository.getDailyLogByDate(userId, logDate);

    // LAZY INITIALIZATION: Otomatis buat log kosongan yang aman jika belum ada
    if (!dailyLog) {
      dailyLog = await DailyLogRepository.addDailyLog({
        userId,
        logDate,
      });
    }

    return response(res, 200, 'Daily log retrieved successfully', { dailyLog });
  } catch (error) {
    next(error);
  }
};

export const updateDailyLog = async (req, res, next) => {
  const { id: userId } = req.user;
  const { id } = req.params;

  const {
    log_date: logDate,
    total_water_ml: totalWaterMl,
    sleep_start_time: sleepStartTime,
    sleep_end_time: sleepEndTime,
    total_calories_in: totalCaloriesIn,
    total_calories_out: totalCaloriesOut,
    total_steps: totalSteps,
    daily_score: dailyScore,
    daily_status: dailyStatus,
  } = req.validated;

  try {
    // 1. Ambil data log lama untuk verifikasi kepemilikan dan basis tanggal
    const existingLog = await DailyLogRepository.getDailyLogById(id);
    if (!existingLog || existingLog.user_id !== userId) {
      return next(
        new NotFoundError('Daily log not found or you do not have permission.'),
      );
    }

    // 2. Tentukan basis tanggal untuk format TIMESTAMP jam tidur
    let baseDateString;
    if (logDate) {
      baseDateString =
        logDate instanceof Date ? logDate.toISOString().split('T')[0] : logDate;
    } else {
      baseDateString =
        existingLog.log_date instanceof Date
          ? existingLog.log_date.toISOString().split('T')[0]
          : existingLog.log_date;
    }

    // 3. Format string jam tidur secara dinamis
    const formattedSleepStart = sleepStartTime
      ? `${baseDateString} ${sleepStartTime}:00`
      : undefined;
    const formattedSleepEnd = sleepEndTime
      ? `${baseDateString} ${sleepEndTime}:00`
      : undefined;

    // 4. Kirim pembaruan ke database
    const updatedLog = await DailyLogRepository.updateDailyLog(id, userId, {
      totalWaterMl,
      sleepStartTime: formattedSleepStart,
      sleepEndTime: formattedSleepEnd,
      totalCaloriesIn,
      totalCaloriesOut,
      totalSteps,
      dailyScore,
      dailyStatus,
    });

    if (!updatedLog) {
      return next(new InvariantError('Failed to update daily log.'));
    }

    return response(res, 200, 'Daily log successfully updated', {
      dailyLog: updatedLog,
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyLogsByUserId = async (req, res, next) => {
  const { id: userId } = req.user;
  try {
    const dailyLogs = await DailyLogRepository.getDailyLogByUserId(userId);
    return response(res, 200, 'Daily log history successfully retrieved', {
      dailyLogs: dailyLogs || [],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDailyLog = async (req, res, next) => {
  const { id: userId } = req.user;
  const { id } = req.params;
  try {
    const deletedLog = await DailyLogRepository.deleteDailyLog(id, userId);
    if (!deletedLog) {
      return next(new NotFoundError('Daily log not found or unauthorized.'));
    }
    return response(res, 200, 'Daily log successfully deleted');
  } catch (error) {
    next(error);
  }
};
