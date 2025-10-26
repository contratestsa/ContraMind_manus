import { trace, context as otelContext, SpanStatusCode } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { MySQL2Instrumentation } from '@opentelemetry/instrumentation-mysql2';

/**
 * OpenTelemetry Tracing Configuration
 * 
 * Provides distributed tracing for:
 * - HTTP requests (incoming and outgoing)
 * - Express middleware and routes
 * - Database queries (MySQL via mysql2)
 * 
 * Environment Variables:
 * - OTEL_ENABLED: Enable/disable tracing (default: false)
 * - OTEL_SERVICE_NAME: Service name for traces (default: contramind-api)
 * 
 * Usage:
 * Import this file at the very top of server/_core/index.ts before any other imports
 * 
 * Traces are logged to console. To send to a collector (Jaeger, Zipkin, etc.),
 * configure OTEL_EXPORTER_OTLP_ENDPOINT environment variable.
 */

const isEnabled = process.env.OTEL_ENABLED === 'true' || process.env.OTEL_ENABLED === '1';
const serviceName = process.env.OTEL_SERVICE_NAME || 'contramind-api';

let sdk: NodeSDK | null = null;

if (isEnabled) {
  console.log('[OpenTelemetry] Initializing tracing...');
  console.log(`[OpenTelemetry] Service: ${serviceName}`);
  console.log('[OpenTelemetry] Exporter: Console (traces will be logged)');
  console.log('[OpenTelemetry] Instrumented: HTTP, Express, MySQL2');

  // Initialize OpenTelemetry SDK with specific instrumentations
  sdk = new NodeSDK({
    serviceName,
    instrumentations: [
      // HTTP instrumentation (incoming and outgoing HTTP requests)
      new HttpInstrumentation({
        ignoreIncomingRequestHook: (request) => {
          // Ignore health check and static assets
          const url = request.url || '';
          return url.includes('/assets/') || url.includes('/favicon');
        },
      }),
      // Express instrumentation (middleware and route handlers)
      new ExpressInstrumentation(),
      // MySQL2 instrumentation (database queries)
      new MySQL2Instrumentation(),
    ],
  });

  // Start the SDK
  sdk.start();
  console.log('[OpenTelemetry] Tracing initialized successfully');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk?.shutdown()
      .then(() => console.log('[OpenTelemetry] Tracing terminated'))
      .catch((error) => console.error('[OpenTelemetry] Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
} else {
  console.log('[OpenTelemetry] Tracing disabled (set OTEL_ENABLED=true to enable)');
}

/**
 * Get the current trace ID from the active span context
 * Returns undefined if no active span or tracing is disabled
 */
export function getTraceId(): string | undefined {
  if (!isEnabled) return undefined;
  
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    const spanContext = activeSpan.spanContext();
    if (spanContext && spanContext.traceId) {
      return spanContext.traceId;
    }
  }
  return undefined;
}

/**
 * Get the current span ID from the active span context
 * Returns undefined if no active span or tracing is disabled
 */
export function getSpanId(): string | undefined {
  if (!isEnabled) return undefined;
  
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    const spanContext = activeSpan.spanContext();
    if (spanContext && spanContext.spanId) {
      return spanContext.spanId;
    }
  }
  return undefined;
}

/**
 * Check if tracing is enabled
 */
export function isTracingEnabled(): boolean {
  return isEnabled;
}

export { sdk, trace, otelContext as context, SpanStatusCode };

