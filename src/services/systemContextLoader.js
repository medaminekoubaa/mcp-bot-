/**
 * System Context Loader
 * Loads and manages the system prompt context from file
 * Optimizes token usage by caching and selective loading
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SystemContextLoader {
  constructor() {
    this.contextPath = path.join(__dirname, '../prompts/system-context.txt');
    this.fullContext = null;
    this.templates = {};
    this.loaded = false;
  }

  /**
   * Load system context from file
   * @returns {Promise<void>}
   */
  async load() {
    try {
      if (this.loaded) {
        console.log('[SystemContext] Already loaded');
        return;
      }

      const content = fs.readFileSync(this.contextPath, 'utf-8');
      this.fullContext = content;

      // Parse templates section
      this.parseTemplates();

      this.loaded = true;
      console.log('[SystemContext] ✅ Loaded from file');
    } catch (error) {
      console.error('[SystemContext] Failed to load:', error.message);
      throw error;
    }
  }

  /**
   * Parse templates from context file
   * @private
   */
  parseTemplates() {
    const templateRegex = /\[PROMPT_(\w+)\]([\s\S]*?)(?=\n---|\n\[|\Z)/g;
    let match;

    while ((match = templateRegex.exec(this.fullContext)) !== null) {
      const templateName = match[1];
      const templateContent = match[2].trim();
      this.templates[templateName] = templateContent;
    }

    console.log(`[SystemContext] Parsed ${Object.keys(this.templates).length} templates`);
  }

  /**
   * Get identity section (bot personality)
   * @returns {string} Bot identity prompt
   */
  getIdentity() {
    return this.extractSection('BOT_IDENTITY');
  }

  /**
   * Get context for dev insights
   * @returns {string} Dev insights template
   */
  getDevInsightsTemplate() {
    return this.templates.DEV_INSIGHTS || '';
  }

  /**
   * Get context for challenge solving
   * @returns {string} Challenge solver template
   */
  getChallengeSolverTemplate() {
    return this.templates.CHALLENGE_SOLVER || '';
  }

  /**
   * Get context for learning tips
   * @returns {string} Learning tip template
   */
  getLearningTipTemplate() {
    return this.templates.MCP_LEARNING_TIP || '';
  }

  /**
   * Get context for team analytics
   * @returns {string} Team analytics template
   */
  getTeamAnalyticsTemplate() {
    return this.templates.TEAM_ANALYTICS || '';
  }

  /**
   * Get context for AI recommendations
   * @returns {string} AI recommendation template
   */
  getRecommendationTemplate() {
    return this.templates.AI_RECOMMENDATION || '';
  }

  /**
   * Get token-efficient response guidelines
   * @returns {string} Response guidelines
   */
  getResponseGuidelines() {
    return this.extractSection('RESPONSE_GUIDELINES');
  }

  /**
   * Get MCP tools ecosystem context
   * @returns {string} MCP tools information
   */
  getMCPToolsContext() {
    return this.extractSection('MCP_TOOLS_ECOSYSTEM');
  }

  /**
   * Get error handling fallbacks
   * @returns {string} Fallback responses
   */
  getErrorFallbacks() {
    return this.extractSection('ERROR_HANDLING_FALLBACKS');
  }

  /**
   * Build optimized system prompt for Groq
   * @param {string} commandType - Type of command (dev-update, mcp-learn, etc.)
   * @param {Object} context - Additional context data
   * @returns {string} Optimized system prompt
   */
  buildSystemPrompt(commandType, context = {}) {
    let systemPrompt = this.getIdentity() + '\n\n';

    // Add relevant template based on command type
    switch (commandType) {
      case 'dev-update':
        systemPrompt += this.getDevInsightsTemplate() + '\n\n';
        systemPrompt += this.getMCPToolsContext();
        break;

      case 'challenge-solver':
        systemPrompt += this.getChallengeSolverTemplate() + '\n\n';
        systemPrompt += 'Focus on practical solutions, not lengthy explanations.';
        break;

      case 'learning':
        systemPrompt += this.getLearningTipTemplate() + '\n\n';
        if (context.developLevel === 'beginner') {
          systemPrompt += 'Keep explanations simple and use real-world analogies.';
        } else {
          systemPrompt += 'Include technical depth and best practices.';
        }
        break;

      case 'analytics':
        systemPrompt += this.getTeamAnalyticsTemplate() + '\n\n';
        systemPrompt += this.extractSection('METRICS_DEFINITIONS');
        break;

      case 'recommendation':
        systemPrompt += this.getRecommendationTemplate() + '\n\n';
        systemPrompt += this.getMCPToolsContext();
        break;

      default:
        systemPrompt += this.getResponseGuidelines();
    }

    return systemPrompt;
  }

  /**
   * Extract a specific section from context
   * @private
   * @param {string} sectionName - Name of section to extract
   * @returns {string} Section content
   */
  extractSection(sectionName) {
    const regex = new RegExp(`\\[${sectionName}\\](.*?)(?=\\[|$)`, 's');
    const match = this.fullContext.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Get quick reference for command mappings
   * @returns {Object} Command to template mappings
   */
  getCommandMappings() {
    return {
      'dev-update': 'DEV_INSIGHTS',
      'mcp-learn': 'MCP_LEARNING_TIP',
      'team-progress': 'TEAM_ANALYTICS',
      'ai-insights': 'AI_RECOMMENDATION',
      'challenge-solver': 'CHALLENGE_SOLVER',
    };
  }

  /**
   * Get token count estimate for a section
   * Rough estimate: ~4 chars per token
   * @param {string} section - Section name
   * @returns {number} Estimated tokens
   */
  estimateTokens(section) {
    const content = this.extractSection(section);
    return Math.ceil(content.length / 4);
  }

  /**
   * Get health status
   * @returns {Object} Loader status
   */
  getStatus() {
    return {
      loaded: this.loaded,
      templateCount: Object.keys(this.templates).length,
      estimatedTokens: this.fullContext ? Math.ceil(this.fullContext.length / 4) : 0,
      contextFile: this.contextPath,
    };
  }
}

// Export singleton instance
export default new SystemContextLoader();
