# Quality Gates & Budgets

## CI Stages
1. **Type check** (tsc --noEmit)
2. **Lint** (eslint)
3. **Unit + Integration tests** (vitest/playwright where applicable)
4. **Security**: dependency audit/SBOM, secrets scan, SAST
5. **Accessibility**: automated checks (axe/pa11y) for changed routes
6. **Performance**: Lighthouse lab + Web Vitals budgets
7. **Build**: reproducible; artifacts uploaded

## Web Vitals Targets (p75)
- LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms

## Budgets (per route)
- JS initial/total size, image weight, request count
- Build fails on regression

## Security Baseline
- Input validation, rate-limits, CSRF/cookies
- Webhook signature verification + idempotency
- OWASP ASVS / API Top 10 (2023) spot checks

## Observability
- OpenTelemetry traces/metrics/logs shipped for new code paths
- Sentry breadcrumbs; PostHog events for key actions

## Documentation
- README, ADRs, Runbooks updated with any relevant change

