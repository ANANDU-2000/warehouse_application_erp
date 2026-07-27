import { Router, type Request, type Response } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import { subscribeBusinessEvents, recentBusinessEvents, publishBusinessEvent } from "../services/realtimeEvents.service";

export function createRealtimeRoutes(authz: AuthzMiddleware): Router {
  const router = Router({ mergeParams: true });

  router.get("/events", authz.requireAuth, authz.requireMembership, (req: Request, res: Response) => {
    const businessId = (req as any).businessId as string;
    if (!businessId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const unsubscribe = subscribeBusinessEvents(businessId, (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    const pingInterval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: "ping", business_id: businessId })}\n\n`);
    }, 30000);

    req.on("close", () => {
      clearInterval(pingInterval);
      unsubscribe();
    });
  });

  router.get("/recent", authz.requireAuth, authz.requireMembership, (req: Request, res: Response) => {
    const businessId = (req as any).businessId as string;
    if (!businessId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)));
    const events = recentBusinessEvents(businessId, limit);
    res.json(events);
  });

  return router;
}

export { publishBusinessEvent };
