import express from "express";
import { getPool } from "./config/database";
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
import type { StockRepository } from "./repositories/stock.repository";
import { createStockRepository } from "./repositories/stock.repository";
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
import type { ItemCategoriesRepository } from "./repositories/itemCategories.repository";
import { createItemCategoriesRepository } from "./repositories/itemCategories.repository";
import { createItemCategoriesService } from "./services/itemCategories.service";
import {
  createItemCategoriesController,
  createItemCategoriesRoutes,
  createCategoryTypesIndexRoutes,
} from "./controllers/itemCategories.controller";
import type { ContactsRepository } from "./repositories/contacts.repository";
import { createContactsRepository } from "./repositories/contacts.repository";
import { createContactsService } from "./services/contacts.service";
import { createContactsController } from "./controllers/contacts.controller";
import { createContactsRoutes } from "./routes/contacts.routes";
import type { PurchaseRepository } from "./repositories/purchases.repository";
import { createPurchaseRepository } from "./repositories/purchases.repository";
import { createPurchaseService } from "./services/purchases.service";
import { createPurchaseController } from "./controllers/purchases.controller";
import { createPurchaseRoutes } from "./routes/purchases.routes";
import { createStockService } from "./services/stock.service";
import { createStockController } from "./controllers/stock.controller";
import { createStockDetailRoutes } from "./routes/stock.routes";
import { createExportsRepository } from "./repositories/exports.repository";
import type { ExportsRepository } from "./repositories/exports.repository";
import { createExportsService } from "./services/exports.service";
import { createSettingsController } from "./controllers/settings.controller";
import {
  createBrandingRoutes,
  createExportsRoutes,
} from "./routes/settings.routes";
import type { ReportsRepository } from "./repositories/reports.repository";
import { createReportsRepository } from "./repositories/reports.repository";
import type { OperationsRepository } from "./repositories/operations.repository";
import { createOperationsRepository } from "./repositories/operations.repository";
import { OperationsController } from "./controllers/operations.controller";
import { createOperationsRoutes } from "./routes/operations.routes";
import { createHealthRoutes } from "./routes/health.routes";
import { PublicController } from "./controllers/public.controller";
import { createPublicRoutes } from "./routes/public.routes";
import { createDamageReportsRepository } from "./repositories/damageReports.repository";
import { createDamageReportsController } from "./controllers/damageReports.controller";
import { createDamageReportsRoutes } from "./routes/damageReports.routes";
import { createRealtimeRoutes } from "./routes/realtime.routes";
import { createStockAuditRepository } from "./repositories/stockAudit.repository";
import { createStockAuditController } from "./controllers/stockAudit.controller";
import { createStockAuditRoutes } from "./routes/stockAudit.routes";

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
  /** Categories Slice 1 — item-categories */
  itemCategories?: ItemCategoriesRepository;
  itemCategoriesRunInTransaction?: <T>(
    fn: (tx: import("./repositories/sql").SqlClient) => Promise<T>,
  ) => Promise<T>;
  itemCategoriesRepoForClient?: (
    client: import("./repositories/sql").SqlClient,
  ) => ItemCategoriesRepository;
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
  /** Contacts — suppliers & brokers */
  contacts?: ContactsRepository;
  /** Purchase Orders — trade purchases */
  purchases?: PurchaseRepository;
  /** Stock module — stock detail / movements / adjustments */
  stock?: StockRepository;
  /** Settings — exports/backup */
  exports?: ExportsRepository;
  /** Reports — trade reporting queries */
  reportsRepo?: ReportsRepository;
  /** Operations — checklists, usage logs, snapshots */
  operations?: OperationsRepository;
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
    bulkSoftDelete: fail,
    bulkSetReorderLevel: fail,
    getItemInsights: fail,
    getItemLines: fail,
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

function unavailableItemCategoriesRepository(): ItemCategoriesRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    list: fail,
    getById: fail,
    findDupCategoryId: fail,
    insertCategory: fail,
    updateCategoryName: fail,
    countCatalogItemsByCategory: fail,
    deleteCategory: fail,
    insertType: fail,
    listTypes: fail,
    getTypeById: fail,
    findDupTypeId: fail,
    updateTypeName: fail,
    countCatalogItemsByType: fail,
    deleteType: fail,
    listTypesIndex: fail,
    getCategoryInsights: fail,
  };
}

