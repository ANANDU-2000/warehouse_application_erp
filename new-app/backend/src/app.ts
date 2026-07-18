import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { requestId } from "./middleware/requestId";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(requestId);
  app.use("/api", apiRouter);
  app.use(errorHandler);
  return app;
}
