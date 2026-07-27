import { Router } from "express";
import type { PublicController } from "../controllers/public.controller";

export function createPublicRoutes(controller: PublicController): Router {
  const router = Router();

  router.get("/items/:token.json", controller.getItemByToken);
  router.get("/items/:token", controller.getItemByToken);
  router.get("/lookup", controller.getItemByBarcode);

  return router;
}
