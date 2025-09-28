# Local Development Setup Guide

This guide will help you set up the Vita AI Smart Task Manager backend for local development.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** ≥ 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** ≥ 9.0.0 ([Installation Guide](https://pnpm.io/installation))
- **Docker** (optional, for local PostgreSQL) ([Download](https://docker.com/))
- **Git** for version control

### Verify Installation

```bash
node --version  # Should be 18.0.0 or higher
pnpm --version  # Should be 9.0.0 or higher
docker --version  # Optional, for local database
```

---

## Setup Steps

### 1. Clone Repository and Configure Environment

```bash
# Clone the repository
git clone https://github.com/manthan0x23/Vita-ai.git

# Navigate to project directory
cd Vita-ai

# Copy environment template
cp .env.example .env
```

**Configure your `.env` file:**
```bash
# Edit the environment variables
nano .env  # or use your preferred editor
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - API server port (default: 5001)
- `NODE_ENV` - Environment mode (development/production)

> **⚠️ Important: Test Environment Setup**
>
> For running tests, you'll need to create a `.env.test` file with the following configuration:
>
> ```bash
> # Create test environment file
> cp .env.example .env.test
> ```
>
> **Add these values to `.env.test`:**
> ```env
> DATABASE_URL=postgres://root:password@localhost:5438/vita_ai_test
> NODE_ENV=test
> PORT=5001
> ```
>
> **Note:** If you're using `pnpm db:up`, the test database is created automatically with these default settings - no changes needed in `.env.test`.

### 2. Install Dependencies

```bash
# Install all project dependencies
pnpm install
```

This will install all necessary packages including TypeScript, Express, Drizzle ORM, and development tools.

### 3. Database Setup

You have two options for setting up PostgreSQL:

#### Option A: Use Docker (Recommended for Development)

Start a local PostgreSQL container:
```bash
# Start PostgreSQL in Docker
pnpm db:up
```

Stop and remove the container when done:
```bash
# Stop and clean up Docker container
pnpm db:down
```

#### Option B: Use External Database

If you have an existing PostgreSQL instance, update your `.env` file with the connection string:
```env
DATABASE_URL="postgres://root:password@localhost:5438/VitaAi"
```

### 4. Database Migration

Apply database schema migrations:

```bash
# Run database migrations
pnpm db:migrate
```

This creates all necessary tables and indexes for the application.

### 5. Seed Initial Data

Populate the database with sample data for development:

#### Option A: Command Line (Recommended)
```bash
# Seed database with sample tasks and data
pnpm db:seed
```

#### Option B: HTTP Endpoint
After starting the server, you can also seed via API:
```bash
# Make a GET request to the seed endpoint
curl http://localhost:5001/api/admin/seed
```

### 6. Build and Start the Application

#### Build
```bash
# Build TypeScript to JavaScript
pnpm build

# Start production server
pnpm start
```

### 7. Verify Installation

Test the API endpoints:

```bash
# Test health check (if available)
curl http://localhost:5001/api/health

# Test admin seed endpoint
curl http://localhost:5001/api/admin/seed
```

### 8. Run Tests

Execute the test suite:

```bash
# Run all tests
pnpm test
```

---

## Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build TypeScript to JavaScript |
| `pnpm start` | Start production server |
| `pnpm test` | Run test suite |
| `pnpm db:up` | Start local PostgreSQL container |
| `pnpm db:down` | Stop and remove PostgreSQL container |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed database with sample data |

### Database Management

#### Reset Database
```bash
# Drop all tables and re-run migrations
pnpm db:down
pnpm db:up
pnpm db:migrate
```

---

## Environment Files Summary

Your project should have these environment files:

- **`.env`** - Main development environment
- **`.env.test`** - Test environment (required for running tests)
- **`.env.example`** - Template file (committed to git)

Make sure to add both `.env` and `.env.test` to your `.gitignore` file to avoid committing sensitive data.

---

## Next Steps

After successful setup:

1. **Explore the API** - Review [routes.md](./Routes.md) for endpoint documentation
2. **Test endpoints** - Use Postman, curl, or your preferred API client

Happy coding! 🚀