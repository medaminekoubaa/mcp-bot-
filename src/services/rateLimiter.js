/**
 * Rate Limiter Service
 * Prevents abuse by limiting requests per user within time windows
 */

import { CONSTANTS } from '../constants.js';
import logger from './logger.js';

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.enabled = CONSTANTS.RATE_LIMIT.ENABLED;
    this.windowMs = CONSTANTS.RATE_LIMIT.WINDOW_MS;
    this.maxRequests = CONSTANTS.RATE_LIMIT.MAX_REQUESTS_PER_WINDOW;

    if (this.enabled) {
      setInterval(() => this.cleanup(), CONSTANTS.RATE_LIMIT.CLEANUP_INTERVAL);
      logger.info('RateLimiter', 'Rate limiting enabled');
    }
  }

  /**
   * Check if user has exceeded rate limit
   * @param {string} userId - User ID to check
   * @returns {Object} { allowed: boolean, remaining: number, resetTime: Date }
   */
  checkLimit(userId) {
    if (!this.enabled) {
      return { allowed: true, remaining: this.maxRequests, resetTime: null };
    }

    const now = Date.now();
    let userRequests = this.requests.get(userId);

    if (!userRequests || now - userRequests.windowStart > this.windowMs) {
      userRequests = { windowStart: now, count: 0 };
      this.requests.set(userId, userRequests);
    }

    const remaining = Math.max(0, this.maxRequests - userRequests.count);
    const resetTime = new Date(userRequests.windowStart + this.windowMs);

    if (userRequests.count >= this.maxRequests) {
      logger.warn('RateLimiter', `Rate limit exceeded for user ${userId}`);
      return { allowed: false, remaining: 0, resetTime };
    }

    userRequests.count++;
    return { allowed: true, remaining: remaining - 1, resetTime: null };
  }

  /**
   * Reset rate limit for a user
   */
  reset(userId) {
    this.requests.delete(userId);
  }

  /**
   * Cleanup old entries
   * @private
   */
  cleanup() {
    const now = Date.now();
    const entriesToDelete = [];

    for (const [userId, data] of this.requests.entries()) {
      if (now - data.windowStart > this.windowMs * 2) {
        entriesToDelete.push(userId);
      }
    }

    entriesToDelete.forEach(userId => this.requests.delete(userId));
    if (entriesToDelete.length > 0) {
      logger.debug('RateLimiter', `Cleaned up ${entriesToDelete.length} expired entries`);
    }
  }

  /**
   * Get rate limit stats (admin use)
   */
  getStats() {
    return {
      enabled: this.enabled,
      activeUsers: this.requests.size,
      windowMs: this.windowMs,
      maxRequests: this.maxRequests,
    };
  }
}

export default new RateLimiter();
