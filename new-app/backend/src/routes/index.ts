import { Router } from "express";
import { createHealthRoutes } from "./health.routes";

export const apiRouter = Router();

apiRouter.use("/health", createHealthRoutes());
