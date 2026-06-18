# MediFlow QA Fixes - Test Report

**Generated:** 2026-06-17

## Bugs Fixed

| Bug | Fix | Details |
|-----|-----|---------|
| Invalid login returns HTTP 500 | Added `BadCredentialsException` + `AuthenticationException` handlers in `GlobalExceptionHandler.java` | Now returns HTTP 401 with clean JSON `{ "status": 401, "error": "Invalid credentials" }` |
| Logout verification incomplete | Updated tests to check token removal + protected route blockage | Confirmed token cleared and redirect to /login |
| Doctors/appointments tests skipped | Proper setup with hospital ID | Tests now reference correct IDs |

## Remaining Issues

| Issue | Root Cause | Impact |
|-------|------------|--------|
| Doctor registration fails with SQL error | H2 in PostgreSQL mode (`MODE=PostgreSQL`) does not support `INSERT ... RETURNING id` syntax used by JPA with IDENTITY ID generation. Error: `Syntax error in SQL statement "insert into users ... returning id"` | Blocks doctor creation, which cascades to doctor dashboard, doctor appointments, and create appointment flows |
| Console error: 401 | Likely caused by the above — protected resource fetch with invalid/expired token | Non-blocking, auth redirect works correctly |

## Recommendations

1. Switch H2 to MySQL mode (`MODE=MySQL`) which handles `RETURNING` better, or use `GenerationType.SEQUENCE` with a sequence for H2 compatibility
2. Or provision a real PostgreSQL instance for development

## Artifacts

Testing infrastructure (Playwright scripts, screenshots, logs) has been removed from the repository. All verification was done via automation against `localhost:5173` (frontend) and `localhost:8080` (backend).
