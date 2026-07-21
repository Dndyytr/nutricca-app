import response from '../../../utils/response.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import AuthorizationError from '../../../exceptions/authorization-error.js';
import * as MasterExercisesRepo from '../repositories/master_exercises.js';
import * as MasterCardiosRepo from '../repositories/master_cardios.js';
import * as UserWeeklyActivitiesRepo from '../repositories/user_weekly_activities.js';
import * as ActivityProgressRepo from '../repositories/activity_progress.js';

/**
 * Pastikan weekly activity ini milik user yang login.
 */
const verifyActivityOwnership = async (activityId, userId) => {
  const ownerId = await UserWeeklyActivitiesRepo.getActivityOwner(activityId);

  if (!ownerId) {
    throw new NotFoundError('Weekly activity not found');
  }
  if (ownerId !== userId) {
    throw new AuthorizationError(
      'You are not allowed to access this weekly activity',
    );
  }
};

// --- MASTER DATA ---

export const getMasterExercisesHandler = async (req, res, next) => {
  try {
    const exercises = await MasterExercisesRepo.getAllMasterExercises();
    return response(res, 200, 'Master exercises retrieved successfully', {
      exercises,
    });
  } catch (error) {
    next(error);
  }
};

export const getMasterCardiosHandler = async (req, res, next) => {
  try {
    const cardios = await MasterCardiosRepo.getAllMasterCardios();
    return response(res, 200, 'Master cardios retrieved successfully', {
      cardios,
    });
  } catch (error) {
    next(error);
  }
};

// --- USER WEEKLY ACTIVITY ---

export const postUserWeeklyActivityHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      level,
      week_start_date,
      selected_exercise_ids,
      selected_cardio_ids,
    } = req.validated;

    const activity = await UserWeeklyActivitiesRepo.createUserWeeklyActivity(
      userId,
      level,
      week_start_date,
      selected_exercise_ids,
      selected_cardio_ids,
    );

    return response(res, 201, 'Weekly activity created successfully', {
      activity,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserWeeklyActivityHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (Number.isNaN(Number(id))) {
      throw new NotFoundError('Weekly activity not found');
    }

    await verifyActivityOwnership(id, userId);
    const activity = await UserWeeklyActivitiesRepo.getUserWeeklyActivity(id);

    if (!activity) {
      throw new NotFoundError('Weekly activity not found');
    }

    return response(res, 200, 'Weekly activity retrieved successfully', {
      activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ambil weekly activity milik user untuk minggu berjalan, lengkap dengan
 * ringkasan progress per exercise/cardio (buat render halaman Weekly Activity).
 * Kalau user belum bikin weekly activity minggu ini, balikin activity: null
 * (bukan 404) supaya frontend bisa nampilin state "belum ada aktivitas, ayo pilih".
 */
export const getCurrentUserWeeklyActivityHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activity =
      await UserWeeklyActivitiesRepo.getCurrentWeeklyActivityByUserId(userId);

    return response(
      res,
      200,
      'Current weekly activity retrieved successfully',
      { activity },
    );
  } catch (error) {
    next(error);
  }
};

export const putCurrentWeeklyExercisesHandler = async (req, res, next) => {
  try {
    const activity = await UserWeeklyActivitiesRepo.upsertCurrentWeeklyExercises(
      req.user.id,
      req.validated.level,
      req.validated.selected_exercise_ids,
    );
    return response(res, 200, 'Weekly exercises saved successfully', { activity });
  } catch (error) {
    next(error);
  }
};

export const putCurrentWeeklyCardiosHandler = async (req, res, next) => {
  try {
    const activity = await UserWeeklyActivitiesRepo.upsertCurrentWeeklyCardios(
      req.user.id,
      req.validated.level,
      req.validated.selected_cardio_ids,
    );
    return response(res, 200, 'Weekly cardios saved successfully', { activity });
  } catch (error) {
    next(error);
  }
};

export const putUserWeeklyActivityHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await verifyActivityOwnership(id, userId);
    const activity = await UserWeeklyActivitiesRepo.updateUserWeeklyActivity(
      id,
      req.validated,
    );

    return response(res, 200, 'Weekly activity updated successfully', {
      activity,
    });
  } catch (error) {
    next(error);
  }
};

// --- ACTIVITY PROGRESS ---

export const getActivityProgressHandler = async (req, res, next) => {
  try {
    const { activity_id: activityId } = req.params;
    const userId = req.user.id;

    await verifyActivityOwnership(activityId, userId);

    const progress = await ActivityProgressRepo.getActivityProgress(activityId);
    const totalCaloriesBurned =
      await ActivityProgressRepo.getTotalCaloriesBurned(activityId);

    return response(res, 200, 'Activity progress retrieved successfully', {
      progress,
      summary: { total_calories_burned: totalCaloriesBurned },
    });
  } catch (error) {
    next(error);
  }
};

export const postActivityProgressHandler = async (req, res, next) => {
  try {
    const { activity_id: activityId } = req.params;
    const userId = req.user.id;

    await verifyActivityOwnership(activityId, userId);
    const progress = await ActivityProgressRepo.createActivityProgress(
      activityId,
      req.validated,
    );

    return response(res, 201, 'Activity progress created successfully', {
      progress,
    });
  } catch (error) {
    next(error);
  }
};

export const putActivityProgressHandler = async (req, res, next) => {
  try {
    const { activity_id: activityId, progress_id: progressId } = req.params;
    const userId = req.user.id;

    await verifyActivityOwnership(activityId, userId);
    const progress = await ActivityProgressRepo.updateActivityProgress(
      progressId,
      req.validated,
    );

    return response(res, 200, 'Activity progress updated successfully', {
      progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ringkasan satu weekly activity per baris, termasuk minggu tanpa progress.
 */
export const getActivityHistoryHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, offset } = req.pagination;
    const { startDate, endDate, search, sort = 'newest' } = req.query;

    const result = await ActivityProgressRepo.getWeeklyActivityHistoryByUserId(
      userId,
      limit,
      offset,
      { startDate, endDate, search },
      sort,
    );

    const totalPages = result.total > 0 ? Math.ceil(result.total / limit) : 0;
    const showingFrom = result.total === 0 ? 0 : offset + 1;
    const showingTo = Math.min(offset + limit, result.total);

    return response(res, 200, 'Activity history retrieved successfully', {
      history: result.rows,
      meta: {
        page,
        limit,
        totalData: result.total,
        totalPages,
        showingText: `Showing ${showingFrom} to ${showingTo} of ${result.total} records`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMasterExercisesByLevelHandler = async (req, res, next) => {
  try {
    const { level } = req.params;
    const exercises = await MasterExercisesRepo.getMasterExerciseByLevel(level);

    return response(res, 200, 'Master exercises retrieved successfully', {
      exercises,
    });
  } catch (error) {
    next(error);
  }
};

export const getMasterCardioByLevelHandler = async (req, res, next) => {
  try {
    const { level } = req.params;
    const cardios = await MasterCardiosRepo.getMasterCardioByLevel(level);

    return response(res, 200, 'Master cardios retrieved successfully', {
      cardios,
    });
  } catch (error) {
    next(error);
  }
};
