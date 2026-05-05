/**
 * Logger Service - Centralized Logging
 * Tech Lead Pattern: Unified logging with timestamps, levels, and context
 */

import { CONSTANTS } from '../constants.js';

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || CONSTANTS.LOG_LEVELS.INFO;
    this.enableConsole = process.env.ENABLE_CONSOLE_LOG !== 'false';
  }

  /**
   * Get color codes for console output
   */
  getColor(level) {
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
    };
    return colors[level] || '';
  }

  /**
   * Reset color code
   */
  resetColor() {
    return '\x1b[0m';
  }

  /**
   * Format timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Log with formatted output
   */
  log(level, service, message, data = null) {
    const timestamp = this.getTimestamp();
    const color = this.getColor(level);
    const reset = this.resetColor();

    const logMessage = `${color}[${timestamp}] [${level}] [${service}]${reset} ${message}`;

    if (this.enableConsole) {
      if (data) {
        console.log(logMessage, JSON.stringify(data, null, 2));
      } else {
        console.log(logMessage);
      }
    }

    // Store in log file if needed (for production)
    this.writeToFile(timestamp, level, service, message, data);
  }

  /**
   * Write to log file (placeholder for production)
   */
  writeToFile(timestamp, level, service, message, data) {
    // TODO: Implement file-based logging for production
    // Could use winston, pino, or similar
  }

  // Convenience methods
  debug(service, message, data) {
    this.log(CONSTANTS.LOG_LEVELS.DEBUG, service, message, data);
  }

  info(service, message, data) {
    this.log(CONSTANTS.LOG_LEVELS.INFO, service, message, data);
  }

  warn(service, message, data) {
    this.log(CONSTANTS.LOG_LEVELS.WARN, service, message, data);
  }

  error(service, message, data) {
    this.log(CONSTANTS.LOG_LEVELS.ERROR, service, message, data);
  }

  /**
   * Log API call
   */
  logAPICall(method, endpoint, statusCode, duration) {
    this.info('API', `${method} ${endpoint} - ${statusCode}ms`, { duration });
  }

  /**
   * Log database operation
   */
  logDBOperation(operation, collection, duration, success = true) {
    const status = success ? '✅' : '❌';
    this.info('Database', `${status} ${operation} on ${collection}`, { duration });
  }

  /**
   * Log bot event
   */
  logBotEvent(event, userId, details) {
    this.info('Bot', `Event: ${event} - User: ${userId}`, details);
  }
}

export default new Logger();
