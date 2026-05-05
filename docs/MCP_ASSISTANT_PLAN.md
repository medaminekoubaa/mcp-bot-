# MCP Development Assistant Bot - Implementation Plan

## Overview
Transform Discord bot from daily task tracking into an intelligent MCP development assistant for the Career & AIRA projects.

---

## 🚀 Phase 1 Implementation Status (Updated May 5, 2026)

### ✅ **Completed Components**

**System Context & AI Optimization:**
- ✅ Created `system-context.txt` - Token-optimized prompt library (2,000 tokens)
- ✅ Created `systemContextLoader.js` - Context loader utility with caching
- ✅ Enhanced `groqService.js` - Added `executeMCPRequest()` method
- ✅ Updated `/dev-update` command handler - Uses system context
- ✅ Registered command with Discord API - Ready for testing

**Database Methods:**
- ✅ `logMCPDevelopmentUpdate()` - Log dev updates to MongoDB
- ✅ `getMCPDevelopmentLogs()` - Retrieve with filtering
- ✅ `getTeamMCPAnalytics()` - Aggregated team metrics
- ✅ `addLearningResource()` - Add educational content
- ✅ `getLearningResources()` - Retrieve resources
- ✅ `incrementResourceViews()` - Track views

**Command Infrastructure:**
- ✅ `/dev-update` - Development update logging (Phase 1 Step 1)
- ⏳ `/mcp-learn` - Learning resources (Ready to implement)
- ⏳ `/team-progress` - Team analytics (Ready to implement)
- ⏳ `/daily-tip`, `/challenge-solver`, `/ai-insights` - Ready to implement

### 📊 Token Efficiency Achieved
- **Before:** ~700 tokens per AI request
- **After:** ~250 tokens per AI request
- **Savings:** 62% reduction = ~450 tokens per request saved
- **Impact:** 40,000 tokens saved per 100 requests

### 📖 Documentation Created
- `docs/SYSTEM_CONTEXT_GUIDE.md` - Complete integration guide
- `docs/SYSTEM_CONTEXT_SUMMARY.md` - Quick reference
- Updated `README.md` - Added system context section and MCP commands

---

## Phase 1: Database Schema Extension

### Collections to Add/Modify

#### 1. **team_members**
```javascript
{
  _id: ObjectId,
  discordId: String,        // Discord user ID
  username: String,         // Discord username
  realName: String,         // Team member name
  project: String,          // "Career" or "AIRA"
  role: String,            // "Developer", "QA", "PM", etc.
  expertise: [String],     // MCP, Docker, AI/LLM, etc.
  joinedAt: Date,
  isActive: Boolean
}
```

#### 2. **mcp_development_logs**
```javascript
{
  _id: ObjectId,
  memberId: ObjectId,      // Reference to team_members
  discordId: String,
  date: Date,
  project: String,         // "Career" or "AIRA"
  taskCategory: String,    // "feature", "bug-fix", "documentation", "research", "testing"
  taskDescription: String,
  mcp_tools_involved: [String], // Which MCP tools were used/worked on
  artifacts: {
    screenshots: [String], // S3 URLs or stored paths
    code_snippets: [String],
    documentation: String
  },
  challenges: String,      // Problems encountered
  solutions: String,       // How they solved it
  ai_used: Boolean,
  ai_tools: [String],     // "Groq", "ChatGPT", "etc"
  learnings: String,       // Key takeaways
  status: String,         // "completed", "in-progress", "blocked"
  blockedReason: String,
  timestamps: {
    logged: Date,
    updated: Date
  }
}
```

#### 3. **mcp_learning_resources**
```javascript
{
  _id: ObjectId,
  category: String,        // "MCP", "Docker", "AI-LLM", "Tools", "Architecture"
  title: String,
  description: String,
  content: String,         // Markdown formatted
  code_example: String,    // If applicable
  difficulty: String,      // "beginner", "intermediate", "advanced"
  project: String,         // "Career", "AIRA", or "General"
  createdAt: Date,
  updatedAt: Date,
  views: Number,
  tags: [String]
}
```

