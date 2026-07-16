import WeeklyActivitiesRepository from '../repositories/weekly_activities-repositories.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';

// --- WEEKLY RUN CONTROLLERS ---

export const getWeeklyRun = async (req, res, next) => {
  const userId = req.user?.id;
  const runData = await WeeklyActivitiesRepository.getWeeklyRunByUserId(userId);
  return response(res, 200, 'Weekly run data successfully retrieved', {
    weekly_run: runData,
  });
};

export const postWeeklyRun = async (req, res, next) => {
  const userId = req.user?.id;
  const {
    level,
    target_distance: targetDistance,
    mon,
    tue,
    wed,
    thu,
    fri,
    sat,
    sun,
  } = req.validated;

  const savedRun = await WeeklyActivitiesRepository.createWeeklyRun({
    userId,
    level,
    targetDistance,
    mon,
    tue,
    wed,
    thu,
    fri,
    sat,
    sun,
  });

  if (!savedRun)
    return next(new InvariantError('Failed to create weekly run data.'));
  return response(res, 201, 'Weekly run successfully created', {
    weekly_run: savedRun,
  });
};

export const putWeeklyRun = async (req, res, next) => {
  const userId = req.user?.id;
  const { id } = req.params; // Tangkap ID dari URL sesuai route frontend
  const {
    level,
    target_distance: targetDistance,
    mon,
    tue,
    wed,
    thu,
    fri,
    sat,
    sun,
  } = req.validated;

  const updatedRun = await WeeklyActivitiesRepository.updateWeeklyRunById(
    id,
    userId,
    {
      level,
      targetDistance,
      mon,
      tue,
      wed,
      thu,
      fri,
      sat,
      sun,
    },
  );

  if (!updatedRun)
    return next(new NotFoundError('Weekly run not found or failed to update.'));
  return response(res, 200, 'Weekly run successfully updated', {
    weekly_run: updatedRun,
  });
};

// --- WEEKLY EXERCISE CONTROLLERS ---

export const getWeeklyExercise = async (req, res, next) => {
  const userId = req.user?.id;
  const exerciseData =
    await WeeklyActivitiesRepository.getWeeklyExerciseByUserId(userId);
  return response(res, 200, 'Weekly exercise data successfully retrieved', {
    weekly_exercise: exerciseData,
  });
};

export const postWeeklyExercise = async (req, res, next) => {
  const userId = req.user?.id;
  const { level, exercises_data: exercisesData } = req.validated;

  const savedExercise = await WeeklyActivitiesRepository.createWeeklyExercise({
    userId,
    level,
    exercisesData,
  });

  if (!savedExercise)
    return next(new InvariantError('Failed to create weekly exercise data.'));
  return response(res, 201, 'Weekly exercise successfully created', {
    weekly_exercise: savedExercise,
  });
};

export const putWeeklyExercise = async (req, res, next) => {
  const userId = req.user?.id;
  const { id } = req.params; // Tangkap ID dari URL
  const { level, exercises_data: exercisesData } = req.validated;

  const updatedExercise =
    await WeeklyActivitiesRepository.updateWeeklyExerciseById(id, userId, {
      level,
      exercisesData,
    });

  if (!updatedExercise)
    return next(
      new NotFoundError('Weekly exercise not found or failed to update.'),
    );
  return response(res, 200, 'Weekly exercise successfully updated', {
    weekly_exercise: updatedExercise,
  });
};
