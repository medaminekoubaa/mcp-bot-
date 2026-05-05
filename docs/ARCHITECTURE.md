# 🏗️ MCP Bot - System Architecture

Complete technical architecture and design documentation for the MCP Bot system.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Project Structure](#project-structure)
3. [Service Layer Architecture](#service-layer-architecture)
4. [Data Architecture](#data-architecture)
5. [API Integration](#api-integration)
6. [Error Handling](#error-handling)
7. [Scalability](#scalability)

---

## System Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Discord Bot                              │
│                     (Node.js + Express)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                        │
        ┌───────▼────────┐      ┌───────▼────────┐
        │  Command Layer │      │  Event Layer   │
        │                │      │                │
        │ - Slash Cmds   │      │ - Interactions │
        │ - Buttons      │      │ - Messages     │
        │ - Modals       │      │ - Reactions    │
        └────────┬───────┘      └────────┬───────┘
                 │                       │
                 └───────────┬───────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │       Service Layer (Business Logic)    │
        ├──────────────────────────────────────────┤
        │ ┌──────────────┐ ┌──────────────────┐  │
        │ │ GroqService  │ │ MongoDBService   │  │
        │ │              │ │                  │  │
        │ │ • 4 API Keys │ │ • Connection     │  │
        │ │ • Rotation   │ │   pooling        │  │
        │ │ • Failover   │ │ • CRUD ops       │  │
        │ │ • Caching    │ │ • Aggregations   │  │
        │ └──────────────┘ └──────────────────┘  │
        │                                          │
        │ ┌──────────────┐ ┌──────────────────┐  │
        │ │ Logger       │ │ Validators       │  │
        │ │              │ │                  │  │
        │ │ • Color-coded│ │ • Data schemas   │  │
        │ │ • Timestamps │ │ • Error checks   │  │
        │ │ • Context    │ │ • Consistency    │  │
        │ └──────────────┘ └──────────────────┘  │
        └────────────────────┬───────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼────┐         ┌────▼─────┐        ┌────▼─────┐
    │  Groq  │         │ MongoDB  │        │ Discord  │
    │  API   │         │   DB     │        │   API    │
    │        │         │          │        │          │
    │(4 keys)│         │(mcp-bot) │        │(HTTP)    │
    └────────┘         └──────────┘        └──────────┘
```

---

## Project Structure

### Directory Organization

```
src/
├── constants.js                 # Configuration & prompts
│   ├── DISCORD                 # Bot port & timeouts
│   ├── GROQ                    # API URLs & models
│   ├── MONGODB                 # DB config & collections
│   ├── PROMPTS                 # System prompts (optimized)
│   ├── COMMANDS                # Slash command definitions
│   ├── RESPONSES               # Response templates
│   ├── CACHE                   # TTL settings
│   └── HTTP_STATUS             # Status codes
│
├── services/
│   ├── groqService.js          # Groq AI integration
│   │   ├── Key rotation logic
│   │   ├── Quota management
│   │   ├── Caching system
│   │   └── Retry logic (3 attempts)
│   │
│   ├── mongodbService.js       # Database operations
│   │   ├── Connection management
│   │   ├── CRUD operations
│   │   ├── Aggregations
│   │   └── Index management
│   │
│   └── logger.js               # Logging system
│       ├── Color formatting
│       ├── Service context
│       ├── Timestamp tracking
│       └── Structured logging
│
├── models/
│   └── dataModels.js           # Data schemas & validation
│       ├── DailyTask schema
│       ├── UserActivity schema
│       ├── Achievement schema
│       ├── TeamStats schema
│       └── ValidationUtils
│
└── app.js                       # Main entry point

tests/
├── test.js                      # 27+ automated tests
├── check-prerequisites.sh       # Environment checker
└── README.md                   # Testing documentation

docs/
├── ARCHITECTURE.md             # This file
├── SETUP.md                    # Installation guide
├── TESTING_GUIDE.md            # Test procedures
├── MONGODB_SETUP.md            # Database setup
├── API.md                      # API reference
└── TESTING_START_HERE.md       # Quick start
```

---

## Service Layer Architecture

### 1. Groq API Service

#### Design Pattern: Singleton with Failover

```
GroqService
├── Constructor
│   ├── Load 4 API keys
│   ├── Initialize rotation state
│   └── Setup quota tracking map
│
├── Key Rotation Logic
│   ├── getCurrentKey()           → Returns active key
│   ├── rotateKey()               → Switches to next key
│   ├── markKeyQuotaError()       → Marks key as limited
│   ├── isKeyInQuotaTimeout()     → Checks if key available
│   └── findAvailableKeyIndex()   → Finds working key
│
├── API Operations
│   ├── getResponse()             → Main method
│   ├── executeRequest()          → HTTP call with retry
│   └── batchGetResponses()       → Process multiple
│
├── Caching System
│   ├── getCacheKey()             → Generate cache key
│   ├── isCacheValid()            → Check TTL expiry
│   ├── Cache TTL                 → 1 hour (configurable)
│   └── clearCache()              → Manual flush
│
└── Status & Monitoring
    ├── getStatus()               → Service state
    ├── currentKeyIndex          → Active key #
    ├── quotaErrors              → Tracked quota timeouts
    └── Cache size               → Memory usage
```

#### Failover Flow

```
Request
  │
  ├─→ Check cache (fast path)
  │     ├─ Hit → Return cached response ✓
  │     └─ Miss → Continue
  │
  ├─→ Find available key (not in quota timeout)
  │     ├─ Available → Use it
  │     └─ None available → Error (all limited)
  │
  ├─→ Make API request with timeout
  │     ├─ Success → Cache & return ✓
  │     ├─ 429 Error → Mark key quota, try next
  │     └─ Other error → Retry with backoff
  │
  └─→ Max retries exceeded → Error ✗
```

#### API Key Rotation Strategy

```
4 Keys Configured
   │
   ├─ Key 1 (Primary)      [Attempt 1, 2, 3]
   ├─ Key 2 (Secondary)    [Attempt 4, 5, 6]
   ├─ Key 3 (Tertiary)     [Attempt 7, 8, 9]
   └─ Key 4 (Backup)       [Attempt 10, 11, 12]

Quota Error → Mark key (24h timeout) → Skip to next
Timeout Error → Exponential backoff → Retry same key
Network Error → Rotate key → Retry
```

---

### 2. MongoDB Service

#### Design Pattern: Singleton with Connection Pooling

```
MongoDBService
├── Connection Management
│   ├── connect()         → Initialize pool (2-10 connections)
│   ├── createIndexes()   → Auto-create indexes
│   ├── isConnected()     → Check connection status
│   └── disconnect()      → Close pool
│
├── Daily Tasks Operations
│   ├── addDailyTask()              → Create task
│   ├── getTodaysTasks()            → Get today's tasks
│   ├── getYesterdaysTasks()        → Get yesterday's tasks
│   └── getTasksByDateRange()       → Flexible date query
│
├── User Activity Operations
│   ├── logActivity()               → Create activity record
│   └── getUserActivityStats()      → Aggregation query
│
├── Achievement Operations
│   ├── recordAchievement()         → Create achievement
│   ├── getUserAchievements()       → Get user achievements
│   └── getUserTotalPoints()        → Sum user points
│
└── Team Statistics
    └── getTeamStats()              → Aggregate team data
```

#### Database Schema

```
Collections:
├── daily_tasks
│   ├── userId (indexed)           [User Discord ID]
│   ├── taskName                   [Task description]
│   ├── category                   [coding, docs, review, etc]
│   ├── date (indexed)             [YYYY-MM-DD]
│   ├── status                     [completed, pending]
│   └── createdAt, updatedAt       [Timestamps]
│
├── user_activity
│   ├── userId (indexed)           [User ID]
│   ├── action (indexed)           [task_logged, etc]
│   ├── metadata                   [Additional context]
│   ├── timestamp (TTL: 30 days)   [Auto-delete old]
│   └── [Indexed for performance]
│
├── achievements
│   ├── userId (indexed)           [User ID]
│   ├── title, description         [Achievement data]
│   ├── points                     [0-1000 range]
│   ├── rarity                     [common, rare, legend]
│   └── unlockedAt                 [Timestamp]
│
└── team_stats
    ├── date (indexed)             [YYYY-MM-DD]
    ├── totalTasksCompleted        [Integer]
    ├── activeMembers              [Count]
    ├── categoryBreakdown          [Object]
    └── topContributor             [User ID]
```

#### Index Strategy

```
Index on daily_tasks:
├── userId + createdAt DESC       → Fast user task queries
└── date ASC                      → Fast date filters

Index on user_activity:
├── userId + timestamp DESC       → Activity history
└── timestamp TTL 30 days         → Auto-cleanup

Performance:
  Query: getTodaysTasks()         → O(log N)
  Query: getTeamStats()           → Aggregation pipeline
```

---

### 3. Logger Service

#### Design Pattern: Singleton with Formatter

```
Logger
├── Constructor
│   ├── Set log level
│   └── Enable/disable console
│
├── Core Methods
│   ├── debug(service, msg, data)
│   ├── info(service, msg, data)
│   ├── warn(service, msg, data)
│   └── error(service, msg, data)
│
├── Formatting
│   ├── Color codes (ANSI)
│   │   ├── Red ❌ Errors
│   │   ├── Yellow ⚠️ Warnings
│   │   ├── Green ✓ Info
│   │   └── Cyan ℹ️ Debug
│   ├── Timestamps (ISO 8601)
│   ├── Service context
│   └── Structured data
│
└── Specialized Methods
    ├── logAPICall()               → API metrics
    ├── logDBOperation()           → DB metrics
    └── logBotEvent()              → Bot events
```

#### Output Examples

```
[2026-05-05T08:30:32.320Z] [INFO] [API] GET /interactions - 45ms
[2026-05-05T08:30:32.321Z] [DEBUG] [Database] ✅ addDailyTask on daily_tasks - 12ms
[2026-05-05T08:30:32.322Z] [WARN] [GroqService] Key 3 marked as quota-limited until ...
[2026-05-05T08:30:32.323Z] [ERROR] [MongoDB] Connection failed: ...
```

---

## Data Architecture

### Data Validation Schema

```
ValidationUtils
├── validateTask(data)
│   ├── taskName required, <100 chars
│   ├── details optional, <500 chars
│   ├── category from enum
│   └── Returns {isValid, errors}
│
└── validateAchievement(data)
    ├── title required
    ├── description required
    ├── points 0-1000 range
    ├── rarity from enum
    └── Returns {isValid, errors}
```

### Data Relationships

```
User
 │
 ├─→ Daily Tasks (1-to-many)
 │   └─ task_name, date, category
 │
 ├─→ Achievements (1-to-many)
 │   └─ points, rarity, timestamp
 │
 └─→ User Activity (1-to-many)
     └─ action, metadata, timestamp

Team
 └─→ Team Stats (aggregated)
     ├─ Total tasks
     ├─ Active members
     ├─ Category breakdown
     └─ Top contributor
```

---

## API Integration

### Groq API Integration

**Service:** `groqService.js`

```javascript
// Example usage
const response = await groqService.getResponse(
  userMessage,
  systemPrompt,
  temperature = 0.7,
  maxTokens = 1000
);
```

**Configuration:**
- Model: `mixtral-8x7b-32768` (balanced cost/performance)
- Temperature: 0.7 (creative but focused)
- Max tokens: 1000 (balance quality and cost)
- Timeout: 10 seconds
- Retries: 3 attempts per key

**Failover Mechanism:**
- 4 API keys with automatic rotation
- Detects 429 errors (quota exceeded)
- 24-hour cooldown on quota-limited keys
- Exponential backoff on retries

---

### MongoDB Integration

**Service:** `mongodbService.js`

```javascript
// Connection
await mongodbService.connect();  // Creates pool

// CRUD Operations
await mongodbService.addDailyTask(userId, taskData);
const tasks = await mongodbService.getTodaysTasks(userId);

// Aggregations
const stats = await mongodbService.getTeamStats();

// Cleanup
await mongodbService.disconnect();
```

**Connection Pool:**
- Min connections: 2
- Max connections: 10
- Timeout: 10 seconds
- Auto-reconnect: enabled

---

## Error Handling

### Error Hierarchy

```
Errors
├── API Errors
│   ├── 429 (Quota) → Mark key, switch to next
│   ├── 5xx (Server) → Retry with backoff
│   └── 4xx (Client) → Fail immediately
│
├── Database Errors
│   ├── Connection → Retry with backoff
│   ├── Validation → Log & reject
│   └── Timeout → Retry
│
└── Validation Errors
    ├── Schema validation → Reject with message
    └── Type validation → Reject with message
```

### Retry Strategy

```
Attempt 1 → Wait 1s  → Attempt 2
Attempt 2 → Wait 2s  → Attempt 3
Attempt 3 → Wait 4s  → Fail

Max retries: 3 per API call
Exponential backoff: 2^n * 1000ms
```

---

## Scalability

### Horizontal Scalability

```
Current Setup (Single Instance)
├── 1 Bot Instance
├── 1 MongoDB Connection Pool
├── 4 Groq API Keys (shared)
└── Single Logger

Future (Multiple Instances)
├── Load Balancer
├── Multiple Bot Instances
├── Shared MongoDB Cluster
├── Distributed Groq Key Management
└── Centralized Logging (ELK Stack)
```

### Performance Optimization

1. **Caching**
   - Response cache: 1 hour TTL
   - Database indexes on frequent queries
   - Connection pooling (2-10 connections)

2. **Batch Operations**
   - `batchGetResponses()` for multiple AI calls
   - Database aggregations for analytics

3. **Monitoring**
   - Real-time service status via `getStatus()`
   - Log all operations with timestamps
   - Track API key quota status

---

## Design Principles

### Applied Patterns

1. **Singleton Pattern** - Services (GroqService, MongoDBService, Logger)
2. **Service Locator** - Import services directly
3. **Factory Pattern** - MongoDB document creation
4. **Observer Pattern** - Event listeners (Discord interactions)
5. **Adapter Pattern** - API response formatting
6. **Facade Pattern** - Service layer abstracts complexity

### Best Practices

- ✅ DRY (Don't Repeat Yourself)
- ✅ SOLID principles
- ✅ Separation of concerns
- ✅ Error handling & logging
- ✅ Input validation
- ✅ Configuration externalization
- ✅ Testing (27+ tests)
- ✅ Documentation

---

## Monitoring & Debugging

### Built-in Monitoring

```javascript
// Check Groq service status
groqService.getStatus();
// Returns: totalKeys, currentKeyIndex, cacheSize, quotaErrors

// Check DB connection
mongodbService.isConnected();

// View logs
logger.info('service', 'message', { data });
```

### Debug Logging

```
LOG_LEVEL=DEBUG     # Verbose logging
ENABLE_CONSOLE_LOG=true  # Console output
```

---

## Future Enhancements

1. **Caching Layer**
   - Redis for distributed caching
   - Session management

2. **Message Queue**
   - RabbitMQ for async operations
   - Scheduled tasks (Bullmq)

3. **Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - ELK Stack logging

4. **Security**
   - Rate limiting
   - API authentication
   - Data encryption

---

**Last Updated:** May 5, 2026  
**Status:** Architecture Finalized ✅
