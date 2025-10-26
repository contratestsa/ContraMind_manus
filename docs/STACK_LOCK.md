# Stack Lock

**Purpose:** Keep the technology stack consistent and predictable.

## Frontend
- React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (Radix primitives)
- Vite 7
- Wouter routing
- PostHog (analytics), Sentry (errors)

## Backend
- Node 22, Express 4
- tRPC 11
- Drizzle ORM (MySQL/TiDB now; migration path to PostgreSQL supported)
- Tap Payments, Resend email
- Google Gemini 2.5 Pro

## Infrastructure
- Manus Platform (OAuth, hosting, storage)
- OpenTelemetry (traces/metrics/logs)
- GitHub Actions for CI/CD (gates defined in QUALITY_GATES.md)

## Rules
- No alternative UI frameworks/components without ADR.
- New packages require: rationale, impact, and size/security review.
- Versions pinned; Renovate/Dependabot PRs only (no auto-merge for majors).

