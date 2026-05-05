/**
 * Groq API Service Wrapper
 * Handles all Groq AI interactions with error handling, retry logic, caching, and key rotation
 * Tech Lead Pattern: Service abstraction for external API calls with failover
 */

import fetch from 'node-fetch';
import { CONSTANTS } from '../constants.js';
import systemContextLoader from './systemContextLoader.js';

class GroqService {
  constructor() {
    this.apiKeys = CONSTANTS.GROQ.API_KEYS;
    this.currentKeyIndex = 0;
    this.apiUrl = CONSTANTS.GROQ.API_URL;
    this.model = CONSTANTS.GROQ.MODEL;
    this.cache = new Map();
    
    // Track quota errors for each key
    this.quotaErrors = new Map();
    
    console.log(`[GroqService] Initialized with ${this.apiKeys.length} API keys`);
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
    console.log(`[GroqService] Rotated from key ${previousIndex + 1} to key ${this.currentKeyIndex + 1}`);
    return newKey;
  }

  markKeyQuotaError(keyIndex) {
    const now = Date.now();
    this.quotaErrors.set(keyIndex, now);
    console.warn(`[GroqService] Key ${keyIndex + 1} marked as quota-limited until ${new Date(now + CONSTANTS.GROQ.QUOTA_RESET_HOURS * 3600000).toISOString()}`);
  }

  isKeyInQuotaTimeout(keyIndex) {
    if (!this.quotaErrors.has(keyIndex)) return false;
    const errorTime = this.quotaErrors.get(keyIndex);
    const resetTime = errorTime + (CONSTANTS.GROQ.QUOTA_RESET_HOURS * 3600000);
    if (Date.now() < resetTime) return true;
    this.quotaErrors.delete(keyIndex);
    console.log(`[GroqService] Key ${keyIndex + 1} quota timeout expired, retrying`);
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
        console.log(`[GroqService] Cache hit for key: ${cacheKey}`);
        return this.cache.get(cacheKey).response;
      }
      return await this.executeRequest(userMessage, systemPrompt, temperature, maxTokens, cacheKey);
    } catch (error) {
      console.error('[GroqService] Error:', error.message);
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
      if (availableKeyIndex === -1) throw new Error('All Groq API keys are quota-limited. Please try again later.');
      this.currentKeyIndex = availableKeyIndex;
      const currentKey = this.getCurrentKey();
      console.log(`[GroqService] Attempt ${attempt}/${maxAttempts} using key ${this.currentKeyIndex + 1}`);

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
            console.warn(`[GroqService] Quota exceeded on key ${this.currentKeyIndex + 1}`);
            this.markKeyQuotaError(this.currentKeyIndex);
            continue;
          }
          throw new Error(`Groq API Error: ${response.status} - ${errorMessage}`);
        }
        const data = await response.json();
        const responseText = data.choices[0]?.message?.content?.trim();
        if (!responseText) throw new Error('Empty response from Groq API');
        this.cache.set(cacheKey, { response: responseText, timestamp: Date.now() });
        console.log(`[GroqService] ✅ Success with key ${this.currentKeyIndex + 1}`);
        return responseText;
      } catch (error) {
        lastError = error;
        console.warn(`[GroqService] Attempt ${attempt} failed:`, error.message);
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
    console.log('[GroqService] Cache cleared');
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
      // Ensure context loader is initialized
      if (!systemContextLoader.loaded) {
        await systemContextLoader.load();
      }

      // Build optimized system prompt
      const systemPrompt = systemContextLoader.buildSystemPrompt(commandType, context);
      
      // Use optimized token settings for MCP commands
      const temperature = context.temperature || 0.7;
      const maxTokens = context.maxTokens || 200;

      console.log(`[GroqService] MCP Request: ${commandType} | Est. tokens: ${Math.ceil(userMessage.length / 4)}`);
      
      // Execute with system context
      return await this.getResponse(userMessage, systemPrompt, temperature, maxTokens);
    } catch (error) {
      console.error(`[GroqService] MCP Request failed (${commandType}):`, error.message);
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

