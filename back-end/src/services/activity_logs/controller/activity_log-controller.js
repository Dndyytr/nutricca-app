import ActivityLogRepository from '../repositories/activity_log-repositories.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';

export const addActivityLog = async (req, res, next) => {
  const { id: userId } = req.user; // Diambil dari JWT Token
  const {
    daily_log_id: dailyLogId,
    activity_name: activityName,
    input_value: inputValue,
  } = req.validated;

  try {
    // 1. Cek apakah olahraga tersebut ada di master data
    const activityMaster =
      await ActivityLogRepository.getActivityMasterByName(activityName);
    if (!activityMaster) {
      return next(
        new InvariantError(
          `Aktivitas '${activityName}' tidak dikenali sistem.`,
        ),
      );
    }

    // 2. Validasi Limit 12km per minggu (Khusus lari & jalan)
    if (activityMaster.category === 'weekly_run') {
      const currentDistance =
        await ActivityLogRepository.getCurrentWeeklyRunDistance(userId);
      const limit = 12; // Batasan mingguan dalam KM

      if (currentDistance + inputValue > limit) {
        const remaining = limit - currentDistance;
        return next(
          new InvariantError(
            `Target lari/jalan mingguan akan terlampaui! Sisa jarak yang diizinkan minggu ini: ${remaining > 0 ? remaining.toFixed(2) : 0} km.`,
          ),
        );
      }
    }

    // 3. Kalkulasi Kalori: $calories\_burned = input\_value \times calories\_per\_unit$
    const caloriesBurned = inputValue * activityMaster.calories_per_unit;

    // 4. Simpan ke database
    const newActivity = await ActivityLogRepository.addActivityLog({
      dailyLogId,
      activityId: activityMaster.id,
      inputValue,
      caloriesBurned,
    });

    if (!newActivity) {
      return next(new InvariantError('Gagal menambahkan catatan aktivitas.'));
    }

    // 5. Sinkronisasi (Tambahkan) kalori ke tabel daily_logs
    await ActivityLogRepository.updateDailyCaloriesOut(
      dailyLogId,
      caloriesBurned,
      true,
    );

    return response(
      res,
      201,
      'Aktivitas berhasil dicatat dan kalori telah diperbarui',
      {
        id: newActivity.id,
        calories_burned: caloriesBurned,
      },
    );
  } catch (error) {
    next(error);
  }
};

export const getActivitiesByDailyLogId = async (req, res, next) => {
  try {
    const { daily_log_id: dailyLogId } = req.params;
    const activityLogs =
      await ActivityLogRepository.getActivitiesByDailyLogId(dailyLogId);

    if (!activityLogs || activityLogs.length === 0) {
      return response(res, 200, 'Belum ada aktivitas yang dicatat hari ini', {
        activityLogs: [],
      });
    }

    return response(res, 200, 'Data aktivitas berhasil dimuat', {
      activityLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActivityLogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Hapus aktivitas dan ambil data kalorinya
    const deletedLog = await ActivityLogRepository.deleteActivityLogById(id);

    if (!deletedLog) {
      return next(new NotFoundError('Data aktivitas tidak ditemukan.'));
    }

    // 2. Sinkronisasi (Kurangi) kalori dari tabel daily_logs agar seimbang
    await ActivityLogRepository.updateDailyCaloriesOut(
      deletedLog.daily_log_id,
      deletedLog.calories_burned,
      false, // false = melakukan operasi pengurangan (minus)
    );

    return response(res, 200, 'Aktivitas berhasil dihapus', {
      id: deletedLog.id,
    });
  } catch (error) {
    next(error);
  }
};
