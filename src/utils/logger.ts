import { createLogger, format, transports } from 'winston';
import { blue, green, red, yellow, cyan, magenta } from 'colorette';

const logFormat = format.printf(({ level, message, timestamp, ...meta }) => {
  let coloredLevel = level;
  
  switch (level) {
    case 'error':
      coloredLevel = red(level.toUpperCase());
      break;
    case 'warn':
      coloredLevel = yellow(level.toUpperCase());
      break;
    case 'info':
      coloredLevel = green(level.toUpperCase());
      break;
    case 'debug':
      coloredLevel = blue(level.toUpperCase());
      break;
    default:
      coloredLevel = cyan(level.toUpperCase());
  }
  
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${magenta(timestamp as string)} [${coloredLevel}] ${String(message)}${metaString}`;
});

export const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
if (!existsSync('logs')) {
  mkdirSync('logs');
}