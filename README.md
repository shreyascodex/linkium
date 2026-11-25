# LINKIUM — Opportunity Discovery & Networking Platform

> "Discover opportunities. Connect with people. Build something meaningful."

LINKIUM is an opportunity-driven ecosystem launching initially in Nepal via an invite-only beta, with planned global expansion.

---

## Repository Structure

```text
.
├── src/                        # Stage 1 React + TypeScript + Tailwind frontend
├── index.html
├── package.json                # Frontend dependencies and Vite scripts
├── vite.config.ts
├── backend/                    # Stage 2A + 2B Node.js + Express + Prisma backend
│   ├── prisma/
│   │   └── schema.prisma       # PostgreSQL schema
│   ├── src/
│   │   ├── config/             # Zod env validation, Pino logger, Prisma client
│   │   ├── emails/             # Email provider abstraction (console, Resend) & templates
│   │   ├── middleware/         # Request ID, logging, origin, CSRF, auth, rate-limit, Zod, errors
│   │   ├── modules/
│   │   │   └── auth/           # Registration, verification, login, sessions, password reset
│   │   ├── routes/             # /api/v1/health, /api/v1/auth, /api/v1/invitations
│   │   ├── scripts/            # Admin/dev CLI scripts (create-invitation.ts)
│   │   ├── types/              # Express Request augmentation
│   │   ├── utils/              # API responses, cookies, Argon2id/SHA-256/HMAC crypto
│   │   ├── app.ts              # Express application factory (testable)
│   │   └── server.ts           # HTTP server startup & graceful shutdown
│   ├── tests/                  # Vitest + Supertest unit, HTTP, and PostgreSQL integration tests
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── docs/
    └── API.md                  # Full API contract & Stage 2D integration guide
```

---

## Prerequisites

- **Node.js**: `>= 20.0.0` (verified on Node `22.x`)
- **npm**: `>= 10.0.0`
- **PostgreSQL**: `>= 14` (local installation, managed PostgreSQL, or Docker)

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

## Backend Setup (Stage 2A + Stage 2B)

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure values. Never commit `.env`.

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
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed CORS & Origin URLs (comma-separated) |
| `APP_BASE_URL` | No | `http://localhost:3000` | Base frontend URL used in verification/reset/invite links |
| `COOKIE_SAME_SITE` | No | `lax` | `lax` (same-origin / Vite proxy) or `none` (cross-origin HTTPS) |
| `SESSION_SECRET` | Prod **Yes** | Ephemeral in dev/test | >= 32-character secret for session-bound CSRF token derivation |
| `EMAIL_PROVIDER` | No | `console` | `console` (dev/test only) or `resend` (required in production) |
| `EMAIL_FROM` | No | `LINKIUM <no-reply@example.com>` | Verified sender address for transactional emails |
| `EMAIL_API_KEY` | If `resend` | `""` | Resend API key (`re_...`), kept strictly in server secrets / `.env` |
| `SESSION_MAX_AGE_DAYS` | No | `7` | Session & cookie lifetime in days |
| `VERIFICATION_TOKEN_EXPIRY_MINUTES` | No | `30` | Email verification token TTL |
| `PASSWORD_RESET_TOKEN_EXPIRY_MINUTES` | No | `30` | Password reset token TTL |
| `INVITATION_EXPIRY_DAYS` | No | `7` | Invitation token TTL |
| `RATE_LIMIT_WINDOW_MINUTES` | No | `15` | Rate-limit window in minutes |
| `RATE_LIMIT_AUTH_MAX` | No | `20` | Max auth/invitation requests per window |
| `RATE_LIMIT_EMAIL_MAX` | No | `5` | Max verification resend / forgot-password requests per window |
| `LOG_LEVEL` | No | `info` | Pino log level |

### 3. Prepare PostgreSQL Database & Run Migrations

Use a local Docker PostgreSQL container OR any managed cloud PostgreSQL provider (Neon, Supabase, Google Cloud SQL, Railway, Render):

```bash
docker run --name linkium-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=linkium \
  -p 5432:5432 \
  -d postgres:16
```

**Windows PowerShell:**
```powershell
docker run --name linkium-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=linkium `
  -p 5432:5432 `
  -d postgres:16
```

