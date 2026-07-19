import { Pool } from 'pg';
import * as MasterExercisesRepo from '../repositories/master_exercises.js';
import * as MasterCardiosRepo from '../repositories/master_cardios.js';
import * as UserWeeklyActivitiesRepo from '../repositories/user_weekly_activities.js';
import * as ActivityProgressRepo from '../repositories/activity_progress.js';
import {
  createWeeklyActivityPayloadSchema,
  updateWeeklyActivityPayloadSchema,
  activityProgressPayloadSchema,
} from '../validator/index.js';
import e from 'express';

const pool = new Pool();

/**
 * Verify that activity belongs to authenticated user
 * Prevents unauthorized access to other users' activities
 */
const verifyActivityOwnership = async (activityId, userId) => {
  const query = `SELECT user_id FROM user_weekly_activities WHERE id = $1`;
  const result = await pool.query(query, [activityId]);

  if (result.rows.length === 0) {
    const error = new Error('Activity not found');
    error.statusCode = 404;
    throw error;
  }

  if (result.rows[0].user_id !== userId) {
    const error = new Error('Unauthorized access');
    error.statusCode = 403;
    throw error;
  }

  return true;
};

/**
 * Verify that progress belongs to activity and activity belongs to user
 */
const verifyProgressOwnership = async (progressId, userId) => {
  const query = `
    SELECT ap.id, uwa.user_id
    FROM activity_progress ap
    JOIN user_weekly_activities uwa ON ap.user_activity_id = uwa.id
    WHERE ap.id = $1
  `;
  const result = await pool.query(query, [progressId]);

  if (result.rows.length === 0) {
    const error = new Error('Progress not found');
    error.statusCode = 404;
    throw error;
  }

  if (result.rows[0].user_id !== userId) {
    const error = new Error('Unauthorized access');
    error.statusCode = 403;
    throw error;
  }

  return true;
};

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

export const getMasterExercisesByLevelHandler = async (req, res, next) => {
  try {
    const { level } = req.params;
    const exercises = await MasterExercisesRepo.getMasterExerciseByLevel(level);
    res.status(200).json({
      status: 'success',
      message: `Master exercises for level ${level} retrieved successfully`,
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
export const getMasterCardiosByLevelHandler = async (req, res, next) => {
  try {
    const { level } = req.params;
    const cardios = await MasterCardiosRepo.getMasterCardioByLevel(level);
    res.status(200).json({
      status: 'success',
      message: `Master cardios for level ${level} retrieved successfully`,
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
    const { error, value } = createWeeklyActivityPayloadSchema.validate(
      req.body,
    );
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.details[0].message,
      });
    }

    const userId = req.user.id;
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
    const userId = req.user.id;

    if (isNaN(id)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Weekly activity not found',
      });
    }

    // Verify ownership
    await verifyActivityOwnership(id, userId);

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
    if (error.statusCode === 403) {
      return res.status(403).json({
        status: 'fail',
        message: error.message,
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'fail',
        message: error.message,
      });
    }
    next(error);
  }
};

// Update user weekly activity
export const putUserWeeklyActivityHandler = async (req, res, next) => {
  try {
    const { error, value } = updateWeeklyActivityPayloadSchema.validate(
      req.body,
    );
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.details[0].message,
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    await verifyActivityOwnership(id, userId);

    const activity = await UserWeeklyActivitiesRepo.updateUserWeeklyActivity(
      id,
      value,
    );

    res.status(200).json({
      status: 'success',
      message: 'Weekly activity updated successfully',
      data: {
        activity,
      },
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return res.status(403).json({
        status: 'fail',
        message: error.message,
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'fail',
        message: error.message,
      });
    }
    next(error);
  }
};

// Get activity progress for a weekly activity
export const getActivityProgressHandler = async (req, res, next) => {
  try {
    const { activity_id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    await verifyActivityOwnership(activity_id, userId);

    const progress =
      await ActivityProgressRepo.getActivityProgress(activity_id);
    const totalCaloriesBurned =
      await ActivityProgressRepo.getTotalCaloriesBurned(activity_id);

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
    if (error.statusCode === 403) {
      return res.status(403).json({
        status: 'fail',
        message: error.message,
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'fail',
        message: error.message,
      });
    }
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
    const userId = req.user.id;

    // Verify ownership
    await verifyActivityOwnership(activity_id, userId);

    const progress = await ActivityProgressRepo.createActivityProgress(
      activity_id,
      value,
    );

    res.status(201).json({
      status: 'success',
      message: 'Activity progress created successfully',
      data: {
        progress,
      },
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return res.status(403).json({
        status: 'fail',
        message: error.message,
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'fail',
        message: error.message,
      });
    }
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
    const userId = req.user.id;

    // Verify ownership
    await verifyProgressOwnership(progress_id, userId);

    const progress = await ActivityProgressRepo.updateActivityProgress(
      progress_id,
      value,
    );

    res.status(200).json({
      status: 'success',
      message: 'Activity progress updated successfully',
      data: {
        progress,
      },
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return res.status(403).json({
        status: 'fail',
        message: error.message,
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'fail',
        message: error.message,
      });
    }
    next(error);
  }
};
