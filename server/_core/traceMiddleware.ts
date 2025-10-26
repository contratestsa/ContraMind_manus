import { Request, Response, NextFunction } from 'express';
import { getTraceId, getSpanId } from './tracing';

/**
 * Middleware to inject trace ID into logs and response headers
 * 
 * This middleware:
 * 1. Extracts the current trace ID and span ID from the active OpenTelemetry span
 * 2. Adds X-Trace-Id and X-Span-Id headers to the response
 * 3. Attaches trace info to the request object for logging
 * 
 * Usage:
 * app.use(traceMiddleware);
 */
export function traceMiddleware(req: Request, res: Response, next: NextFunction) {
  const traceId = getTraceId();
  const spanId = getSpanId();

  // Add trace ID to response headers for client-side correlation
  if (traceId) {
    res.setHeader('X-Trace-Id', traceId);
  }
  if (spanId) {
    res.setHeader('X-Span-Id', spanId);
  }

  // Attach trace info to request for logging
  (req as any).traceId = traceId;
  (req as any).spanId = spanId;

  // Override console.log to include trace ID in logs
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  const addTraceToLog = (level: string, ...args: any[]) => {
    if (traceId) {
      return [`[${level}] [trace:${traceId.substring(0, 16)}]`, ...args];
    }
    return [`[${level}]`, ...args];
  };

  // Temporarily override logging functions for this request
  console.log = (...args: any[]) => originalLog(...addTraceToLog('INFO', ...args));
  console.error = (...args: any[]) => originalError(...addTraceToLog('ERROR', ...args));
  console.warn = (...args: any[]) => originalWarn(...addTraceToLog('WARN', ...args));

  // Restore original logging functions after response
  res.on('finish', () => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  });

  next();
}

/**
 * Enhanced logging function that always includes trace ID
 * 
 * Usage:
 * import { logWithTrace } from './traceMiddleware';
 * logWithTrace('info', 'User logged in', { userId: 123 });
 */
export function logWithTrace(level: 'info' | 'error' | 'warn' | 'debug', message: string, meta?: any) {
  const traceId = getTraceId();
  const spanId = getSpanId();
  
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    traceId,
    spanId,
    ...meta,
  };

  const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  logFn(JSON.stringify(logData));
}

