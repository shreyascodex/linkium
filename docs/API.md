# LINKIUM Backend API Documentation

Base prefix: `/api/v1`

All responses follow a consistent JSON envelope.

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
      "message": "Valid email required"
    }
  ]
}
```

Every response includes an `X-Request-Id` header for correlation.

---

## Endpoints

### `GET /api/v1/health`

Checks API availability and verifies live PostgreSQL connectivity via Prisma (`SELECT 1`).

#### Healthy Response — `200 OK`
```json
{
  "success": true,
  "message": "LINKIUM API is running",
  "data": {
    "status": "healthy",
    "database": "connected"
  }
}
```

#### Database Unavailable — `503 Service Unavailable`
```json
{
  "success": false,
  "message": "Database is unavailable",
  "errors": [
    {
      "code": "DATABASE_UNAVAILABLE",
      "message": "PostgreSQL connection check failed."
    }
  ]
}
```

---

## Standard Error Codes

| HTTP Status | Scenario |
|---|---|
| `400` | Malformed JSON body or Zod validation failure |
| `403` | Request `Origin` rejected by CORS policy |
| `404` | Unknown endpoint (`ROUTE_NOT_FOUND`) |
| `413` | Request body exceeds `100kb` limit |
| `500` | Unhandled internal server error (sanitized; no stack traces or credentials exposed) |
| `503` | PostgreSQL connection failure during health check |

---

## Stage 2A Scope Note

Authentication, registration, email verification, user profiles, and onboarding endpoints are intentionally deferred to subsequent stages.
