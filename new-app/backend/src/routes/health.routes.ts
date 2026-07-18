import { Router } from "express";
import { getHealth } from "../controllers/health.controller";

export const healthRoutes = Router();

healthRoutes.get("/", (req, res, next) => {
  void getHealth(req, res, next);
});
