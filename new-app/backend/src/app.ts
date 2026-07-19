import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { requestId } from "./middleware/requestId";
import { requestLog } from "./middleware/requestLog";
import { apiRouter } from "./routes";
import { createAuthRoutes } from "./routes/auth.routes";
import { createMeRoutes } from "./routes/me.routes";
import { createDashboardRoutes } from "./routes/dashboard.routes";
import { createReportsRoutes } from "./routes/reports.routes";
import { createUsersRoutes } from "./routes/users.routes";
import {
  createAuthController,
  type AuthControllerDeps,
} from "./controllers/auth.controller";
import { createMeController } from "./controllers/me.controller";
import { createDashboardController } from "./controllers/dashboard.controller";
import { createReportsController } from "./controllers/reports.controller";
import { createUsersController } from "./controllers/users.controller";
import { JwtTokenIssuer } from "./auth/jwtTokenIssuer";
import type { UsersRepository } from "./repositories/users.repository";
import type { MembershipsRepository } from "./repositories/memberships.repository";
import type { BusinessesRepository } from "./repositories/businesses.repository";
import type { BusinessUsersRepository } from "./repositories/businessUsers.repository";
import type { DashboardRepository } from "./repositories/dashboard.repository";
import type { HomeOverviewRepository } from "./repositories/homeOverview.repository";
import type { StaffHomeRepository } from "./repositories/staffHome.repository";
import type { HomeActivityRepository } from "./repositories/homeActivity.repository";
import type { SearchRepository } from "./repositories/search.repository";
import type { CatalogItemsRepository } from "./repositories/catalogItems.repository";
import type { ConnectionPool } from "mssql";
import type { CreateUserDeps } from "./services/usersCreate.service";
import type { PatchUserDeps } from "./services/usersPatch.service";
import type { DeleteUserDeps } from "./services/usersDelete.service";
import type { ResetPasswordDeps } from "./services/usersResetPassword.service";
import type { BulkUserDeps } from "./services/usersBulk.service";
import {
  createAuthzMiddleware,
  type AuthzMiddleware,
} from "./middleware/authz";
import {
  createActivityLogRoutes,
  createNotificationsRoutes,
  createStaffHomeMeRoutes,
  createStockRoutes,
  createTradePurchasesRoutes,
} from "./routes/staffHome.routes";
import { createSearchRoutes } from "./routes/search.routes";
import { createCatalogItemsRoutes } from "./routes/catalogItems.routes";
import { createStaffHomeController } from "./controllers/staffHome.controller";
import { createHomeActivityController } from "./controllers/homeActivity.controller";
import { createSearchController } from "./controllers/search.controller";
import { createCatalogItemsController } from "./controllers/catalogItems.controller";
import {
  createCatalogController,
  createCatalogRoutes,
} from "./controllers/catalog.controller";
import { createCatalogItemsWriteService } from "./services/catalogItemsWrite.service";
import type { CatalogVariantsRepository } from "./repositories/catalogVariants.repository";
import { createCatalogVariantsRepository } from "./repositories/catalogVariants.repository";
import { createCatalogVariantsService } from "./services/catalogVariants.service";
import { createCatalogVariantsController } from "./controllers/catalogVariants.controller";
import {
  createCatalogItemVariantsRoutes,
  createCatalogVariantsRoutes,
} from "./routes/catalogVariants.routes";

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
  homeActivity?: HomeActivityRepository;
  /** Unified search — search.py */
  search?: SearchRepository;
  /** Products Slice 1–2 — catalog.py catalog-items */
  catalogItems?: CatalogItemsRepository;
  /** Test seam for catalog POST/PATCH/DELETE transactions. */
  catalogWriteRunInTransaction?: <T>(
    fn: (tx: import("./repositories/sql").SqlClient) => Promise<T>,
  ) => Promise<T>;
  /** Test seam — bind write ops to injected catalogItems mock. */
  catalogWriteRepoForClient?: (
    client: import("./repositories/sql").SqlClient,
  ) => CatalogItemsRepository;
  /** Products Slice 6 — catalog variants */
  catalogVariants?: CatalogVariantsRepository;
  catalogVariantsRunInTransaction?: <T>(
    fn: (tx: import("./repositories/sql").SqlClient) => Promise<T>,
  ) => Promise<T>;
  catalogVariantsRepoForClient?: (
    client: import("./repositories/sql").SqlClient,
  ) => CatalogVariantsRepository;
  /** Users & Roles — business user list */
  businessUsers?: BusinessUsersRepository;
  /** SQL pool for transactional user create. */
  pool?: ConnectionPool;
  /** Test seam for POST …/users. */
  runInTransaction?: CreateUserDeps["runInTransaction"];
  /** Test seam for PATCH …/users/:userId. */
  runPatchInTransaction?: PatchUserDeps["runInTransaction"];
  /** Test seam for DELETE …/users/:userId. */
  runDeleteInTransaction?: DeleteUserDeps["runInTransaction"];
  /** Test seam for POST …/users/:userId/reset-password. */
  runResetInTransaction?: ResetPasswordDeps["runInTransaction"];
  /** Test seam for POST …/users/bulk. */
  runBulkInTransaction?: BulkUserDeps["runInTransaction"];
  /** Test seam for ledger grouped UTC now. */
  ledgerNow?: Date;
  /** Test seam for active-sessions UTC now. */
  activeSessionsNow?: Date;
};

