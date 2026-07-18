import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { requestId } from "./middleware/requestId";
import { apiRouter } from "./routes";
import { createAuthRoutes } from "./routes/auth.routes";
import {
  createAuthController,
  type AuthControllerDeps,
} from "./controllers/auth.controller";
import { NotImplementedTokenIssuer } from "./auth/tokenIssuer";
import type { UsersRepository } from "./repositories/users.repository";

export type AppDeps = {
  /** Injected for tests / when pool is ready. */
  auth?: Partial<AuthControllerDeps>;
};

/** Fail-closed users repo when SQL pool is not wired (Phase 3.4 default). */
function unavailableUsersRepository(): UsersRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    findById: fail,
    findByEmail: fail,
  } as unknown as UsersRepository;
}

export function createApp(deps: AppDeps = {}) {
  const app = express();
  app.use(express.json());
  app.use(requestId);
  app.use("/api", apiRouter);

  const authDeps: AuthControllerDeps = {
    users: deps.auth?.users ?? unavailableUsersRepository(),
    tokenIssuer: deps.auth?.tokenIssuer ?? new NotImplementedTokenIssuer(),
  };
  app.use("/v1/auth", createAuthRoutes(createAuthController(authDeps)));

  app.use(errorHandler);
  return app;
}
