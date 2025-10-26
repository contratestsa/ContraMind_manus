# Incident Response Runbook

## 0. Declare & Triage
- Page on-call
- Gather context: dashboards, recent deploys, alerts, error logs

## 1. Payments/Webhooks
- Verify Tap webhook signature; check idempotency log
- Run reconciliation job; resolve orphaned states
- Communicate impact (affected users, retries)

## 2. AI Degradation
- Check model latency/errors; fail over to backup or cached responses
- Rate cap requests; inform UI via banner

## 3. Database
- Confirm DB health; slow queries/locks; apply read replicas if needed
- Restore from backup if data loss suspected (follow backup runbook)

## 4. Rollback
- Use feature flag disable or canary rollback
- Verify recovery in dashboards

## 5. Postmortem
- Timeline, root cause, fixes, follow-ups; ADR if architectural change