/** Fail-closed users repo when SQL pool is not wired. */
function unavailableUsersRepository(): UsersRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    findById: fail,
    findByEmail: fail,
    usernameExists: fail,
    emailExistsActive: fail,
    emailExistsActiveExcluding: fail,
    insert: fail,
    patchById: fail,
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
    insert: fail,
    updateRoleAndPermissions: fail,
    updatePermissionsJson: fail,
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
    stockTotalsOnHand: fail,
    stockTotalsPurchased: fail,
    listActivityLog: fail,
    listNotifications: fail,
    notificationsUnreadCount: fail,
    markAllNotificationsRead: fail,
    clearAllNotifications: fail,
    patchNotificationRead: fail,
    stockAlertsSummary: fail,
    listLowStockOperations: fail,
    notifyOwnerStockItem: fail,
  } as unknown as StaffHomeRepository;
}

function unavailableHomeActivityRepository(): HomeActivityRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    listTradePurchases: fail,
    auditRecent: fail,
    listStaffPurchases: fail,
  };
}

function unavailableSearchRepository(): SearchRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return { unifiedSearch: fail };
}

function unavailableCatalogItemsRepository(): CatalogItemsRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    list: fail,
    getById: fail,
    getActiveById: fail,
    categoryExists: fail,
    verifyTypeInCategory: fail,
    getOrCreateGeneralTypeId: fail,
    findDupItemId: fail,
    nextItemCode: fail,
    assertSupplierIdsInBusiness: fail,
    assertBrokerIdsInBusiness: fail,
    getCategoryName: fail,
    insertItem: fail,
    updateSmartFields: fail,
    replaceDefaultSuppliers: fail,
    replaceDefaultBrokers: fail,
    seedSupplierItemDefaults: fail,
    patchItem: fail,
    countTradeLines: fail,
    listVariantIds: fail,
    countArchivedEntryLinesForVariants: fail,
    deleteItem: fail,
    findTypeInBusiness: fail,
    assertUniqueBarcode: fail,
    assertUniqueItemCode: fail,
    listFuzzyNamePairs: fail,
    updateItemCode: fail,
    updateBarcode: fail,
  };
}

function unavailableCatalogVariantsRepository(): CatalogVariantsRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    listByItem: fail,
    getById: fail,
    catalogItemExists: fail,
    findDupVariantId: fail,
    insert: fail,
    patch: fail,
    countArchivedEntryLines: fail,
    delete: fail,
  };
}

