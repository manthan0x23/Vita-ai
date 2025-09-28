# API Documentation

## Overview

This API provides endpoints for user authentication, profile management, task recommendations, and administrative operations.

**Base URL:** `http://localhost:5001/api`

## Routes Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | [/user/login](#1-user-login) | User authentication | ❌ |
| PUT | [/user/super-goals](#2-update-super-goals) | Update user's super goals | ✅ |
| GET | [/user/get](#3-get-user-profile) | Get user profile | ✅ |
| GET | [/user/metrics](#4-get-user-metrics) | Get user metrics/statistics | ✅ |
| GET | [/task/recommend](#5-get-task-recommendations) | Get task recommendations | ✅ |
| PUT | [/task/update-status](#6-update-task-status) | Update task status | ✅ |
| GET | [/admin/seed](#7-seed-tasks-admin) | Seed tasks for testing | ❌ |

## Authentication

Most endpoints require authentication using simple userId based cookie. Login via `/user/login` route and freely use the cookie

---

## Endpoints

### 1. User Login

**POST** `/user/login`

Create/Login a user and receive a userId cookie.

#### Request Body

```json
{
  "name": "Manthan Sharma",
  "email": "user@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ❌ | Name (optional) |
| email | string | ✅ | Valid email address |

#### Response

**Success (200)**
```json
{
  "message": "User created successfully",
  "data": {
    "userId": "y_USEh"
  }
}
```

**Error Responses**
- `400` - Invalid request data
- `500` - Internal server error

---

### 2. Update Super Goals

**PUT** `/user/super-goals`

🔒 **Authentication Required**

Update the user's list of super goals.

#### Request Body

```json
{
   "hydration": 2400,
   "movement": 7000,
   "sleep": 8,
   "screen": 120,
   "mood": 4
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| hydration | number | ❌ | Daily hydration goal in ml |
| movement | number | ❌ | Daily movement goal (steps) |
| sleep | number | ❌ | Sleep goal in hours |
| screen | number | ❌ | Screen time limit in minutes |
| mood | number | ❌ | Mood target (1-5 scale) |

#### Response

**Success (200)**
```json
{
  "ok": true
}
```

**Error Responses**
- `400` - Invalid request data
- `401` - Unauthorized - Missing or invalid cookie
- `500` - Internal server error

---

### 3. Get User Profile

**GET** `/user/get`

🔒 **Authentication Required**

Retrieve the authenticated user's profile information.

#### Response

**Success (200)**
```json
{
  "message": "User fetched successfully",
  "data": {
    "id": "y_USEh",
    "name": "Manthan Sharma",
    "email": "manthan23@gmail.com",
    "createdAt": "2025-09-28T13:42:51.853Z",
    "goals": [
      {
        "type": "hydration",
        "progress": "0 ml",
        "target": 2400
      },
      {
        "type": "movement",
        "progress": "0 steps",
        "target": 8000
      },
      {
        "type": "sleep",
        "progress": "0 hours",
        "target": 8
      },
      {
        "type": "screen",
        "progress": "0 minutes",
        "target": 120
      },
      {
        "type": "mood",
        "progress": "0 mood",
        "target": 0
      }
    ]
  }
}
```

**Error Responses**
- `401` - Unauthorized - Missing or invalid cookie
- `404` - User not found

---

### 4. Get User Metrics

**GET** `/user/metrics`

🔒 **Authentication Required**

Retrieve paginated metrics and statistics for the authenticated user showing daily progress across all goals.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | ✅ | Page number (minimum: 1) |
| perPage | integer | ✅ | Items per page (minimum: 1) |

#### Example Request

```
GET /user/metrics?page=1&perPage=5
```

#### Response

**Success (200)**
```json
{
  "message": "User metrics fetched successfully",
  "data": [
    {
      "date": "2025-09-28T00:00:00.000Z",
      "progress": 67,
      "goals": [
        {
          "type": "hydration",
          "progress": "75%",
          "consumption": 1800
        },
        {
          "type": "movement",
          "progress": "65%",
          "consumption": 5200
        },
        {
          "type": "sleep",
          "progress": "88%",
          "consumption": 7
        },
        {
          "type": "screen",
          "progress": "50%",
          "consumption": 60
        },
        {
          "type": "mood",
          "progress": "80%",
          "consumption": 4
        }
      ]
    },
    {
      "date": "2025-09-27T00:00:00.000Z",
      "progress": 72,
      "goals": [
        {
          "type": "hydration",
          "progress": "90%",
          "consumption": 2160
        },
        {
          "type": "movement",
          "progress": "80%",
          "consumption": 6400
        },
        {
          "type": "sleep",
          "progress": "75%",
          "consumption": 6
        },
        {
          "type": "screen",
          "progress": "33%",
          "consumption": 40
        },
        {
          "type": "mood",
          "progress": "100%",
          "consumption": 5
        }
      ]
    }
  ],
  "totalEntries": 2,
  "totalPages": 10,
  "page": 1,
  "perPage": 5
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| message | string | Success message |
| data | array | Array of daily metrics pages |
| data[].date | string (datetime) | Date for the metrics (ISO format) |
| data[].progress | integer | Average progress percentage across all goals for that date |
| data[].goals | array | Array of goal progress for that date |
| data[].goals[].type | string | Goal type (hydration, movement, sleep, screen, mood) |
| data[].goals[].progress | string | Progress percentage with % symbol |
| data[].goals[].consumption | number | Actual consumption/achievement for that goal |
| totalEntries | integer | Number of entries returned in current page |
| totalPages | integer | Total number of pages available |
| page | integer | Current page number |
| perPage | integer | Items per page |

#### Notes

- Results are ordered by date (most recent first)
- Progress percentages are calculated based on user's target goals
- Each day shows aggregated consumption data for all goal types
- If no data exists for a goal type on a specific date, it won't appear in the goals array

**Error Responses**
- `401` - Unauthorized - Missing or invalid cookie

---

### 5. Get Task Recommendations

**GET** `/task/recommend`

🔒 **Authentication Required**

Get personalized task recommendations based on user's goals and preferences, sorted by relevance score.

#### Example Request

```
GET /task/recommend
```

#### Response

**Success (200)**
```json
{
  "message": "Fetched tasks successfully",
  "tasks": [
    {
      "id": "mood-journal-5",
      "score": 1.9034,
      "base": {
        "id": "mood-journal-5",
        "title": "Journal for 5 minutes",
        "category": "mood",
        "impactWeight": 4,
        "effortMin": 5,
        "timeGate": "anytime"
      }
    },
    {
      "id": "sleep-winddown-15",
      "score": 1.6867,
      "base": {
        "id": "sleep-winddown-15",
        "title": "15-min wind-down routine",
        "category": "sleep",
        "impactWeight": 5,
        "effortMin": 15,
        "timeGate": "evening"
      }
    },
    {
      "id": "screen-break-10",
      "score": 1.3918,
      "base": {
        "id": "screen-break-10",
        "title": "Take a 10-min screen break",
        "category": "screen",
        "impactWeight": 4,
        "effortMin": 10,
        "timeGate": "anytime"
      }
    },
    {
      "id": "movement-stairs",
      "score": 1.1146,
      "base": {
        "id": "movement-stairs",
        "title": "Take stairs once today",
        "category": "movement",
        "impactWeight": 3,
        "effortMin": 3,
        "timeGate": "anytime"
      }
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| message | string | Success message |
| tasks | array | Array of recommended tasks sorted by score (highest first) |
| tasks[].id | string | Unique task identifier |
| tasks[].score | number | Relevance score (higher = more relevant) |
| tasks[].base | object | Base task information |
| tasks[].base.id | string | Base task identifier |
| tasks[].base.title | string | Task title/description |
| tasks[].base.category | string | Goal category: `hydration`, `movement`, `sleep`, `screen`, `mood` |
| tasks[].base.impactWeight | integer | Impact weight (1-5, higher = more impactful) |
| tasks[].base.effortMin | integer | Estimated effort in minutes |
| tasks[].base.timeGate | string | When to do: `anytime`, `morning`, `evening`, etc. |

#### Notes

- Tasks are sorted by relevance score in descending order
- Score is calculated based on user's current progress, goal priorities, and task characteristics
- `timeGate` indicates optimal timing for the task
- `impactWeight` represents the potential impact on the related goal

**Error Responses**
- `401` - Unauthorized - Missing or invalid cookie

---

### 6. Update Task Status

**PUT** `/task/update-status`

🔒 **Authentication Required**

Update the status of a specific task.

#### Request Body

```json
{
  "taskId": "mood-journal-5",
  "action": "completed"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| taskId | string | ✅ | Unique task identifier (minimum 1 character) |
| action | enum | ✅ | Action to take: `completed`, `dismiss`, `ignore` |

#### Action Types

| Action | Description |
|--------|-------------|
| completed | Mark task as completed (counts toward goal progress) |
| dismiss | Dismiss task for now (won't appear in future recommendations) |
| ignore | Ignore task (wouldn't appear for sometime and after 3 ignores goes in dismissal) |

#### Response

**Success (200)**
```json
{
  "ok": true
}
```

---

### 7. Seed Tasks (Admin)

**GET** `/admin/seed`

Populate the database with sample tasks for testing purposes.

#### Response

**Success (200)**
```json
{
  "ok":true
}
```

**Error Responses**
- `500` - Internal server error during seeding

---

## Error Response Format

All error responses follow this consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error message"
      }
    ]
  }
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid cookie |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Authentication Notes

- Authentication is cookie-based using `userId`
- Login via `/user/login` to receive the cookie
- Cookie is automatically included in subsequent requests
- No need to manually handle JWT tokens

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All request and response bodies use `application/json` content type
- Maximum payload size: 10MB
- Super goals are health/wellness focused metrics