function unavailableContactsRepository(): ContactsRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    listSuppliers: fail, listSuppliersCompact: fail, getSupplier: fail,
    findDupSupplierId: fail, insertSupplier: fail, updateSupplier: fail,
    deleteSupplier: fail, countActiveTradePurchasesForSupplier: fail,
    listBrokers: fail, getBroker: fail, findDupBrokerId: fail,
    insertBroker: fail, updateBroker: fail, deleteBroker: fail,
    countActiveTradePurchasesForBroker: fail,
    countSuppliersAssignedToBroker: fail,
    listBrokerSupplierLinksBySupplier: fail,
    listBrokerSupplierLinksByBroker: fail,
    deleteBrokerLinksBySupplier: fail, deleteBrokerLinksByBroker: fail,
    insertBrokerSupplierLink: fail,
    verifyBrokerInBusiness: fail, verifySupplierInBusiness: fail,
    updateSupplierBrokerId: fail,
    getLastPurchaseDateForSupplier: fail,
    getLastPurchaseDateForBroker: fail,
    getSupplierMetrics: fail,
    getBrokerMetricsDeals: fail, getBrokerMetricsCommission: fail,
    getBrokerMetricsProfit: fail, getLinkedSuppliers: fail,
  };
}

function unavailablePurchaseRepository(): PurchaseRepository {
  const fail = async (): Promise<never> => {
    throw new Error("Database pool not connected. Call connect() first.");
  };
  return {
    getDraft: fail, upsertDraft: fail, deleteDraft: fail,
    maxHumanIdSequence: fail, lastTradeLineForItem: fail,
    listPurchases: fail, listPurchaseLines: fail,
    getPurchase: fail, getPurchaseLines: fail, getPurchaseWithLines: fail,
    insertPurchase: fail, insertPurchaseLines: fail,
    updatePurchase: fail, deletePurchaseLines: fail,
    softDeletePurchase: fail, cancelPurchase: fail,
    updatePurchasePayment: fail,
    insertLifecycleEvent: fail, listLifecycleEventsByPurchase: fail,
    findDuplicatePurchases: fail, getPurchaseLinesForCheck: fail,
    getDeliveryPipeline: fail, getDeliveryPendingAmount: fail,
    updatePurchaseFields: fail, updateLineVerification: fail,
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

  // TEMP DEBUG
  app.get("/debug/schema/:table", async (req, res) => {
    try {
      const table = req.params.table;
      const pool = getPool();
      const result = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' ORDER BY ORDINAL_POSITION`);
      res.json(result.recordset);
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    }
  });

  // TEMP: test error handler
  app.get("/debug/test-error", (_req, _res, next) => {
    next(new Error("Test error from debug endpoint"));
  });

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

  const exportsRepo =
    deps.exports ??
    (deps.pool
      ? createExportsRepository(deps.pool)
      : createExportsRepository(null as unknown as import("mssql").ConnectionPool));
  const exportsSvc = createExportsService({
    exportsRepo,
    businessesRepo: businesses,
  });
  const settingsCtrl = createSettingsController({
    businesses,
    exports: exportsSvc,
  });
  app.use(
    "/v1/me/businesses/:businessId",
    createBrandingRoutes(settingsCtrl, app.authz),
  );
  app.use(
    "/v1/businesses/:businessId/exports",
    createExportsRoutes(settingsCtrl, app.authz),
  );

  const dashboard = deps.dashboard ?? unavailableDashboardRepository();
  const homeOverview =
    deps.homeOverview ?? unavailableHomeOverviewRepository();

  app.use(
    "/v1/businesses/:businessId",
    createDashboardRoutes(createDashboardController({ dashboard }), app.authz),
  );
  const reportsRepo = deps.reportsRepo ?? (deps.pool ? createReportsRepository(deps.pool) : createReportsRepository(null as unknown as import("mssql").ConnectionPool));
  app.use(
    "/v1/businesses/:businessId/reports",
    createReportsRoutes(
      createReportsController({ homeOverview, reportsRepo }),
      app.authz,
    ),
  );
  const purchaseRepo = deps.purchases ?? (deps.pool ? createPurchaseRepository(deps.pool) : unavailablePurchaseRepository());
  const purchaseSvc = createPurchaseService(purchaseRepo);
  const purchaseCtrl = createPurchaseController(purchaseSvc, businesses);
  app.use(
    "/v1/businesses/:businessId/trade-purchases",
    createPurchaseRoutes(purchaseCtrl, app.authz),
  );
  const stockRepo =
    deps.stock ??
    (deps.pool
      ? createStockRepository(deps.pool)
      : createStockRepository(null as unknown as import("mssql").ConnectionPool));
  const stockSvc = createStockService({
    stockRepo,
  });
  const stockCtrl = createStockController({
    stockService: stockSvc,
    homeOverview,
  });
  app.use(
    "/v1/businesses/:businessId/stock",
    createStockRoutes(staffHomeController, homeActivityController, app.authz),
  );
  app.use(
    "/v1/businesses/:businessId/stock",
    createStockDetailRoutes(stockCtrl, app.authz),
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

  const itemCategoriesRepo =
    deps.itemCategories ??
    (deps.pool
      ? createItemCategoriesRepository(deps.pool)
      : unavailableItemCategoriesRepository());
  const itemCategoriesSvc = createItemCategoriesService({
    categories: itemCategoriesRepo,
    pool: deps.pool,
    runInTransaction: deps.itemCategoriesRunInTransaction,
    repoForClient: deps.itemCategoriesRepoForClient,
  });
  const itemCategoriesCtrl = createItemCategoriesController({
    categories: itemCategoriesSvc,
  });
  app.use(
    "/v1/businesses/:businessId/item-categories",
    createItemCategoriesRoutes(itemCategoriesCtrl, app.authz),
  );
  app.use(
    "/v1/businesses/:businessId/category-types-index",
    createCategoryTypesIndexRoutes(itemCategoriesCtrl, app.authz),
  );

  const contactsRepo = deps.contacts ?? (deps.pool ? createContactsRepository(deps.pool) : unavailableContactsRepository());
  const contactsSvc = createContactsService(contactsRepo);
  const contactsCtrl = createContactsController(contactsSvc);
  app.use(
    "/v1/businesses/:businessId",
    createContactsRoutes(contactsCtrl, app.authz),
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

  const opsRepo = deps.operations ?? (deps.pool ? createOperationsRepository(deps.pool) : createOperationsRepository(null as unknown as import("mssql").ConnectionPool));
  const opsCtrl = new OperationsController(opsRepo);
  app.use(
    "/v1/businesses/:businessId/operations",
    createOperationsRoutes(opsCtrl, app.authz),
  );

  app.use("/health", createHealthRoutes());

  const publicCtrl = new PublicController();
  app.use("/public", createPublicRoutes(publicCtrl));

  const damageReportsRepo = deps.pool ? createDamageReportsRepository(deps.pool) : createDamageReportsRepository(null as unknown as import("mssql").ConnectionPool);
  const damageReportsCtrl = createDamageReportsController(damageReportsRepo);
  app.use(
    "/v1/businesses/:businessId/damage-reports",
    createDamageReportsRoutes(damageReportsCtrl, app.authz),
  );

  app.use(
    "/v1/businesses/:businessId/realtime",
    createRealtimeRoutes(app.authz),
  );

  const stockAuditRepo = deps.pool ? createStockAuditRepository(deps.pool) : createStockAuditRepository(null as unknown as import("mssql").ConnectionPool);
  const stockAuditCtrl = createStockAuditController(stockAuditRepo, stockSvc);
  app.use(
    "/v1/businesses/:businessId/stock-audits",
    createStockAuditRoutes(stockAuditCtrl, app.authz),
  );

  app.get("/", (_req, res) => {
    res.json({
      service: "HEXA Purchase Assistant API",
      version: "2.0",
      docs: "/docs",
    });
  });

  app.use(errorHandler);
  return app;
}
