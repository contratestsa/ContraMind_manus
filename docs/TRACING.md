# OpenTelemetry Distributed Tracing

This document describes the OpenTelemetry tracing implementation in ContraMind.ai for end-to-end observability.

## Overview

The application uses **OpenTelemetry** to provide distributed tracing across:
- **HTTP requests** (incoming and outgoing)
- **Express middleware and routes**
- **Database queries** (MySQL via mysql2)
- **tRPC procedures**

Traces include unique trace IDs and span IDs that are injected into logs and response headers for correlation.

## Architecture

### Components

1. **OpenTelemetry SDK** (`server/_core/tracing.ts`)
   - Initializes the OpenTelemetry Node SDK
   - Configures instrumentations for HTTP, Express, and MySQL2
   - Exports trace context helpers

2. **Trace Middleware** (`server/_core/traceMiddleware.ts`)
   - Injects trace IDs into response headers (`X-Trace-Id`, `X-Span-Id`)
   - Enhances logging with trace context
   - Provides structured logging helpers

3. **Health Endpoint** (`server/routes/health.ts`)
   - Returns tracing status and current trace IDs
   - Useful for verifying tracing configuration

### Instrumentation

The following components are automatically instrumented:

| Component | Package | What's Traced |
|-----------|---------|---------------|
| HTTP | `@opentelemetry/instrumentation-http` | Incoming/outgoing HTTP requests |
| Express | `@opentelemetry/instrumentation-express` | Middleware, route handlers |
| MySQL2 | `@opentelemetry/instrumentation-mysql2` | Database queries |

## Configuration

### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `OTEL_ENABLED` | Enable/disable tracing | `false` | `true` or `1` |
| `OTEL_SERVICE_NAME` | Service name in traces | `contramind-api` | `contramind-production` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP collector endpoint | (console) | `http://localhost:4318/v1/traces` |

### Enabling Tracing

**Development:**
```bash
OTEL_ENABLED=true pnpm run dev
```

**Production:**
Set environment variables in your deployment platform:
```
OTEL_ENABLED=true
OTEL_SERVICE_NAME=contramind-production
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-collector.example.com/v1/traces
```

## Usage

### Accessing Trace IDs

Trace IDs are automatically available in:

1. **Response Headers**
   ```
   X-Trace-Id: 4bf92f3577b34da6a3ce929d0e0e4736
   X-Span-Id: 00f067aa0ba902b7
   ```

2. **Server Logs**
   ```
   [INFO] [trace:4bf92f3577b34da6] Processing contract upload
   ```

3. **Health Endpoint**
   ```bash
   curl http://localhost:3000/api/health
   ```
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-26T22:45:14.864Z",
     "tracing": {
       "enabled": true,
       "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
       "spanId": "00f067aa0ba902b7"
     }
   }
   ```

### Programmatic Access

```typescript
import { getTraceId, getSpanId, isTracingEnabled } from './server/_core/tracing';

// In your code
const traceId = getTraceId(); // Returns current trace ID or undefined
const spanId = getSpanId();   // Returns current span ID or undefined

if (isTracingEnabled()) {
  console.log(`Processing request with trace ${traceId}`);
}
```

### Structured Logging

Use the `logWithTrace` helper for structured logging:

```typescript
import { logWithTrace } from './server/_core/traceMiddleware';

logWithTrace('info', 'User logged in', { userId: 123, email: 'user@example.com' });
```

Output:
```json
{
  "timestamp": "2025-10-26T22:45:14.864Z",
  "level": "info",
  "message": "User logged in",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "userId": 123,
  "email": "user@example.com"
}
```

## Trace Collectors

### Console Exporter (Default)

When no `OTEL_EXPORTER_OTLP_ENDPOINT` is configured, traces are logged to console.

**Example trace output:**
```json
{
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "name": "GET /api/health",
  "kind": "SERVER",
  "startTime": "2025-10-26T22:45:14.864Z",
  "endTime": "2025-10-26T22:45:14.872Z",
  "attributes": {
    "http.method": "GET",
    "http.url": "/api/health",
    "http.status_code": 200
  }
}
```

### Jaeger

[Jaeger](https://www.jaegertracing.io/) is an open-source distributed tracing platform.

**Setup:**
```bash
# Run Jaeger all-in-one (development)
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest

# Configure application
export OTEL_ENABLED=true
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
pnpm run dev

