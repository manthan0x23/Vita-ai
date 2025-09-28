# Vita AI Smart Task Manager (Backend)

A Node.js/TypeScript service that provides intelligent wellness task recommendations with deterministic scoring, anti-nag substitution algorithms, time-based task gating, and daily progress resets. The service exposes a minimal HTTP API that delivers precisely four personalized tasks in a consistent, reproducible order.

---
# Quick Start Guide

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

## Key Concepts

### Task Scoring Algorithm
Tasks are scored based on:
- User's current progress toward goals
- Task impact weight (1-5 scale)
- Required effort and time investment
- Historical completion patterns
- Time-of-day appropriateness

### Anti-Nag System
Prevents user fatigue by:
- Rotating similar tasks across different time periods
- Avoiding repetitive suggestions within the same session
- Balancing high-impact tasks with achievable quick wins

### Deterministic Ordering
Ensures consistent user experience by:
- Using reproducible scoring algorithms
- Maintaining stable task ordering across sessions
- Providing predictable recommendation patterns

---
