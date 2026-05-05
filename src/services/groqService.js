/**
 * Groq API Service Wrapper
 * Handles all Groq AI interactions with error handling, retry logic, caching, and key rotation
 * Tech Lead Pattern: Service abstraction for external API calls with failover
 */

import fetch from 'node-fetch';
import { CONSTANTS } from '../constants.js';
import systemContextLoader from './systemContextLoader.js';
import logger from './logger.js';

class GroqService {
  constructor() {
    this.apiKeys = CONSTANTS.GROQ.API_KEYS;
    this.currentKeyIndex = 0;
    this.apiUrl = CONSTANTS.GROQ.API_URL;
    this.model = CONSTANTS.GROQ.MODEL;
    this.cache = new Map();
    this.cacheSize = 0;

    this.quotaErrors = new Map();

    logger.info('GroqService', `Initialized with ${this.apiKeys.length} API keys`);
  }

  /**
   * Add item to bounded cache
   * @private
   */
  addToCache(key, value) {
    const itemSize = JSON.stringify(value).length;

    if (itemSize > CONSTANTS.CACHE.MAX_CACHE_ITEM_SIZE) {
      logger.warn('GroqService', `Cache item too large: ${itemSize} bytes, skipping cache`);
      return;
    }

    if (this.cache.size >= CONSTANTS.CACHE.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      const removedItem = this.cache.get(firstKey);
      this.cacheSize -= JSON.stringify(removedItem).length;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
    this.cacheSize += itemSize;
  }

  getCurrentKey() {
    if (!this.apiKeys || this.apiKeys.length === 0) {
      throw new Error('No Groq API keys configured');
    }
    const key = this.apiKeys[this.currentKeyIndex];
    return key;
  }

  rotateKey() {
    const previousIndex = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    const newKey = this.apiKeys[this.currentKeyIndex];
    logger.debug('GroqService', `Rotated from key ${previousIndex + 1} to key ${this.currentKeyIndex + 1}`);
    return newKey;
  }

  markKeyQuotaError(keyIndex) {
    const now = Date.now();
    this.quotaErrors.set(keyIndex, now);
    const resetTime = new Date(now + CONSTANTS.GROQ.QUOTA_RESET_HOURS * 3600000).toISOString();
    logger.warn('GroqService', `Key ${keyIndex + 1} quota limited, reset at ${resetTime}`);
  }

  isKeyInQuotaTimeout(keyIndex) {
    if (!this.quotaErrors.has(keyIndex)) return false;
    const errorTime = this.quotaErrors.get(keyIndex);
    const resetTime = errorTime + (CONSTANTS.GROQ.QUOTA_RESET_HOURS * 3600000);
    if (Date.now() < resetTime) return true;
    this.quotaErrors.delete(keyIndex);
    logger.info('GroqService', `Key ${keyIndex + 1} quota timeout expired`);
    return false;
  }

  findAvailableKeyIndex() {
    for (let i = 0; i < this.apiKeys.length; i++) {
      if (!this.isKeyInQuotaTimeout(i)) return i;
    }
    return -1;
  }

  getCacheKey(prompt, systemPrompt) {
    return `${systemPrompt.substring(0, 20)}_${prompt.substring(0, 30)}`.replace(/\s+/g, '_');
  }

  isCacheValid(key, ttl) {
    if (!this.cache.has(key)) return false;
    const { timestamp } = this.cache.get(key);
    return Date.now() - timestamp < ttl * 1000;
  }

  async getResponse(
    userMessage,
    systemPrompt = CONSTANTS.PROMPTS.DAILY_SUMMARIZER,
    temperature = CONSTANTS.GROQ.DEFAULT_TEMPERATURE,
    maxTokens = CONSTANTS.GROQ.MAX_TOKENS
  ) {
    try {
      if (!userMessage || userMessage.trim().length === 0) {
        throw new Error('User message cannot be empty');
      }
      const cacheKey = this.getCacheKey(userMessage, systemPrompt);
      if (this.isCacheValid(cacheKey, CONSTANTS.CACHE.MOTIVATION_TTL)) {
        logger.debug('GroqService', `Cache hit: ${cacheKey}`);
        return this.cache.get(cacheKey).response;
      }
      return await this.executeRequest(userMessage, systemPrompt, temperature, maxTokens, cacheKey);
    } catch (error) {
      logger.error('GroqService', 'Error', { message: error.message });
      throw error;
    }
  }

  async executeRequest(userMessage, systemPrompt, temperature, maxTokens, cacheKey) {
    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: Math.min(Math.max(temperature, 0), 1),
      max_tokens: Math.min(maxTokens, 2048),
    };

    let lastError;
    const maxAttempts = this.apiKeys.length * 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      const availableKeyIndex = this.findAvailableKeyIndex();
      if (availableKeyIndex === -1) {
        throw new Error('All Groq API keys are quota-limited. Please try again later.');
      }
      this.currentKeyIndex = availableKeyIndex;
      const currentKey = this.getCurrentKey();
      logger.debug('GroqService', `Attempt ${attempt}/${maxAttempts} using key ${this.currentKeyIndex + 1}`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONSTANTS.GROQ.TIMEOUT);
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error?.message || 'Unknown error';
          if (response.status === 429 || errorMessage.includes('quota')) {
            logger.warn('GroqService', `Quota exceeded on key ${this.currentKeyIndex + 1}`);
            this.markKeyQuotaError(this.currentKeyIndex);
            continue;
          }
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        const responseText = data.choices[0]?.message?.content?.trim();
        if (!responseText) throw new Error('Empty response from Groq API');
        this.addToCache(cacheKey, { response: responseText, timestamp: Date.now() });
        logger.info('GroqService', `Success with key ${this.currentKeyIndex + 1}`);
        return responseText;
      } catch (error) {
        lastError = error;
        logger.warn('GroqService', `Attempt ${attempt} failed: ${error.message}`);
        if (!error.message.includes('429') && !error.message.includes('quota')) {
          this.rotateKey();
        }
        const delay = Math.pow(2, Math.min(attempt, 3)) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error(`Groq API failed after ${maxAttempts} attempts: ${lastError.message}`);
  }

