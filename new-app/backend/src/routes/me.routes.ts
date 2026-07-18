/**
 * /v1/me routes — inventory: docs/18_API_Inventory.md (me.py).
 * L1: GET /businesses only.
 */
import { Router } from "express";
import type { MeController } from "../controllers/me.controller";
import type { AuthzMiddleware } from "../middleware/authz";

export function createMeRoutes(
  controller: MeController,
  authz: AuthzMiddleware,
): Router {
  const router = Router();

  router.get("/businesses", authz.requireAuth, (req, res, next) => {
    void controller.listBusinesses(req, res, next);
  });

  return router;
}
