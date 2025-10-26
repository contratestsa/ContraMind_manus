// server/_core/security.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

/**
 * Production security baseline for the API.
 * Applies headers, CORS, body limits, HPP, and rate limits.
 */
export function applySecurity(app: express.Express) {
  // Hide Express
  app.disable("x-powered-by");

  // Request size limits
  const bodyLimit = process.env.REQUEST_BODY_LIMIT || "1mb";
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: bodyLimit }));

  // CORS allowlist
  const allow = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true); // same-origin / server-to-server
        if (allow.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // Secure headers + CSP (tune PostHog host if used)
  app.use(
    helmet({
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      crossOriginResourcePolicy: { policy: "same-origin" },
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", "data:"],
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "connect-src": [
            "'self'",
            process.env.VITE_POSTHOG_HOST || "https://app.posthog.com",
            "https:",
            "wss:",
          ],
          "frame-ancestors": ["'self'"],
          "upgrade-insecure-requests": [],
        },
      },
    })
  );

  // HTTP Parameter Pollution protection
  app.use(hpp());

  // ---- Rate limits ----
  const std = {
    windowMs: 15 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
  };

  // Global API limit
  const maxGlobal = Number(process.env.RATE_LIMIT_GLOBAL || 300);
  app.use("/api", rateLimit({ ...std, max: maxGlobal }));

  // Sensitive endpoints
  app.use(
    "/api/auth",
    rateLimit({
      ...std,
      windowMs: 60 * 1000,
      max: Number(process.env.RATE_LIMIT_LOGIN_PER_MINUTE || 5),
    })
  );
  app.use(
    "/api/upload",
    rateLimit({
      ...std,
      max: Number(process.env.RATE_LIMIT_UPLOAD_PER_15MIN || 30),
    })
  );
  app.use(
    "/api/payments/webhook",
    rateLimit({
      ...std,
      max: Number(process.env.RATE_LIMIT_WEBHOOK_PER_15MIN || 60),
    })
  );
}

