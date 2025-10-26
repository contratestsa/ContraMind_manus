# Manus Operating Guide (ContraMind.ai) — 2025-10-26

This guide defines **how** we work with the Manus AI agent and GitHub.

## README vs REPO_PATH
- **README** — a file in the repo explaining what the project is, how to run it, and how to contribute.
- **REPO_PATH** — not a file; the absolute path to the project on the machine (e.g., `/home/ubuntu/contramind-app`).

## The 15 Essential Prompts
1) Repo Baseline & CI Gates
2) Web Vitals RUM (LCP/CLS/INP)
3) OpenTelemetry Tracing
4) Security Hardening
5) Payments Webhook + Reconciliation
6) i18n/RTL Pass
7) Accessibility Pass (WCAG 2.2 AA)
8) Performance Budgets
9) Auth & RBAC
10) Data Model + Migrations
11) Files & Storage Pipeline
12) AI Prompt Library
13) Analytics + KPIs
14) E2E Critical Paths
15) Documentation Update (README/ADR/Impact Note)

## Agent Procedures (Every Task)
1. Scope & Impact → write acceptance criteria and an Impact Note.
2. Plan → steps, risks, rollback.
3. Branch → `feat/…` or `fix/…` from up-to-date `master`.
4. Implement → small commits; keep cohesive changes only.
5. Self-test → unit/integration/E2E; local build.
6. Docs → README/ADR updates; finalize the PR Impact Note.
7. PR → open with checklist; CI must pass.
8. Merge & Release → flags/canary if risky.
9. Post-deploy → check dashboards/alerts; record learnings.

## Quality Gates (what "good" means)
- **Accessibility**: WCAG 2.2 AA.
- **Performance**: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms (p75).
- **Security**: OWASP ASVS & OWASP API Top 10 (2023); secrets/deps/SAST scans.
- **i18n/RTL**: CSS logical properties; mirrored icons; RTL tests.
- **Observability**: OpenTelemetry traces/metrics/logs; Sentry; PostHog.
- **Docs**: README/ADR/Runbook updated; PR Impact Note present.

## Checkpoints & Checklists
- **Definition of Ready**: goal, acceptance, impact, risks, tests defined.
- **In-Progress**: small commits; local checks pass.
- **Definition of Done**: CI green; a11y/perf/security verified; docs updated.

## Logs & Audits
- Structured logs with trace IDs; audit logs for admin actions and payments; webhook event log with dedupe status.
- Never log secrets or PII; redact tokens; set retention & rotation.

## Avoid Manus ↔ GitHub conflicts
- GitHub `master` is source of truth.
- Always `git pull --rebase`, branch per task, open PR, never force-push `master`.
- Use PR template and checklists.