function unavailableBusinessUsersRepository(): BusinessUsersRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    listForBusiness: fail,
    findMemberByUserId: fail,
    findMemberForPatch: fail,
    activityCount7d: fail,
    todayStats: fail,
    purchases7d: fail,
    stockUpdates7d: fail,
    profileStats: fail,
    insertActivityLog: fail,
    listCreatedItemsByUser: fail,
    listStockAdjustmentsByUser: fail,
    listPurchasesByUser: fail,
    listActivityLogByUser: fail,
    listActiveSessions: fail,
  } as unknown as BusinessUsersRepository;
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
  const homeActivity = deps.homeActivity ?? unavailableHomeActivityRepository();
  const staffHomeController = createStaffHomeController({
    users,
    staffHome,
  });
  const homeActivityController = createHomeActivityController({ homeActivity });
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
    createTradePurchasesRoutes(
      staffHomeController,
      homeActivityController,
      app.authz,
    ),
  );
  app.use(
    "/v1/businesses/:businessId/stock",
    createStockRoutes(staffHomeController, homeActivityController, app.authz),
  );
  app.use(
    "/v1/businesses/:businessId/activity-log",
    createActivityLogRoutes(staffHomeController, app.authz),
  );
  app.use(
    "/v1/businesses/:businessId/notifications",
    createNotificationsRoutes(staffHomeController, app.authz),
  );
  const search = deps.search ?? unavailableSearchRepository();
  app.use(
    "/v1/businesses/:businessId/search",
    createSearchRoutes(createSearchController({ search }), app.authz),
  );

  const catalogItems =
    deps.catalogItems ?? unavailableCatalogItemsRepository();
  const catalogWrite = createCatalogItemsWriteService({
    catalogItems,
    pool: deps.pool,
    runInTransaction: deps.catalogWriteRunInTransaction,
    repoForClient: deps.catalogWriteRepoForClient,
  });
  app.use(
    "/v1/businesses/:businessId/catalog-items",
    createCatalogItemsRoutes(
      createCatalogItemsController({
        catalogItems,
        write: catalogWrite,
      }),
      app.authz,
    ),
  );
  app.use(
    "/v1/businesses/:businessId/catalog",
    createCatalogRoutes(
      createCatalogController({ catalogItems }),
      app.authz,
    ),
  );

  const catalogVariantsRepo =
    deps.catalogVariants ??
    (deps.pool
      ? createCatalogVariantsRepository(deps.pool)
      : unavailableCatalogVariantsRepository());
  const catalogVariantsSvc = createCatalogVariantsService({
    variants: catalogVariantsRepo,
    pool: deps.pool,
    runInTransaction: deps.catalogVariantsRunInTransaction,
    repoForClient: deps.catalogVariantsRepoForClient,
  });
  const catalogVariantsCtrl = createCatalogVariantsController({
    variants: catalogVariantsSvc,
  });
  app.use(
    "/v1/businesses/:businessId/catalog-items/:itemId/variants",
    createCatalogItemVariantsRoutes(catalogVariantsCtrl, app.authz),
  );
  app.use(
    "/v1/businesses/:businessId/catalog-variants",
    createCatalogVariantsRoutes(catalogVariantsCtrl, app.authz),
  );

  const businessUsers =
    deps.businessUsers ?? unavailableBusinessUsersRepository();
  app.use(
    "/v1/businesses/:businessId/users",
    createUsersRoutes(
      createUsersController({
        businessUsers,
        businesses,
        memberships,
        pool: deps.pool,
        runInTransaction: deps.runInTransaction,
        runPatchInTransaction: deps.runPatchInTransaction,
        runDeleteInTransaction: deps.runDeleteInTransaction,
        runResetInTransaction: deps.runResetInTransaction,
        runBulkInTransaction: deps.runBulkInTransaction,
        ledgerNow: deps.ledgerNow,
        activeSessionsNow: deps.activeSessionsNow,
      }),
      app.authz,
    ),
  );

  app.use(errorHandler);
  return app;
}
