/**
 * /v1/auth routes — inventory: docs/18_API_Inventory.md (auth.py).
 */
import { Router } from "express";
import type { AuthController } from "../controllers/auth.controller";

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post("/login", (req, res, next) => {
    void controller.login(req, res, next);
  });
  router.post("/register", controller.register);
  router.post("/forgot-password", controller.forgotPassword);
  router.post("/reset-password", controller.resetPassword);
  router.post("/google", controller.google);
  router.post("/refresh", controller.refresh);

  return router;
}