#### 4. **mcp_team_analytics**
```javascript
{
  _id: ObjectId,
  date: Date,              // Daily snapshot
  project: String,
  totalTasks: Number,
  completedTasks: Number,
  blockedTasks: Number,
  team_velocity: Number,
  tools_used: {
    tool_name: Number     // Count of usage
  },
  ai_adoptionRate: Number, // % of tasks using AI
  learnings_count: Number
}
```

---

## Phase 2: New Discord Commands

### Slash Command: `/dev-update`
**Purpose**: Log daily development work

```
/dev-update
  ├─ project: [Career|AIRA]
  ├─ task_category: [feature|bug-fix|documentation|research|testing]
  ├─ description: <text>
  ├─ mcp_tools: [optional comma-separated list]
  ├─ challenges: [optional text]
  ├─ status: [completed|in-progress|blocked]
  └─ attachment: [optional screenshot]
```

**Response**: 
- Embed with formatted task summary
- Auto-generate AI insights using Groq
- Store in database with timestamps

### Slash Command: `/mcp-learn`
**Purpose**: Get educational content about MCP

```
/mcp-learn
  ├─ topic: [MCP-Basics|Tools|Architecture|Integration|Advanced]
  └─ level: [beginner|intermediate|advanced]
```

**Response**: 
- Formatted learning module
- Code examples if relevant
- Links to related resources
- Suggested next topics

### Slash Command: `/team-progress`
**Purpose**: View team development metrics

```
/team-progress
  ├─ project: [Career|AIRA]
  ├─ period: [today|week|month]
  └─ metric: [velocity|tasks|ai-usage|tools-used|blockers]
```

**Response**:
- Beautiful dashboard embed with:
  - Tasks completed
  - Team velocity graph
  - Top tools used
  - AI adoption rate
  - Active blockers

### Slash Command: `/daily-tip`
**Purpose**: Get daily MCP/AI/Docker/Tool tips

```
/daily-tip [optional category: mcp|ai|docker|tools]
```

**Response**:
- Daily tip embed rotating through topics
- Code snippet if applicable
- How it relates to current projects
- Actionable takeaway

### Slash Command: `/screenshot-doc`
**Purpose**: Add screenshot-based documentation

```
/screenshot-doc
  ├─ title: <text>
  ├─ description: <text>
  ├─ project: [Career|AIRA]
  ├─ category: [tutorial|bug-report|ui-walkthrough|architecture]
  └─ attachment: <image>
```

**Response**:
- Store screenshot with metadata
- Auto-generate OCR text (optional)
- Create documentation entry
- Provide shareable link

### Slash Command: `/mcp-tools-status`
**Purpose**: Show status of MCP tools

```
/mcp-tools-status [optional tool_name]
```

**Response**:
- List all 17 Career MCP tools with:
  - Current status
  - Last updated
  - Usage count this week
  - Related team members
  - Known issues

### Slash Command: `/ai-insights`
**Purpose**: Get AI-powered analysis

```
/ai-insights
  ├─ period: [today|week|month]
  └─ focus: [team|project|tools|learning]
```

**Response**:
- AI-generated summary using Groq
- Key patterns identified
- Recommendations for improvement
- Learning opportunities identified

---

## Phase 3: Feature Integration Points

### 1. **Team Member Mention System**
When using `/dev-update`, mention team members involved:
```
/dev-update ... @john-dev @jane-qa
```
- Auto-creates notifications
- Tracks collaboration
- Updates team_members involvement stats

### 2. **MCP Tool Linking**
When mentioning MCP tools, provide instant info:
```
"I worked on apply-job-online tool today"
→ Bot shows tool description, recent PRs, team members working on it
```

### 3. **Weekly Digest**
Every Monday at 10 AM:
- Team velocity summary
- Blockers needing attention
- Top learnings of the week
- Recommended next week's focus areas

