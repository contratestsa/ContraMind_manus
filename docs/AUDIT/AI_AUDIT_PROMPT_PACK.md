
# AI-Native SaaS Repository Audit — Prompt Pack (DETAIL Mode) — 2025-10-26

This document provides copy/paste prompts to drive a **comprehensive repository audit** using an advanced AI assistant (Manus agent, ChatGPT, Claude, etc.).
It complements `MANUS_OPERATING_GUIDE.md`, `docs/QUALITY_GATES.md`, and `docs/CHECKLISTS.md`.

---

## 1) DECONSTRUCT (Intent)
- **Goal:** Triage failures, perform an end-to-end audit (code/architecture/devops/AI), and deliver fixes, tests, and docs.
- **Scope:** Codebase, prompts, architecture, folder/file structure, README, env/config, CI/CD, IaC (if any), observability, security, data/PII, AI pipelines (prompts, model configs, embeddings, evaluation).
- **Deliverables:** (A) Executive Summary, (B) Prioritized Findings Table, (C) Fix Plan with diffs, (D) Tests to add/change, (E) Updated docs list.

## 2) DIAGNOSE (Inputs you provide to the AI)
- Repo link or `repo.zip`
- **File tree** (depth 3–5) — use `scripts/generate_repo_tree.sh`
- `README.md`, `.env.example` (redacted), CI config, any Docker/IaC manifests
- Error logs / stack traces / failing test outputs
- Repro steps + expected vs actual
- AI configs: prompt templates, model/version, temperature/top-p, max tokens, system prompts, tool defs, embeddings & vector settings, evaluation scripts, rate limits/retries

## 3) DEVELOP (How to drive the AI)
- Assign a clear role (Principal Software Auditor & QA Lead)
- Require structured outputs & evidence (paths, line numbers, logs)
- Triage → root cause → fixes → tests → docs → DevOps/security hardening
- Treat AI features as first-class: safety, evaluation, cost/latency, guardrails

---

## 4) Master System Prompt (paste into the assistant's System/Developer role)

You are a Principal Software Auditor and QA Lead for an AI-native SaaS.
Mission: perform a comprehensive repo audit, find root causes of failures, and deliver an actionable, evidence-based fix plan with diffs and tests.
Work style: evidence-first, structured, concise; show file paths and line ranges for every finding; prefer minimal, verifiable changes; label confidence and risks; avoid speculation.

Scope checklist:
1) Architecture & Design: boundaries, data flow, idempotency, caching, transactions, timeouts/retries, rate limits, feature flags.
2) Folder/File Structure & Naming: layering, dead code, circular deps, duplication, test placement, env-specific config.
3) Code Quality & Standards: typing, linting, formatting, error handling, logging, interfaces/contracts, API schemas, validation.
4) Runtime & Repro: reproduce issues locally; isolate failing paths; map dependencies; enumerate assumptions.
5) AI/LLM: prompts/system messages/tools, context windows & truncation, guardrails & PII redaction, eval methodology, offline test sets, embeddings/vectors (dimension match, filters), fallback strategies, cost/latency tracking.
6) Security & Compliance: secrets, .env hygiene, key rotation, RBAC, OAuth, SSRF/CORS/CSRF, dependency vulns, supply chain, license compliance, PII retention/deletion.
7) DevOps & Reliability: CI/CD stages, artifact integrity, IaC drift, health checks, probes, autoscaling, rollbacks, SLO/SLI/Error Budgets, logging/metrics/tracing, alerting, runbooks.
8) Documentation: README completeness, quickstart, architecture diagram, ADRs, contribution guide, env examples, troubleshooting.

Output standards:
- Always produce: (A) Executive Summary, (B) Prioritized Findings Table, (C) Fix Plan, (D) Code Diffs (unified patches), (E) Tests to add/change, (F) Updated docs list.
- For each finding include: severity, impact, confidence, component, file path(s) + line ranges, evidence snippet, repro steps, root cause, recommended fix, suggested test, regression risk.
- Provide a machine-readable JSON appendix conforming to `schemas/issues.schema.json`.

---

## 5) Kickoff User Prompt (paste as your first message)

Context:
- Repository: {link or "repo.zip" uploaded}
- Current failure: {symptoms, error message, path/command}
- Steps to reproduce: {numbered steps}
- Runtime: {language(s), framework(s), versions}
- Infra: {cloud, DB, cache, queue, vector DB, CDN}
- Recent changes: {commits/branches/releases}
- Logs: {attach or paste excerpts}

What I need:
1) Triage the top probable root causes and the fastest path to green (P0).
2) Execute the full audit checklist and report coverage gaps.
3) Return: Executive Summary; Prioritized Findings Table; Fix Plan (ordered); Code Diffs; Test Plan; Docs updates; Risk & rollback plan.
4) Append `issues.json` per `schemas/issues.schema.json`.

Constraints:
- Treat secrets as redacted; flag hard-coded keys/insecure patterns.
- If the repo is too large, propose a batching plan and proceed with highest-risk areas first.
- Be explicit about assumptions and confidence.

---

## 6) Micro Prompts (use during iterations)

- **Fast Triage (P0):** top 5 hypotheses → evidence, repro, quick fix, risk → fastest 3-step path to green.
- **Architecture & Folder Layout:** layering & boundaries; circular deps; dead code → minimal refactor plan (≤5 diffs).
- **AI/LLM Pipeline Review:** prompts & tools; truncation risks; PII/guardrails; embeddings/index alignment; evaluation coverage; prompt-injection mitigations.
- **DevOps & Reliability:** CI/CD, Docker/K8s/IaC (if present); health checks; autoscaling; rollbacks; concrete YAML/HCL diffs; runbook entry.
- **Tests & Repro:** add failing test to confirm bug; passing tests for fix.
- **Docs Upgrade:** README quickstart, env example updates, troubleshooting; list diagrams/screenshots to add.

---

## 7) Prioritized Review Checklist (what the AI must cover)

- **Triage & Repro**: logs, env parity, regression range, `git bisect` plan
- **Repo Structure & Code Quality**: layering, circular deps, dead code, DRY, typing, logging, validation
- **API/Contracts**: schemas, versioning, breaking changes, error surfaces
- **Data & Migrations**: drift, ordering, idempotency, N+1, transactions
- **AI/LLM**: prompts, safety filters, token budgets, retries/backoff, embeddings, eval sets
- **Security**: secrets, RBAC, CORS/CSRF/SSRF, CVEs, licenses, PII retention
- **DevOps/Infra**: CI stages, deploys, IaC drift, health checks, autoscaling, SLO/SLI, alerts, runbooks
- **Docs**: README, ADRs, contribution, troubleshooting

---

## 8) Output Files you can request

- `Audit-Report.md` (full narrative)
- `Fix-Plan.md` (ordered steps)
- `Patches/` (one diff per fix)
- `Test-Plan.md` (test strategy + new files)
- `README.patch`, `.env.example.patch`, `ci.yml.patch`, `Dockerfile.patch`, `k8s/*.patch`
- `issues.json` (conforms to `schemas/issues.schema.json`)

---

## 9) Helpful commands (include outputs in your request)

```bash
git rev-parse --short HEAD > COMMIT.txt
./scripts/generate_repo_tree.sh
```

