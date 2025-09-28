# Vita AI Smart Task Manager (Backend)

A Node.js/TypeScript service that computes deterministic wellness task recommendations with anti-nag substitutions, time-of-day gating, and daily resets. Exposes a minimal HTTP API returning exactly four tasks in a reproducible order.

---

## Prerequisites

- Node.js ≥ 18  
- pnpm ≥ 9  
- Docker (optional, for Postgres)

---

## Setup

### 1. Clone Repository  and Configure Environment
```bash
git clone https://github.com/manthan0x23/Vita-ai.git
cd Vita-ai
cp .env.example .env
```

### 2. Install Dependencies
```
pnpm install
```

### 3. Database (Optional)
Provide a Postgres connection string in .env or run a local Postgres container.

To start local Postgres:
```
pnpm db:up
```
Stop and remove:
```
pnpm db:down
```

### 4. Run Migrations
```
pnpm db:migrate
```

### 5. Seed Data
Option A:
```
pnpm db:seed
```
Option B:
```
GET /api/admin/seed
```

### 6. Build ,Start and Test
```
pnpm build 
```
Then
```
pnpm start
pnpm test
```
