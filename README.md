# LINKIUM — Opportunity Discovery & Networking Platform

> "Discover opportunities. Connect with people. Build something meaningful."

LINKIUM is an opportunity-driven ecosystem launching initially in Nepal via an invite-only beta, with planned global expansion.

---

## Repository Structure

To preserve the existing Stage 1 React/Vite build at the repository root while introducing a clean backend workspace, the repository is organized as:

```text
.
├── src/                    # Stage 1 React + TypeScript + Tailwind frontend
├── index.html
├── package.json            # Frontend dependencies and Vite scripts
├── vite.config.ts
├── backend/                # Stage 2A Node.js + Express + Prisma backend
│   ├── prisma/
│   │   └── schema.prisma   # PostgreSQL schema
│   ├── src/
│   │   ├── config/         # Zod env validation, Pino logger, Prisma client
│   │   ├── middleware/     # Request ID, logging, Zod validation, 404, errors
│   │   ├── routes/         # /api/v1/health
│   │   ├── utils/          # Standardized API response & AppError helpers
│   │   ├── app.ts          # Express application factory (testable)
│   │   └── server.ts       # HTTP server startup & graceful shutdown
│   ├── tests/              # Vitest + Supertest integration & unit tests
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── docs/
    └── API.md              # Backend API contract documentation
```

---

## Prerequisites

- **Node.js**: `>= 20.0.0` (verified on Node `22.x`)
- **npm**: `>= 10.0.0`
- **PostgreSQL**: `>= 14` (local installation or Docker container)

---

## Frontend Setup (Stage 1)

From the repository root:

```bash
npm install
npm run dev       # Runs Vite on http://localhost:3000
npm run build     # Production frontend bundle -> dist/
npm run lint      # TypeScript check (tsc --noEmit)
```

---

## Backend Setup (Stage 2A)

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `backend/.env.example` to `backend/.env` and update `DATABASE_URL` with your local PostgreSQL credentials.

**macOS / Linux:**
```bash
cp backend/.env.example backend/.env
```

**Windows PowerShell:**
```powershell
Copy-Item backend\.env.example backend\.env
```

Environment variables (`backend/.env`):

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `PORT` | No | `5000` | Backend HTTP port |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed CORS origin(s), comma-separated |
| `LOG_LEVEL` | No | `info` | Pino log level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent`) |

### 3. Prepare PostgreSQL Database

Create a local database named `linkium`:

```sql
CREATE DATABASE linkium;
```

Or using Docker:

```bash
docker run --name linkium-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=linkium \
  -p 5432:5432 \
  -d postgres:16
```

**Windows PowerShell (Docker):**
```powershell
docker run --name linkium-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=linkium `
  -p 5432:5432 `
  -d postgres:16
```

### 4. Generate Prisma Client & Run Initial Migration

From `backend/`:

```bash
npm run db:validate   # Validate prisma/schema.prisma
npm run db:generate   # Generate @prisma/client
npm run db:migrate    # Create & apply initial PostgreSQL migration (e.g. name: init_stage_2a)
```

To open Prisma Studio:
```bash
npm run db:studio
```

---

## Running & Testing the Backend

From `backend/`:

```bash
npm run dev         # Start development server with tsx watch
npm run typecheck   # Strict TypeScript type-checking
npm run test        # Run Vitest + Supertest suite
npm run test:watch  # Watch mode for tests
npm run build       # Compile TypeScript -> backend/dist/
npm start           # Run compiled production server (node dist/server.js)
```

Verify the health endpoint once PostgreSQL and the backend server are running:

```bash
curl http://localhost:5000/api/v1/health
```

**Windows PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health"
```

---

## Common Setup Errors

1. **`Invalid backend environment configuration: DATABASE_URL is required`**
   - Ensure `backend/.env` exists and `DATABASE_URL` starts with `postgresql://` or `postgres://`.
2. **`P1001: Can't reach database server at localhost:5432`**
   - Verify PostgreSQL service or Docker container is running and credentials in `backend/.env` match.
3. **`Origin not allowed by CORS` (`403`)**
   - Add your frontend dev server origin (e.g. `http://localhost:3000` or `http://localhost:5173`) to `FRONTEND_URL` in `backend/.env`.
4. **Prisma Client out of sync after schema changes**
   - Run `npm run db:generate` inside `backend/`.
