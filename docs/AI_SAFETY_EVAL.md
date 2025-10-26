
# AI Safety & Evaluation — 2025-10-26

## Safety & Guardrails
- PII redaction on inputs; disallow secrets and tokens in prompts/logs
- Prompt-injection defenses: allowlists for tools, sanitize URLs, strip system prompts from user input
- Content filters and output constraints
- Rate limiting and backoff; retries with jitter; circuit breakers for upstream models

## Cost & Latency
- Track tokens and latency per request (span attributes in OTel)
- Alerts for sustained p95 latency spikes and budget overruns

## Evaluation
- Offline test sets ("golden prompts") with expected outputs and tolerance thresholds
- Regression tests in CI for prompts and tools
- Human feedback loop (thumbs up/down), sampled manual reviews

## Embeddings & Vectors (if used)
- Model/dimension alignment, index maintenance strategy, filters and metadata
- Do not index secrets; respect data retention and deletion
