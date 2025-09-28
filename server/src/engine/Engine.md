# Recommendation & Scoring Engine

📁 **Engine Implementation**: [View engine folder](./recommendation.ts)

## Overview

The recommendation system uses deterministic scoring to rank and rotate wellness tasks based on user progress, task characteristics, and timing constraints.

## Core Components

### RecommendationEngine
Main orchestrator that fetches user data and applies filtering logic.

### ScoringEngine
Calculates numerical scores for tasks using weighted factors.

## Scoring Algorithm

### Weights
```typescript
W = {
  urgency: 0.5,    // How badly needed (based on goal progress)
  impact: 0.3,     // Task importance weight
  effort: 0.15,    // Inverse effort (easier tasks score higher)
  tod: 0.15,       // Time-of-day matching
  penalty: 0.2,    // Ignore count penalty
  recency: 0.25,   // Recently completed penalty
}
```

### Score Calculation
```
Score = (urgency × 0.5) + (impact × 0.3) + (effort × 0.15) + (timeOfDay × 0.15) 
        - (ignores × 0.2) - (recency × 0.25)
```

## Task Filtering

### Exclusion Rules
Tasks are excluded if:
- **Recently Ignored**: Ignored within last 2 hours
- **Dismiss Blocked**: Dismissed within last 24 hours  
- **Recently Completed**: Completed within last 2 hours

### Fallback Logic
When main task is blocked:
1. Try **alternative task** (if available)
2. Try **micro task** (if available)  
3. Fall back to **main task** (if only completed, not dismissed/ignored)

## Urgency Calculation

### By Category
- **Hydration**: `(goal - current) / goal` if under goal, else 0
- **Movement**: `(goal - current) / goal` if under goal, else 0
- **Sleep**: 1 if under goal, else 0
- **Screen**: 1 if over limit, else 0
- **Mood**: 1 if ≤2, else 0.2

### Time-of-Day Factor
- **In time window**: 1.0
- **Outside window**: 0.2
- **Anytime tasks**: Always 1.0

### Effort Factor
Inverse effort calculation favors easier tasks:
```typescript
inverseEffort = 1 / log₂(minutes + 2)
```

### Penalties
- **Ignore Penalty**: Linear penalty per ignore count
- **Recency Penalty**: 
  - <30 min: 1.0 penalty
  - <60 min: 0.6 penalty  
  - <120 min: 0.3 penalty
  - >120 min: 0 penalty

## Task Rotation

### Selection Process
1. **Filter** available tasks (remove blocked ones)
2. **Score** each remaining task
3. **Sort** by score (highest first)
4. **Return** top N tasks

### Deterministic Behavior
- Same user state = same recommendations
- Scores are rounded to 4 decimal places
- Consistent sorting ensures predictable results

## Usage Example

```typescript
// Get top 5 recommended tasks for user
const tasks = await RecommendationEngine.recommend_tasks(
  userId, 
  5, 
  new Date()
);

// Each task includes:
// - id: string
// - score: number (0-1+ range)
// - base: Task object with details
```

## Key Features

- **Dynamic Priority**: Tasks rise/fall based on real progress
- **Time-Aware**: Morning/evening tasks shown at appropriate times
- **Burnout Prevention**: Blocks recently interacted tasks
- **Effort Balance**: Easier tasks get slight preference
- **Fallback System**: Alternative/micro tasks when main tasks unavailable

---

*The system ensures users see relevant, actionable tasks while preventing overwhelm through smart filtering and deterministic scoring.*