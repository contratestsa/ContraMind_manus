import { Router } from 'express';
import { getTraceId, getSpanId, isTracingEnabled } from '../_core/tracing';

const router = Router();

/**
 * Health check endpoint
 * Returns server status and trace information
 */
router.get('/health', (req, res) => {
  const traceId = getTraceId();
  const spanId = getSpanId();
  
  console.log('[Health] Trace ID:', traceId, 'Span ID:', spanId, 'Enabled:', isTracingEnabled());
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    tracing: {
      enabled: !!traceId,
      traceId,
      spanId,
    },
  });
});

export default router;