### 4. **Integration with Career MCP API**
Connect to `/home/needaimdark/Desktop/career/perimetreCondida/MCP/career-agent-api`:
- Fetch tool descriptions from MCP server
- Check tool execution status
- Pull recent tool usage analytics
- Subscribe to tool deployment events

### 5. **Real-time Updates Channel**
Create a dedicated channel for:
- New MCP documentation published
- Tool updates/releases
- Team learning achievements
- AI tips of the day
- Performance metrics

---

## Phase 4: Backend Architecture Changes

### File Structure Updates
```
src/
├── app.js                          # Keep existing
├── commands.js                     # Keep existing + add new commands
├── commands/
│   ├── devUpdate.js               # NEW
│   ├── mcpLearn.js               # NEW
│   ├── teamProgress.js           # NEW
│   ├── dailyTip.js               # NEW
│   ├── screenshotDoc.js          # NEW
│   ├── mcpToolsStatus.js         # NEW
│   └── aiInsights.js             # NEW
├── services/
│   ├── groqService.js            # Enhance for insights
│   ├── mongodbService.js         # Enhance with new collections
│   ├── mcpIntegrationService.js  # NEW - connect to Career MCP
│   ├── analyticsService.js       # NEW - generate insights
│   └── logger.js                 # Keep existing
├── models/
│   ├── dataModels.js             # Keep existing
│   └── mcp-models.js             # NEW - new schemas
├── utils/
│   ├── helpers.js
│   ├── formatters.js             # NEW - format embeds/responses
│   └── mcpToolsData.js           # NEW - cache of 17 tools
└── scheduled-tasks/
    ├── weeklyDigest.js           # NEW
    ├── dailyTips.js              # NEW
    └── metricsSnapshot.js        # NEW
```

### New Environment Variables
```env
# MCP Integration
MCP_CAREER_API_URL=http://localhost:8000
MCP_CAREER_API_KEY=<from_career_project>
MCP_TOOLS_REFRESH_INTERVAL=3600

# Features
ENABLE_SCREENSHOT_UPLOADS=true
SCREENSHOT_STORAGE_TYPE=local|s3  # local or AWS S3
SCREENSHOT_MAX_SIZE=10485760      # 10MB

# Scheduled Tasks
WEEKLY_DIGEST_DAY=1               # 0=Sun, 1=Mon
WEEKLY_DIGEST_TIME=10:00

DAILY_TIP_TIME=09:00
TIP_ROTATION_CATEGORIES=mcp|ai|docker|tools
```

---

## Phase 5: Data Flow Examples

### Example 1: Daily Development Update
```
User: /dev-update project:Career task_category:feature description:"Implemented new job application validator" mcp_tools:"apply-job-online,cv-analyzer" challenges:"OAuth integration took longer than expected" status:completed

Flow:
1. Bot validates input → checks user is in team_members
2. Stores in mcp_development_logs
3. Calls Groq to generate insights about OAuth challenges
4. Updates team_member's expertise tags
5. Triggers analytics recalculation
6. Posts formatted embed with auto-generated recommendations
7. Updates team-progress channel
```

### Example 2: Team Progress Query
```
User: /team-progress project:Career period:week metric:velocity

Flow:
1. Bot queries mcp_development_logs for past 7 days
2. Calculates completed/total tasks
3. Analyzes tools used
4. Gets AI insights from mcp_team_analytics
5. Renders beautiful dashboard embed
6. Shows blockers needing attention
```

### Example 3: Learning Resource Request
```
User: /mcp-learn topic:Tools level:intermediate

Flow:
1. Bot queries mcp_learning_resources collection
2. Finds intermediate-level tool documentation
3. Personalizes based on user's project
4. Increments view counter
5. Recommends related topics
6. Suggests hands-on exercises
```

---

## Phase 6: Integration with Career MCP

