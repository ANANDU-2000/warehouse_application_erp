import { Router, type Request, type Response } from "express";

const poolPromise = (async () => {
  const m = await import("../config/database");
  return (m as any).poolPromise ?? (m as any).default?.poolPromise;
})();

export function createHealthRoutes(): Router {
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    res.json({
      service: "HEXA Purchase Assistant API",
      version: "2.0",
      docs: "/docs",
      health: "/health",
    });
  });

  router.head("/", (_req: Request, res: Response) => {
    res.status(200).end();
  });

  router.get("/live", (_req: Request, res: Response) => {
    res.json({ alive: true });
  });

  router.get("/ready", async (_req: Request, res: Response) => {
    try {
      const pool = await poolPromise;
      if (!pool) throw new Error("No pool");
      const request = pool.request();
      await request.query("SELECT 1");
      res.json({ ready: true, database: "connected" });
    } catch {
      res.status(503).json({ ready: false, database: "disconnected" });
    }
  });

  return router;
}
