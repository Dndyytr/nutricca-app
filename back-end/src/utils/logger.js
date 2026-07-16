import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom text format for the terminal output
const terminalFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Captures the full error stack trace
  ),
  transports: [
    // 1. Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: json(), // Production logs are best kept as clean JSON
    }),
    // 2. Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: json(),
    }),
  ],
});

// If we're not in production, also log to the console with pretty colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), terminalFormat),
    }),
  );
}

export default logger;