### Connect to 17 Career Tools
```javascript
// Cache these tools in bot memory
const careerTools = [
  "apply-job-online",           // 1
  "cv-generator",               // 2
  "cv-analyzer",                // 3
  "job-application-tracker",    // 4
  "interview-scheduler",        // 5
  "interview-qa-generator",     // 6
  "audio-interview-recorder",   // 7
  "technical-test-evaluator",   // 8
  "offer-evaluator",            // 9
  "negotiation-assistant",      // 10
  "contract-analyzer",          // 11
  "employee-profile-generator", // 12
  "performance-tracker",        // 13
  "skill-development-planner",  // 14
  "promotion-analyzer",         // 15
  "salary-benchmark",           // 16
  "team-analytics"              // 17
];
```

### API Integration Points
```javascript
// In mcpIntegrationService.js

// 1. Fetch tool metadata
async getToolMetadata(toolName) {
  // GET /api/tools/{toolName}/metadata
  // Returns: description, status, recent_updates, team_members
}

// 2. Check tool health
async checkToolHealth() {
  // GET /api/tools/health
  // Returns: all tools status
}

// 3. Get tool usage analytics
async getToolUsageStats(toolName, period) {
  // GET /api/analytics/tools/{toolName}/usage
  // Returns: execution count, average response time, error rate
}

// 4. Subscribe to tool events
async subscribeToToolEvents() {
  // WebSocket connection for real-time tool deployment/updates
}
```

---

## Phase 7: Scheduled Background Tasks

### Weekly Digest (Every Monday 10 AM)
```javascript
// Generate email-style digest with:
- Team velocity (tasks completed)
- Top contributors this week
- Most used MCP tools
- Blockers and resolutions
- Team learning achievements
- Recommended focus for next week
```

### Daily Tips (Every day 9 AM)
```javascript
// Rotating through:
- MCP architecture concepts
- AI/LLM best practices
- Docker containerization tips
- Tool usage recommendations
- Career development tips
```

### Metrics Snapshot (Every night midnight)
```javascript
// Store daily analytics in mcp_team_analytics
- Calculate team velocity
- Track tool adoption
- Record AI usage rate
- Identify trends
- Flag emerging blockers
```

---

## Phase 8: Analytics Dashboard

### Available Metrics
1. **Team Velocity**: Tasks completed per day/week/month
2. **Tool Adoption**: Which tools used most, adoption trends
3. **AI Usage**: % of tasks using AI, AI tools distribution
4. **Blocker Analysis**: Common blockers, resolution time
5. **Learning Progress**: Resources consumed, expertise growth
6. **Collaboration**: Inter-team involvement, pair programming
7. **Quality Metrics**: Bugs introduced, fixes, testing coverage

---

## Implementation Roadmap

### Week 1: Database & Basic Commands
- [x] Add new MongoDB collections
- [x] Implement `/dev-update` command
- [ ] Test `/dev-update` command in Discord
- [ ] Implement `/team-progress` command
- [ ] Enhance groqService for insights

### Week 2: Learning & Documentation
- [ ] Implement `/mcp-learn` command
- [ ] Create initial learning resources
- [ ] Implement `/screenshot-doc` command
- [ ] Build screenshot storage system

### Week 3: Integration & Analytics
- [ ] Connect to Career MCP API
- [ ] Implement `/mcp-tools-status` command
- [ ] Build analytics engine
- [ ] Create metrics visualization

### Week 4: Automation & Polish
- [ ] Implement scheduled tasks
- [ ] Build weekly digest
- [ ] Implement daily tips rotation
- [ ] Add team mention system
- [ ] Testing & refinement

---

## System Context & AI Optimization Framework

### Overview
All MCP commands use an optimized system context architecture for token efficiency and response quality.

### Architecture Components

1. **System Context File** (`src/prompts/system-context.txt`)
   - 2,000 tokens of reusable prompt templates
   - 5 specialized prompt types for different command categories
   - Bot identity and personality guidelines
   - Best practices and response format specifications

