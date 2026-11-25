# LINKIUM Backend API Documentation

Base prefix: `/api/v1`

All responses follow a consistent JSON envelope and include an `X-Request-Id` header.

---

## Response Envelope

### Success Response
```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human-readable error summary",
  "errors": [
    {
      "field": "body.email",
      "code": "invalid_string",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

## Authentication & Security Model (Stage 2B)

- **Sessions**: Cryptographically random tokens (`32` bytes), stored only as SHA-256 hashes in PostgreSQL (`sessions.token_hash`).
- **Cookies**: Issued as `linkium_session` with `HttpOnly: true`, `SameSite: Lax`, `Path: /`, and `Secure: true` in `production`. Never accessible to browser JavaScript.
- **Passwords**: Hashed with Argon2id (`memoryCost: 65536`, `timeCost: 3`, `parallelism: 1`). Minimum policy: `8–128` chars, uppercase, lowercase, digit, and special character.
- **CSRF & Origin Protection**:
  - CORS restricts browser origins to `FRONTEND_URL`.
  - State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) validate `Origin`, `Referer`, and `Sec-Fetch-Site`.
  - Authenticated state-changing endpoints (such as `POST /api/v1/auth/logout`) require a session-bound `X-CSRF-Token` header retrieved via `GET /api/v1/auth/csrf` and verified server-side against `sessions.csrf_token_hash` using constant-time comparison.
- **Stage 2D Frontend Integration Contract**:
  1. Send `credentials: 'include'` on `fetch` (or `withCredentials: true` on Axios) for all `/api/v1/auth/*` calls.
  2. Never store session tokens in `localStorage` or `sessionStorage`.
  3. After login (or app boot if `GET /api/v1/auth/me` returns `200`), call `GET /api/v1/auth/csrf` and keep `csrfToken` in React memory.
  4. Attach `X-CSRF-Token: <csrfToken>` to authenticated `POST`/`PUT`/`PATCH`/`DELETE` requests.

---

## Health Endpoint

### `GET /api/v1/health`

Checks API availability and verifies live PostgreSQL connectivity via Prisma (`SELECT 1`).

- **200 OK**: `{ "success": true, "message": "LINKIUM API is running", "data": { "status": "healthy", "database": "connected" } }`
- **503 Service Unavailable**: `{ "success": false, "message": "Database is unavailable", "errors": [{ "code": "DATABASE_UNAVAILABLE", "message": "PostgreSQL connection check failed." }] }`

---

## Invitation Endpoints

### `GET /api/v1/invitations/validate/:token`

Validates an invitation token without consuming it.

- **200 OK**:
```json
{
  "success": true,
  "message": "Invitation is valid",
  "data": {
    "valid": true,
    "email": "user@example.com",
    "expiresAt": "2026-12-02T12:00:00.000Z"
  }
}
```
- **400 Bad Request**: `{ "success": false, "message": "Invitation is invalid or has expired", "errors": [{ "code": "INVALID_INVITATION", "message": "..." }] }`

---

## Authentication Endpoints

### `POST /api/v1/auth/register`

Registers an invitation-only account with status `PENDING_VERIFICATION`, consumes the invitation atomically, and dispatches a verification email. Does not authenticate unverified users.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "invitationToken": "RAW_INVITATION_TOKEN"
}
```

**201 Created:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email address.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "status": "PENDING_VERIFICATION"
    }
  }
}
```

---

### `POST /api/v1/auth/verify-email`

Verifies a single-use email verification token, sets `emailVerifiedAt`, and transitions `PENDING_VERIFICATION` to `ACTIVE`.

**Request Body:**
```json
{
  "token": "RAW_VERIFICATION_TOKEN"
}
```

**200 OK:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "verified": true
  }
}
```

---

### `POST /api/v1/auth/resend-verification`

Generates a new single-use verification token for eligible `PENDING_VERIFICATION` accounts and supersedes previous unused tokens. Returns a generic response to prevent account enumeration.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**200 OK:**
```json
{
  "success": true,
  "message": "If an eligible unverified account exists for that email, a verification email has been sent.",
  "data": {}
}
```

---

### `POST /api/v1/auth/login`

Authenticates an active, email-verified user and sets the `linkium_session` `HttpOnly` cookie.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**200 OK:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "status": "ACTIVE",
      "emailVerifiedAt": "2026-11-25T13:00:00.000Z",
      "createdAt": "2026-11-25T12:55:00.000Z"
    }
  }
}
```
- **401 Unauthorized**: Invalid email or password.
- **403 Forbidden**: Email unverified (`EMAIL_NOT_VERIFIED`) or account suspended/deleted (`ACCOUNT_UNAVAILABLE`).

---

### `GET /api/v1/auth/me`

Requires valid `linkium_session` cookie. Returns the authenticated user's safe fields.

- **200 OK**: `{ "success": true, "message": "Authenticated user retrieved", "data": { "user": { ... } } }`
- **401 Unauthorized**: Missing, expired, or revoked session.

---

### `GET /api/v1/auth/csrf`

Requires valid `linkium_session` cookie. Issues the session-bound CSRF token to be passed in `X-CSRF-Token` on authenticated mutations.

- **200 OK**: `{ "success": true, "message": "CSRF token issued", "data": { "csrfToken": "..." } }`
- **401 Unauthorized**: Unauthenticated.

---

### `POST /api/v1/auth/logout`

Requires valid `linkium_session` cookie + `X-CSRF-Token` header + valid `Origin`. Revokes the database session and clears `linkium_session`.

- **200 OK**: `{ "success": true, "message": "Logged out successfully", "data": {} }`
- **401 Unauthorized**: Missing or invalid session.
- **403 Forbidden**: Missing/invalid `X-CSRF-Token` or disallowed `Origin`.

---

### `POST /api/v1/auth/forgot-password`

Issues a single-use password reset token for eligible `ACTIVE` verified accounts and sends a reset email. Always returns a generic `200` response.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

### `POST /api/v1/auth/reset-password`

Validates a single-use password reset token, updates the Argon2id password hash, marks the token used, and revokes all active sessions for that user.

**Request Body:**
```json
{
  "token": "RAW_RESET_TOKEN",
  "newPassword": "NewStrongPassword123!"
}
```

**200 OK:**
```json
{
  "success": true,
  "message": "Password reset successful. Please sign in with your new password.",
  "data": {}
}
```

### `POST /api/v1/auth/change-password`

Requires valid `linkium_session` cookie + `X-CSRF-Token` + valid `Origin`. Verifies `currentPassword`, hashes `newPassword` with Argon2id, updates the user password, and revokes all *other* active sessions while keeping the current session signed in.

**Request Body:**
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewStrongPassword123!"
}
```

**200 OK:**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {}
}
```

---

## Profile, Catalog & Onboarding Endpoints (Stage 2C + 2D)

### `GET /api/v1/skills`

Seeds curated skills idempotently if missing and returns the full ordered skills catalog.

- **200 OK**: `{ "success": true, "message": "Skills catalog retrieved", "data": { "skills": [{ "id": "uuid", "name": "React", "slug": "react" }] } }`

### `GET /api/v1/interests`

Seeds curated interests idempotently if missing and returns the full ordered interests catalog.

- **200 OK**: `{ "success": true, "message": "Interests catalog retrieved", "data": { "interests": [{ "id": "uuid", "name": "Startups", "slug": "startups" }] } }`

### `GET /api/v1/profiles/me`

Requires valid `linkium_session` cookie. Ensures a profile row exists for the authenticated user and returns full profile details, skills, interests, goals, and calculated `completionPercentage` / `missingFields`.

### `PATCH /api/v1/profiles/me`

Requires valid `linkium_session` cookie + `X-CSRF-Token` + valid `Origin`. Updates any subset of `identityMode` (`REAL` | `PSEUDONYMOUS`), `username` (`^[a-z0-9_]{3,30}$`), `displayName`, `bio`, `avatarUrl` (`http://` or `https://`), `location`, `onboardingStep` (`1..5`), and `onboardingCompleted`.

- Enforces unique usernames (`409 Conflict` with `USERNAME_TAKEN`).
- Rejects `onboardingCompleted: true` with `400 Bad Request` (`ONBOARDING_INCOMPLETE`) unless `identityMode`, `username`, `displayName`, >= 1 skill, >= 1 interest, and >= 1 goal are present.

### `PUT /api/v1/profiles/me/skills`

Requires valid `linkium_session` cookie + `X-CSRF-Token` + valid `Origin`. Atomically replaces the authenticated user's selected skills.

**Request Body:**
```json
{
  "skills": [
    { "skillId": "uuid", "proficiency": "Intermediate" }
  ]
}
```

### `PUT /api/v1/profiles/me/interests`

Requires valid `linkium_session` cookie + `X-CSRF-Token` + valid `Origin`. Atomically replaces the authenticated user's selected interests.

**Request Body:**
```json
{
  "interestIds": ["uuid"]
}
```

### `PUT /api/v1/profiles/me/goals`

Requires valid `linkium_session` cookie + `X-CSRF-Token` + valid `Origin`. Atomically replaces the authenticated user's goals (`find_collaborators`, `discover_projects`, `find_internships`, `find_jobs`, `build_startup`, `join_team`, `learn_skills`, `participate_competitions`, `find_mentors`, `share_ideas`).

**Request Body:**
```json
{
  "goals": ["find_collaborators", "discover_projects"]
}
```

---

## Standard Error Codes

| HTTP Status | Scenario |
|---|---|
| `400` | Malformed JSON body, Zod validation failure, invalid/expired/used token, or incomplete onboarding |
| `401` | Invalid credentials or missing/expired/revoked session cookie |
| `403` | Unverified email, suspended account, disallowed CORS/Origin, or invalid CSRF token |
| `404` | Unknown endpoint (`ROUTE_NOT_FOUND`) |
| `409` | Registration conflict or `USERNAME_TAKEN` |
| `413` | Request body exceeds `100kb` limit |
| `429` | Rate limit exceeded (`RATE_LIMIT_EXCEEDED`) |
| `500` | Unhandled internal server error (sanitized) |
| `502` | Transactional email provider failure (`EMAIL_DELIVERY_FAILED`) |
| `503` | PostgreSQL connection failure during health check |