For cloud PostgreSQL, set `DATABASE_URL` in `backend/.env` with `?sslmode=require` (as provided by Neon/Supabase/Cloud SQL), then run from `backend/`:

```bash
npm run db:validate   # Validate prisma/schema.prisma
npm run db:generate   # Generate @prisma/client
npm run db:migrate    # Create & apply migration
```

### 4. Real Transactional Email Setup (Resend)

To deliver real verification and password reset emails:

1. Create an API key in [Resend](https://resend.com) and verify a sending domain (or use Resend's sandbox sender for testing).
2. Set in `backend/.env`:
   - `EMAIL_PROVIDER="resend"`
   - `EMAIL_API_KEY="re_your_api_key"`
   - `EMAIL_FROM="LINKIUM <noreply@yourdomain.com>"`
   - `APP_BASE_URL="http://localhost:3000"` (or your deployed frontend URL)

---

## Running Full-Stack Locally (Frontend + Backend)

1. Start the backend API (`http://localhost:5000`):
   ```bash
   npm --prefix backend run dev
   ```
2. Start the frontend Vite app (`http://localhost:3000`, automatically proxying `/api/*` to `http://localhost:5000`):
   ```bash
   npm run dev
   ```
   Optional: set `VITE_API_PROXY_TARGET` to override the proxy target, or set `VITE_API_BASE_URL` for split-origin builds.

---

## Creating Invite-Only Beta Invitations (Dev/Admin CLI)

Registration is invitation-only. Generate a single-use invitation from `backend/`:

```bash
npm run invite:create -- --email builder@example.com --note "Kathmandu Beta"
```

**Windows PowerShell:**
```powershell
npm run invite:create -- --email "builder@example.com" --note "Kathmandu Beta"
```

This stores only the SHA-256 hash in PostgreSQL and prints the one-time invitation URL (`http://localhost:3000/register?invitation=...`) to stdout.

---

## Stage 2A–2D Feature Overview

- **Auth Lifecycle**: Invitation validation (`/register?invitation=`), email verification (`/verify-email`), resend verification, cookie session login (`/login`), forgot/reset password (`/forgot-password`, `/reset-password`), in-session password change (`/settings`), and CSRF-protected logout.
- **5-Step Onboarding (`/onboarding`)**: Saves Identity Mode (`REAL` or `PSEUDONYMOUS`), basic profile (`username`, `displayName`, `bio`, `avatarUrl`, `location`), searchable skills, interests, and platform goals to PostgreSQL step-by-step and restores saved progress across refreshes.
- **Authenticated Workspace**: `DashboardLayout` sidebar, `/dashboard` (welcome header, calculated profile completion bar, skill/interest-matched opportunities, categories, quick actions), `/profile` full editor, `/settings` account/security controls, and Stage 3 preview routes (`/connections`, `/projects`, `/messages`).

See `docs/API.md` for full endpoint contracts.

---

## Running & Testing the Backend

From `backend/`:

```bash
npm run dev               # Start development server with tsx watch
npm run typecheck         # Strict TypeScript type-checking
npm run test              # Run Vitest unit & HTTP test suite
npm run build             # Compile TypeScript -> backend/dist/
npm start                 # Run compiled production server (node dist/server.js)
```

### Dedicated PostgreSQL Integration Tests

Never run integration tests against a production database. Point `TEST_DATABASE_URL` to a dedicated test database:

```bash
TEST_DATABASE_URL="postgresql://postgres:password@localhost:5432/linkium_test" npm run test:integration
```

**Windows PowerShell:**
```powershell
$env:TEST_DATABASE_URL="postgresql://postgres:password@localhost:5432/linkium_test"
npm run test:integration
```

---

## Cloud & Production Deployment Notes

- Set `NODE_ENV=production`, a strong `SESSION_SECRET` (`>= 32` random characters), `EMAIL_PROVIDER=resend`, and a valid `EMAIL_API_KEY` via your platform secret manager (e.g., AI Studio Secrets / Cloud Run env vars).
- Run `npm run db:migrate:deploy` against the managed PostgreSQL database before starting `npm start`.
- `trust proxy` is enabled automatically in `production` so rate limiting and `Secure` cookies work behind reverse proxies/load balancers.
