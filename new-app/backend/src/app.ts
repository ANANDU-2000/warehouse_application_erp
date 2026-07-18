import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { requestId } from "./middleware/requestId";
import { requestLog } from "./middleware/requestLog";
import { apiRouter } from "./routes";
import { createAuthRoutes } from "./routes/auth.routes";
import { createMeRoutes } from "./routes/me.routes";
import { createDashboardRoutes } from "./routes/dashboard.routes";
import { createReportsRoutes } from "./routes/reports.routes";
import {
  createAuthController,
  type AuthControllerDeps,
} from "./controllers/auth.controller";
import { createMeController } from "./controllers/me.controller";
import { createDashboardController } from "./controllers/dashboard.controller";
import { createReportsController } from "./controllers/reports.controller";
import { JwtTokenIssuer } from "./auth/jwtTokenIssuer";
import type { UsersRepository } from "./repositories/users.repository";
import type { MembershipsRepository } from "./repositories/memberships.repository";
import type { BusinessesRepository } from "./repositories/businesses.repository";
import type { DashboardRepository } from "./repositories/dashboard.repository";
import type { HomeOverviewRepository } from "./repositories/homeOverview.repository";
import type { StaffHomeRepository } from "./repositories/staffHome.repository";
import {
  createAuthzMiddleware,
  type AuthzMiddleware,
} from "./middleware/authz";
import {
  createStaffHomeMeRoutes,
  createStockRoutes,
  createTradePurchasesRoutes,
} from "./routes/staffHome.routes";
import { createStaffHomeController } from "./controllers/staffHome.controller";

export type AppDeps = {
  /** Injected for tests / when pool is ready. */
  auth?: Partial<AuthControllerDeps>;
  /** Repos for authz middleware factories (Phase 3.6) + /v1/me. */
  users?: UsersRepository;
  memberships?: MembershipsRepository;
  businesses?: BusinessesRepository;
  /** Dashboard Subagent 1 */
  dashboard?: DashboardRepository;
  homeOverview?: HomeOverviewRepository;
  staffHome?: StaffHomeRepository;
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

function unavailableBusinessesRepository(): BusinessesRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    findById: fail,
  } as unknown as BusinessesRepository;
}

function unavailableDashboardRepository(): DashboardRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    monthLineAgg: fail,
    monthPaidTotal: fail,
    monthLineProfit: fail,
    topItemSpend: fail,
  } as unknown as DashboardRepository;
}

function unavailableHomeOverviewRepository(): HomeOverviewRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    snapshotSums: fail,
    unitRollups: fail,
    categoryNest: fail,
    pendingDeliveryCount: fail,
    supplierCount: fail,
    brokerCount: fail,
    receivedDeliveryCount: fail,
    negativeStockCount: fail,
    inventorySummary: fail,
  } as unknown as HomeOverviewRepository;
}

function unavailableStaffHomeRepository(): StaffHomeRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    deliveryPipeline: fail,
    listStock: fail,
    openingMissing: fail,
    variancesToday: fail,
  } as unknown as StaffHomeRepository;
}

export type AppWithAuthz = express.Express & {
  /** Authz middleware bundle — for future /v1/businesses/:businessId routes. */
  authz: AuthzMiddleware;
};

export function createApp(deps: AppDeps = {}): AppWithAuthz {
  const app = express() as AppWithAuthz;
  app.use(express.json());
  app.use(requestId);
  app.use(requestLog);
  app.use("/api", apiRouter);

  const users = deps.users ?? deps.auth?.users ?? unavailableUsersRepository();
  const memberships = deps.memberships ?? unavailableMembershipsRepository();
  const businesses = deps.businesses ?? unavailableBusinessesRepository();

  const authDeps: AuthControllerDeps = {
    users,
    tokenIssuer: deps.auth?.tokenIssuer ?? new JwtTokenIssuer(),
  };
  app.use("/v1/auth", createAuthRoutes(createAuthController(authDeps)));

  app.authz = createAuthzMiddleware(users, memberships);

  app.use(
    "/v1/me",
    createMeRoutes(createMeController({ memberships, businesses }), app.authz),
  );

  const staffHome = deps.staffHome ?? unavailableStaffHomeRepository();
  const staffHomeController = createStaffHomeController({
    users,
    staffHome,
  });
  app.use("/v1/me", createStaffHomeMeRoutes(staffHomeController, app.authz));

  const dashboard = deps.dashboard ?? unavailableDashboardRepository();
  const homeOverview =
    deps.homeOverview ?? unavailableHomeOverviewRepository();

  app.use(
    "/v1/businesses/:businessId",
    createDashboardRoutes(createDashboardController({ dashboard }), app.authz),
  );
  app.use(
    "/v1/businesses/:businessId/reports",
    createReportsRoutes(
      createReportsController({ homeOverview }),
      app.authz,
    ),
  );
  app.use(
    "/v1/businesses/:businessId/trade-purchases",
    createTradePurchasesRoutes(staffHomeController, app.authz),
  );
  app.use(
    "/v1/businesses/:businessId/stock",
    createStockRoutes(staffHomeController, app.authz),
  );

  app.use(errorHandler);
  return app;
}
