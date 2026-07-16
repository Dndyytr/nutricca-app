import WeightLogRepository from '../repositories/weight_log-repositories.js';
import response from '../../../utils/response.js';

export const logWeight = async (req, res, next) => {
  const { id: userId } = req.user;
  const { weight_kg, log_date, note } = req.validated;
  try {
    const log = await WeightLogRepository.upsertWeightLog({ userId, weightKg: weight_kg, logDate: log_date, note });
    return response(res, 200, 'Weight log saved', { weight_log: log });
  } catch (err) { next(err); }
};

export const getWeightLogs = async (req, res, next) => {
  const { id: userId } = req.user;
  try {
    const logs = await WeightLogRepository.getWeightLogsByUserId(userId);
    return response(res, 200, 'Weight logs retrieved', { weight_logs: logs });
  } catch (err) { next(err); }
};
