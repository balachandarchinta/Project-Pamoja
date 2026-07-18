import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { startOrchestrator } from "./server/orchestration.js";
import { registerSSE } from "./server/sse.js";
import { setupApiRoutes } from "./server/api.js";
import http from "http";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());

  // Real-time SSE endpoint
  registerSSE(app);

  // API Routes for approvals, data, etc.
  setupApiRoutes(app);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = http.createServer(app);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    
    // Start background agent orchestration loop
    startOrchestrator();
  });
}

startServer();
