# Observability

## Signals
- **Traces**: OpenTelemetry SDK (HTTP/Express/tRPC, DB)
- **Metrics**: request latency/throughput, error rates, queue depth
- **Logs**: structured with traceId/spanId, user/tenant (when appropriate)

## Error Monitoring
- **Sentry**: JavaScript errors, API failures, performance issues

## Product Analytics
- **PostHog**: key events (signup, upload, analyze, pay, ticket)

## Web Vitals (RUM)
- Capture LCP/CLS/INP with `web-vitals`
- Store in analytics and/or `/api/rum`

## SLOs & Alerts
- Define SLOs per critical flow; manage error budgets
- Alerts on SLO burn-rate, high error rate, and missing spans

## Dashboards
- API latency/availability, Web Vitals, errors, signups, payments

