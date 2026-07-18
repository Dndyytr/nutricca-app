import * as MasterExercisesRepo from '../repositories/master_exercises.js';
import * as MasterCardiosRepo from '../repositories/master_cardios.js';
import * as UserWeeklyActivitiesRepo from '../repositories/user_weekly_activities.js';
import * as ActivityProgressRepo from '../repositories/activity_progress.js';
import {
  createWeeklyActivityPayloadSchema,
  updateWeeklyActivityPayloadSchema,
  activityProgressPayloadSchema,
} from '../validator/index.js';

// Get all master exercises
export const getMasterExercisesHandler = async (req, res, next) => {
  try {
    const exercises = await MasterExercisesRepo.getAllMasterExercises();
    res.status(200).json({
      status: 'success',
      message: 'Master exercises retrieved successfully',
      data: {
        exercises,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all master cardios
export const getMasterCardiosHandler = async (req, res, next) => {
  try {
    const cardios = await MasterCardiosRepo.getAllMasterCardios();
    res.status(200).json({
      status: 'success',
      message: 'Master cardios retrieved successfully',
      data: {
        cardios,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create user weekly activity
export const postUserWeeklyActivityHandler = async (req, res, next) => {
  try {
    const { error, value } = createWeeklyActivityPayloadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.details[0].message,
      });
    }

    const userId = req.user.id; // Assuming user is authenticated
    const activity = await UserWeeklyActivitiesRepo.createUserWeeklyActivity(
      userId,
      value.level,
      value.week_start_date,
      value.selected_exercise_ids,
      value.selected_cardio_ids,
    );

    res.status(201).json({
      status: 'success',
      message: 'Weekly activity created successfully',
      data: {
        activity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user weekly activity
export const getUserWeeklyActivityHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await UserWeeklyActivitiesRepo.getUserWeeklyActivity(id);

    if (!activity) {
      return res.status(404).json({
        status: 'fail',
        message: 'Weekly activity not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Weekly activity retrieved successfully',
      data: {
        activity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user weekly activity
export const putUserWeeklyActivityHandler = async (req, res, next) => {
  try {
    const { error, value } = updateWeeklyActivityPayloadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.details[0].message,
      });
    }

    const { id } = req.params;
    const activity = await UserWeeklyActivitiesRepo.updateUserWeeklyActivity(id, value);

    res.status(200).json({
      status: 'success',
      message: 'Weekly activity updated successfully',
      data: {
        activity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get activity progress for a weekly activity
export const getActivityProgressHandler = async (req, res, next) => {
  try {
    const { activity_id } = req.params;
    const progress = await ActivityProgressRepo.getActivityProgress(activity_id);
    const totalCaloriesBurned = await ActivityProgressRepo.getTotalCaloriesBurned(activity_id);

    res.status(200).json({
      status: 'success',
      message: 'Activity progress retrieved successfully',
      data: {
        progress,
        summary: {
          total_calories_burned: totalCaloriesBurned,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create activity progress
export const postActivityProgressHandler = async (req, res, next) => {
  try {
    const { error, value } = activityProgressPayloadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.details[0].message,
      });
    }

    const { activity_id } = req.params;
    const progress = await ActivityProgressRepo.createActivityProgress(activity_id, value);

    res.status(201).json({
      status: 'success',
      message: 'Activity progress created successfully',
      data: {
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update activity progress
export const putActivityProgressHandler = async (req, res, next) => {
  try {
    const { error, value } = activityProgressPayloadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.details[0].message,
      });
    }

    const { progress_id } = req.params;
    const progress = await ActivityProgressRepo.updateActivityProgress(progress_id, value);

    res.status(200).json({
      status: 'success',
      message: 'Activity progress updated successfully',
      data: {
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};
