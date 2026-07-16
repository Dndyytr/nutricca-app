import response from '../utils/response.js';
import { ClientError } from '../exceptions/index.js';
import logger from '../utils/logger.js'; // Pastikan path import ini sesuai

const ErrorHandler = (error, req, res, next) => {
  const requestDetails = `${req.originalUrl} - ${req.method} - ${req.ip}`;

  // 1. Error dari input/aktivitas User (misal: password salah, data tidak ditemukan)
  if (error instanceof ClientError) {
    logger.warn(
      `ClientError (${error.statusCode}): ${error.message} - ${requestDetails}`,
    );
    return response(res, error.statusCode, error.message, null);
  }

  // 2. Error dari Validasi Skema Joi (misal: format email salah)
  if (error.isJoi) {
    const joiMessage = error.details.map((detail) => detail.message).join(', ');
    logger.warn(`ValidationError (400): ${joiMessage} - ${requestDetails}`);
    return response(res, 400, error.details[0].message, null);
  }

  // 3. Error Fatal dari Sistem/Server (misal: database mati, kode crash)
  const status = error.statusCode || error.status || 500;
  const message = error.message || 'Internal Server Error';

  logger.error(
    `Unhandled System Error (${status}): ${message} - ${requestDetails}`,
    error,
  );

  return response(res, status, message, null);
};

export default ErrorHandler;