  async batchGetResponses(messages) {
    const results = [];
    for (const msg of messages) {
      const response = await this.getResponse(msg.userMessage, msg.systemPrompt);
      results.push(response);
    }
    return results;
  }

  getStatus() {
    return {
      totalKeys: this.apiKeys.length,
      currentKeyIndex: this.currentKeyIndex + 1,
      cacheSize: this.cache.size,
      quotaErrors: Array.from(this.quotaErrors.entries()).map(([keyIndex, time]) => ({
        keyIndex: keyIndex + 1,
        errorTime: new Date(time).toISOString(),
      })),
    };
  }

  clearCache() {
    this.cache.clear();
    this.cacheSize = 0;
    logger.info('GroqService', 'Cache cleared');
  }

  /**
   * Execute MCP-specific request with system context
   * Uses systemContextLoader for optimized prompts
   * @param {string} userMessage - User's message/task description
   * @param {string} commandType - Type of command (dev-update, learning, etc.)
   * @param {Object} context - Additional context data
   * @returns {Promise<string>} AI response
   */
  async executeMCPRequest(userMessage, commandType, context = {}) {
    try {
      if (!systemContextLoader.loaded) {
        await systemContextLoader.load();
      }

      const systemPrompt = systemContextLoader.buildSystemPrompt(commandType, context);
      const temperature = context.temperature || 0.7;
      const maxTokens = context.maxTokens || 200;

      logger.debug('GroqService', `MCP request: ${commandType}`);
      return await this.getResponse(userMessage, systemPrompt, temperature, maxTokens);
    } catch (error) {
      logger.error('GroqService', `MCP request failed (${commandType})`, { message: error.message });
      throw error;
    }
  }

  /**
   * Get system context status
   * @returns {Object} Context loader status
   */
  getContextStatus() {
    return {
      contextLoaded: systemContextLoader.loaded,
      contextStatus: systemContextLoader.getStatus(),
      groqStatus: this.getStatus(),
    };
  }
}

export default new GroqService();