# View traces at http://localhost:16686
```

### Datadog

[Datadog APM](https://www.datadoghq.com/product/apm/) provides full-stack observability.

**Setup:**
```bash
# Configure application
export OTEL_ENABLED=true
export OTEL_EXPORTER_OTLP_ENDPOINT=https://http-intake.logs.datadoghq.com/api/v2/logs
export DD_API_KEY=your-datadog-api-key
```

### New Relic

[New Relic](https://newrelic.com/) offers comprehensive observability.

**Setup:**
```bash
# Configure application
export OTEL_ENABLED=true
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.nr-data.net:4318/v1/traces
export NEW_RELIC_API_KEY=your-new-relic-license-key
```

### Honeycomb

[Honeycomb](https://www.honeycomb.io/) specializes in observability for production systems.

**Setup:**
```bash
# Configure application
export OTEL_ENABLED=true
export OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io/v1/traces
export HONEYCOMB_API_KEY=your-honeycomb-api-key
```

## Trace Visualization

### Trace Structure

A typical API request generates the following span hierarchy:

```
GET /api/contracts/123
├── Express middleware: body-parser
├── Express middleware: traceMiddleware
├── Express route: /api/contracts/:id
│   ├── tRPC procedure: contracts.getById
│   │   ├── Database query: SELECT * FROM contracts WHERE id = ?
│   │   └── Database query: SELECT * FROM users WHERE id = ?
│   └── AI analysis (if applicable)
│       └── HTTP request: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
└── Response sent
```

### Trace Attributes

Each span includes standard OpenTelemetry attributes:

| Attribute | Description | Example |
|-----------|-------------|---------|
| `http.method` | HTTP method | `GET` |
| `http.url` | Request URL | `/api/contracts/123` |
| `http.status_code` | Response status | `200` |
| `db.system` | Database type | `mysql` |
| `db.statement` | SQL query | `SELECT * FROM contracts WHERE id = ?` |
| `net.peer.name` | Remote host | `generativelanguage.googleapis.com` |

## Troubleshooting

### Tracing Not Working

1. **Check if tracing is enabled:**
   ```bash
   curl http://localhost:3000/api/health | jq '.tracing.enabled'
   ```

2. **Verify environment variables:**
   ```bash
   echo $OTEL_ENABLED
   echo $OTEL_SERVICE_NAME
   ```

3. **Check server logs for initialization:**
   ```
   [OpenTelemetry] Initializing tracing...
   [OpenTelemetry] Service: contramind-api
   [OpenTelemetry] Tracing initialized successfully
   ```

### No Trace IDs in Responses

- Ensure `traceMiddleware` is registered in `server/_core/index.ts`
- Check that the middleware is added before route handlers
- Verify that tracing is enabled (`OTEL_ENABLED=true`)

### Traces Not Appearing in Collector

1. **Verify collector endpoint:**
   ```bash
   curl -X POST $OTEL_EXPORTER_OTLP_ENDPOINT \
     -H "Content-Type: application/json" \
     -d '{"test": "connection"}'
   ```

2. **Check network connectivity:**
   - Ensure the collector is reachable from the application
   - Verify firewall rules allow outbound connections

3. **Review collector logs:**
   - Check for authentication errors
   - Verify the endpoint accepts OTLP/HTTP format

### Performance Impact

OpenTelemetry instrumentation has minimal overhead:
- **Latency:** < 1ms per request
- **Memory:** ~50MB additional for SDK
- **CPU:** < 5% increase

To reduce overhead:
- Use sampling (configure in `tracing.ts`)
- Disable filesystem instrumentation (already disabled)
- Filter out high-frequency endpoints (e.g., `/health`, `/metrics`)

## Best Practices

### 1. Use Trace IDs for Correlation

Always include trace IDs in error reports and support tickets:

```typescript
try {
  await processContract(contractId);
} catch (error) {
  const traceId = getTraceId();
  console.error(`Contract processing failed [trace:${traceId}]`, error);
  // Send to error tracking service with trace ID
}
```

### 2. Add Custom Spans

For important operations, create custom spans:

```typescript
import { trace } from './server/_core/tracing';

const tracer = trace.getTracer('contramind-api');

async function analyzeContract(contractId: string) {
  const span = tracer.startSpan('analyze_contract');
  span.setAttribute('contract.id', contractId);
  
  try {
    const result = await performAnalysis(contractId);
    span.setAttribute('analysis.risk_level', result.riskLevel);
    return result;
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

### 3. Filter Sensitive Data

Avoid logging sensitive information in traces:

```typescript
// ❌ Bad: Exposes sensitive data
span.setAttribute('user.password', password);

// ✅ Good: Only log non-sensitive identifiers
span.setAttribute('user.id', userId);
```

### 4. Use Sampling in Production

For high-traffic applications, use sampling to reduce costs:

```typescript
// In tracing.ts
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

sdk = new NodeSDK({
  serviceName,
  traceExporter,
  sampler: new TraceIdRatioBasedSampler(0.1), // Sample 10% of traces
  instrumentations: [...]
});
```

## Integration with Other Tools

### PostHog

Traces can be correlated with PostHog events:

```typescript
import posthog from 'posthog-js';
import { getTraceId } from './server/_core/tracing';

posthog.capture('contract_analyzed', {
  contract_id: contractId,
  trace_id: getTraceId(),
});
```

### Sentry

Include trace IDs in Sentry error reports:

```typescript
import * as Sentry from '@sentry/react';
import { getTraceId } from './server/_core/tracing';

Sentry.captureException(error, {
  tags: {
    trace_id: getTraceId(),
  },
});
```

### Logging Libraries

Integrate with structured logging libraries like Winston or Pino:

```typescript
import winston from 'winston';
import { getTraceId } from './server/_core/tracing';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format((info) => {
      info.traceId = getTraceId();
      return info;
    })(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});
```

## References

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [OpenTelemetry JavaScript SDK](https://github.com/open-telemetry/opentelemetry-js)
- [OTLP Specification](https://opentelemetry.io/docs/specs/otlp/)
- [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

---

**Last Updated:** October 27, 2025  
**Maintained By:** ContraMind.ai Development Team

