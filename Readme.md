# Vita AI Smart Task Manager (Backend)

A Node.js/TypeScript service that provides intelligent wellness task recommendations with deterministic scoring, anti-nag substitution algorithms, time-based task gating, and daily progress resets. The service exposes a minimal HTTP API that delivers precisely four personalized tasks in a consistent, reproducible order.

---

## 📚 Documentation Overview

| Component | Description | Link |
|-----------|-------------|------|
| 🚀 **Setup** | Local development environment setup and installation instructions | [Setup Guide](./Setup.md) |
| 🌐 **API Routes** | Complete API documentation with endpoints, request/response formats, and examples | [Routes Documentation](./server/src/routes/Routes.md) |
| 🗄️ **Database Schemas** | Database structure, relationships, and schema implementation guide | [Schemas Guide](./server/src/db/schema/doc/Schemas.md) |
| ⚙️ **Recommendation Engine** | Task scoring algorithm, recommendation logic, and deterministic rotation system | [Engine Guide](./server/src/engine/Engine.md) |

---

## Architecture

The service is built with:
- **Express.js** for HTTP routing
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Zod** for request validation
- **Cookie-based authentication** for simplicity

---

## 🎯 Core Features

### Task Categories & Urgency Functions

The system supports **5 core wellness categories**, each with its own urgency calculation function:

| Category | Description | Urgency Function |
|----------|-------------|------------------|
| **💧 Hydration** | Daily water intake goals | Based on current consumption vs. target (ml) |
| **🚶 Movement** | Physical activity tracking | Step count progress vs. daily goal |
| **😴 Sleep** | Sleep quality and duration | Hours slept vs. target sleep duration |
| **📱 Screen** | Digital wellness and screen time | Minutes of screen time vs. daily limit |
| **😊 Mood** | Emotional wellness tracking | Mood rating progress (1-5 scale) |

Each category has specialized urgency calculations that consider:
- Current progress vs. targets
- Time of day relevance
- Historical completion patterns
- Impact weight of available tasks

### Daily Reset System

The service implements a **sophisticated daily reset mechanism** using the `system_state` table:

#### Reset Triggers
Daily state resets are automatically triggered on the **first API call** after midnight for each user via:
- `/api/task/recommend` - Task recommendation requests
- `/api/user/metrics` - Historical metrics queries  
- `/api/user/metrics/today` - Today's progress requests

#### Reset Process
1. **Midnight Detection**: System checks if the last user activity was before current day
2. **State Refresh**: User's `system_state` record is reset/refreshed
3. **Task Pool Reset**: Dismissed and ignored tasks are re-evaluated
4. **Progress Reset**: Daily progress counters are zeroed
5. **Recommendation Recalculation**: Fresh task scoring and selection

#### Benefits
- **Automatic**: No cron jobs or scheduled tasks required
- **User-Triggered**: Resets only when users are active
- **Reliable**: Guaranteed fresh state on first daily interaction
- **Efficient**: Minimal database operations per user per day

### Intelligent Recommendation Engine

The system features a sophisticated recommendation engine with:
- **Anti-Nag Protection**: Intelligent task substitution and ignore-counting systems
- **Deterministic Scoring**: Consistent, reproducible task recommendations
- **Time-Based Gating**: Tasks recommended at optimal times of day
- **Category Balancing**: Fair rotation across all wellness categories

> 📖 **Detailed Documentation**: See [Engine Guide](./server/src/engine/Engine.md) for complete algorithm specifications, scoring functions, and anti-nag implementation details.

---