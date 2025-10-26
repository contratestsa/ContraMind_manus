import "dotenv/config";
// IMPORTANT: Import tracing FIRST before any other imports to ensure proper instrumentation
import "./tracing";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import rumRouter from "../routes/rum";
import healthRouter from "../routes/health";
import { traceMiddleware } from "./traceMiddleware";
import { applySecurity } from "./security";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Apply security middleware (Helmet, CORS, rate limiting, HPP)
  // Note: This includes body parser configuration, so remove duplicate below
  applySecurity(app);
  
  // Add trace ID middleware to inject trace IDs into logs and response headers
  app.use(traceMiddleware);
  // Test route to verify routing works
  app.get("/api/test", (req, res) => {
    res.json({ message: "Test route works" });
  });
  
  // RUM (Real User Monitoring) API - must be before OAuth to avoid auth middleware
  app.use("/api", rumRouter);
  
  // Health check endpoint
  app.use("/api", healthRouter);
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Global error handler (must be after all routes)
  app.use((err: any, req: any, res: any, _next: any) => {
    const status = err?.status || 500;
    const traceId = res.getHeader("X-Trace-Id") || req.headers["x-trace-id"];
    if (status >= 500) {
      console.error("Unhandled error", { traceId, message: err?.message });
    }
    res.status(status).json({
      error: err?.code || "internal_error",
      message: process.env.NODE_ENV === "production" ? "Internal server error" : err?.message,
      traceId,
    });
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