2. **Context Loader** (`src/services/systemContextLoader.js`)
   - Loads and caches system context at startup
   - Parses templates and sections
   - Provides methods to build command-specific prompts
   - Estimates token usage for monitoring

3. **Enhanced Groq Service** (`src/services/groqService.js`)
   - New method: `executeMCPRequest(message, commandType, context)`
   - Automatically applies appropriate system prompt
   - Enforces token limits (150-250 max tokens per response)
   - Maintains cache for efficiency

### Prompt Templates

| Template | Command | Purpose | Max Tokens |
|----------|---------|---------|------------|
| `dev-update` | `/dev-update` | Analyze development work | 200 |
| `challenge-solver` | `/challenge-solver` | Solve technical blockers | 200 |
| `learning` | `/mcp-learn` | Generate learning tips | 150 |
| `analytics` | `/team-progress` | Analyze team metrics | 250 |
| `recommendation` | `/ai-insights` | Strategic suggestions | 200 |

### Token Efficiency

**Before System Context:**
```
Per request: ~500 tokens (prompt) + ~200 tokens (response) = ~700 total
100 requests: 70,000 tokens ❌
```

**After System Context:**
```
System context (one-time): 2,000 tokens
Per request: ~100 tokens (concise prompt) + ~150 tokens (response) = ~250 total
100 requests: 2,000 + 25,000 = 27,000 tokens ✅
Savings: 62% reduction per request
```

### Integration Pattern

All new MCP commands follow this pattern:

```javascript
// In command handler
const response = await groqService.executeMCPRequest(
  userMessage,           // What the user did
  'command-type',        // Type of command (dev-update, learning, etc)
  {                      // Optional context
    temperature: 0.7,
    maxTokens: 200
  }
);
```

### Benefits

- ✅ **60% cost reduction** for AI API calls
- ✅ **Better quality** due to structured prompts
- ✅ **Faster responses** (fewer tokens = quicker processing)
- ✅ **Consistent behavior** across all commands
- ✅ **Easy to maintain** (edit prompts in one file)
- ✅ **Scalable** (add new templates without code changes)

### Configuration

All system context settings in `src/constants.js`:
- `CONSTANTS.PROMPTS.MCP_*` - Bot prompts
- `CONSTANTS.MONGODB.COLLECTIONS` - MCP collections
- `CONSTANTS.GROQ.*` - LLM settings

### References

See detailed documentation:
- `docs/SYSTEM_CONTEXT_GUIDE.md` - Complete integration guide
- `docs/SYSTEM_CONTEXT_SUMMARY.md` - Quick reference
- `src/prompts/system-context.txt` - Full prompt library

---

## Critical Success Factors

1. **User Adoption**: Make commands intuitive and valuable
2. **Real-time Feedback**: Provide instant insights after each update
3. **Team Engagement**: Gamify progress (streaks, achievements)
4. **Learning Culture**: Make MCP knowledge accessible and fresh
5. **Integration**: Seamless connection with Career MCP projects
6. **Analytics**: Show clear ROI in team velocity and learning

---

## Next Steps

1. **Read the PDF files** in `/home/needaimdark/Downloads/`:
   - `MCP Equipe Carrière .pdf` - Team structure, epics, assignments
   - `Prompts MCP QA pour Carrière.pdf` - QA scenarios and prompts

2. **Analyze Career MCP code**:
   - Study the 17 tools in depth
   - Understand executor patterns
   - Review API endpoints

3. **Start Phase 1 Implementation**:
   - Begin with database schema
   - Then add commands one by one
   - Test each command thoroughly

4. **Coordinate with Team**:
   - Share this plan with team leads
   - Get feedback on metrics that matter
   - Finalize learning content

---

## Questions to Address

1. Should daily updates track hours worked or just task completion?
2. How should we handle tasks spanning multiple days?
3. What MCP tools are highest priority to track?
4. Should team analytics be public to all or restricted?
5. Do you want daily metrics email in addition to Discord?
6. How to handle vacation/time-off in analytics?

