/**
 * Input Validation Service
 * Provides centralized validation for user inputs
 */

import { CONSTANTS } from '../constants.js';

class Validator {
  /**
   * Validate command option
   */
  static validateString(value, maxLength, fieldName = 'input') {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }

    const strValue = String(value).trim();
    if (strValue.length === 0) {
      throw new Error(`${fieldName} cannot be empty`);
    }

    if (strValue.length > maxLength) {
      throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
    }

    return strValue;
  }

  /**
   * Validate task name
   */
  static validateTaskName(taskName) {
    return this.validateString(taskName, CONSTANTS.VALIDATION.TASK_NAME_MAX_LENGTH, 'Task name');
  }

  /**
   * Validate task details
   */
  static validateTaskDetails(details) {
    if (!details) return '';
    return this.validateString(details, CONSTANTS.VALIDATION.TASK_DETAILS_MAX_LENGTH, 'Task details');
  }

  /**
   * Validate category
   */
  static validateCategory(category) {
    if (!category) return 'general';
    const validCategories = ['coding', 'documentation', 'review', 'planning', 'testing', 'other', 'general'];
    const cat = category.toLowerCase().trim();
    if (!validCategories.includes(cat)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
    return cat;
  }

  /**
   * Validate user ID (Discord user ID)
   */
  static validateUserId(userId) {
    if (!userId || !/^\d+$/.test(userId)) {
      throw new Error('Invalid user ID format');
    }
    return userId;
  }

  /**
   * Validate Discord channel ID
   */
  static validateChannelId(channelId) {
    if (!channelId || !/^\d+$/.test(channelId)) {
      throw new Error('Invalid channel ID format');
    }
    return channelId;
  }

  /**
   * Validate question for ask command
   */
  static validateQuestion(question) {
    return this.validateString(question, CONSTANTS.VALIDATION.QUESTION_MAX_LENGTH, 'Question');
  }

  /**
   * Validate additional context
   */
  static validateContext(context) {
    if (!context) return '';
    return this.validateString(context, CONSTANTS.VALIDATION.CONTEXT_MAX_LENGTH, 'Context');
  }

  /**
   * Validate description
   */
  static validateDescription(description) {
    if (!description) return '';
    return this.validateString(description, CONSTANTS.VALIDATION.DESCRIPTION_MAX_LENGTH, 'Description');
  }

  /**
   * Validate challenges
   */
  static validateChallenges(challenges) {
    if (!challenges) return '';
    return this.validateString(challenges, CONSTANTS.VALIDATION.CHALLENGES_MAX_LENGTH, 'Challenges');
  }

  /**
   * Validate MCP tools array
   */
  static validateMcpTools(toolsString) {
    if (!toolsString) return [];
    const tools = toolsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .slice(0, 10); // Max 10 tools
    return tools;
  }

  /**
   * Validate status
   */
  static validateStatus(status) {
    if (!status) return 'completed';
    const validStatuses = ['completed', 'in-progress', 'blocked'];
    const s = status.toLowerCase().trim();
    if (!validStatuses.includes(s)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    return s;
  }
}

export default Validator;
