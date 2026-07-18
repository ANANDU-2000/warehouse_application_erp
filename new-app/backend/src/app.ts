import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { requestId } from "./middleware/requestId";
import { apiRouter } from "./routes";
import { createAuthRoutes } from "./routes/auth.routes";
import {
  createAuthController,
  type AuthControllerDeps,
} from "./controllers/auth.controller";
import { JwtTokenIssuer } from "./auth/jwtTokenIssuer";
import type { UsersRepository } from "./repositories/users.repository";
import type { MembershipsRepository } from "./repositories/memberships.repository";
import {
  createAuthzMiddleware,
  type AuthzMiddleware,
} from "./middleware/authz";

export type AppDeps = {
  /** Injected for tests / when pool is ready. */
  auth?: Partial<AuthControllerDeps>;
  /** Repos for authz middleware factories (Phase 3.6). */
  users?: UsersRepository;
  memberships?: MembershipsRepository;
};

/** Fail-closed users repo when SQL pool is not wired. */
function unavailableUsersRepository(): UsersRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    findById: fail,
    findByEmail: fail,
  } as unknown as UsersRepository;
}

function unavailableMembershipsRepository(): MembershipsRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    findById: fail,
    listByUserId: fail,
    findByUserAndBusiness: fail,
  } as unknown as MembershipsRepository;
}

export type AppWithAuthz = express.Express & {
  /** Authz middleware bundle — for future /v1/businesses/:businessId routes. */
  authz: AuthzMiddleware;
};

export function createApp(deps: AppDeps = {}): AppWithAuthz {
  const app = express() as AppWithAuthz;
  app.use(express.json());
  app.use(requestId);
  app.use("/api", apiRouter);

  const users = deps.users ?? deps.auth?.users ?? unavailableUsersRepository();
  const memberships = deps.memberships ?? unavailableMembershipsRepository();

  const authDeps: AuthControllerDeps = {
    users,
    tokenIssuer: deps.auth?.tokenIssuer ?? new JwtTokenIssuer(),
  };
  app.use("/v1/auth", createAuthRoutes(createAuthController(authDeps)));

  app.authz = createAuthzMiddleware(users, memberships);

  app.use(errorHandler);
  return app;
}
