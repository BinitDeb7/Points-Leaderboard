// ✅ Load environment variables
import 'dotenv/config';

import express, { type Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ MongoDB connection using env variable
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1); // Exit if not defined
}

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// ✅ Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // ✅ Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // ✅ Use Vite in dev only
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ✅ Listen on Render-compatible port
  const port = process.env.PORT || 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`🌐 Server running on port ${port}`);
  });
})();
