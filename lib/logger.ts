// ─────────────────────────────────────────────
//  SERVER-SIDE LOGGER
//  Winston instance — only runs in Node.js (API routes, server components).
//  Never import this in 'use client' files; import loggingService instead.
// ─────────────────────────────────────────────
import 'server-only'
import winston from 'winston'

const { combine, timestamp, errors, json, colorize, simple } = winston.format

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service:     'sentiquant-frontend',
    environment: process.env.NODE_ENV,
  },
  transports: [],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(colorize(), simple()),
  }))
}

if (process.env.NODE_ENV === 'production') {
  // Console in production so logs surface in container / cloud stdout
  logger.add(new winston.transports.Console({ format: json() }))

  // Daily rotating file logs — only added when the package is available
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DailyRotateFile = require('winston-daily-rotate-file')

    logger.add(new DailyRotateFile({
      filename:    'logs/frontend-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize:     '20m',
      maxFiles:    '14d',
    }))

    logger.add(new DailyRotateFile({
      filename:    'logs/frontend-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level:       'error',
      maxSize:     '20m',
      maxFiles:    '30d',
    }))
  } catch {
    // winston-daily-rotate-file unavailable (e.g. serverless env) — file logging disabled
  }
}

export default logger
