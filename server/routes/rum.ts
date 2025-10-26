import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db';
import { rumMetrics } from '../../drizzle/schema';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter: max 100 requests per 15 minutes per IP
const rumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many RUM requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema for RUM payload
const rumPayloadSchema = z.object({
  name: z.enum(['LCP', 'CLS', 'INP', 'FCP', 'TTFB', 'FID']),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number(),
  id: z.string(),
  navigationType: z.string(),
  url: z.string().url(),
  timestamp: z.number(),
});

/**
 * POST /api/rum
 * Store Web Vitals metrics from client
 */
router.post('/rum', rumLimiter, async (req, res) => {
  try {
    // Validate payload
    const payload = rumPayloadSchema.parse(req.body);

    // Get client IP for tracking
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    // Insert into database
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }
    
    await db.insert(rumMetrics).values({
      metricName: payload.name,
      metricValue: Math.round(payload.value), // Convert to int
      metricRating: payload.rating,
      metricDelta: Math.round(payload.delta),
      metricId: payload.id,
      navigationType: payload.navigationType,
      url: payload.url,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: String(clientIp),
    });

    res.status(201).json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload',
        details: error.issues,
      });
    }

    console.error('[RUM API] Error storing metric:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store metric',
    });
  }
});

/**
 * GET /api/rum/metrics
 * Get recent RUM metrics (admin only)
 */
router.get('/rum/metrics', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }
    
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    const metrics = await db
      .select()
      .from(rumMetrics)
      .orderBy(rumMetrics.createdAt)
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: metrics,
      pagination: {
        limit,
        offset,
        total: metrics.length,
      },
    });
  } catch (error) {
    console.error('[RUM API] Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
    });
  }
});

export default router;

