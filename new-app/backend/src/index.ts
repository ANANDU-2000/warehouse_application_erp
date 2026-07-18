/**
 * Process entry — connect SQL pool when credentials present, then listen.
 */
import { createApp } from "./app";
import { env } from "./config/env";
import {
  connect,
  getPool,
  hasDatabaseCredentials,
  close,
  getSqlDriver,
} from "./config/database";
import {
  createUsersRepository,
  createMembershipsRepository,
  createBusinessesRepository,
} from "./repositories";
import { logger } from "./logging/logger";

async function main(): Promise<void> {
  let appDeps: Parameters<typeof createApp>[0] = {};

  if (hasDatabaseCredentials()) {
    try {
      const pool = await connect();
      appDeps = {
        users: createUsersRepository(pool),
        memberships: createMembershipsRepository(pool),
        businesses: createBusinessesRepository(pool),
      };
      logger.info("database.connected", {
        host: env.sql.host,
        database: env.sql.database,
        driver: getSqlDriver(),
      });
      // Touch getPool so mis-wiring fails fast
      getPool();
    } catch (err) {
      logger.error("database.connect_failed", {
        err: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      process.exitCode = 1;
      return;
    }
  } else {
    logger.warn("database.skipped", {
      msg: "SQLSERVER_USER/PASSWORD empty — using fail-closed stub repos",
    });
  }

  const app = createApp(appDeps);
  const server = app.listen(env.port, () => {
    logger.info("server.listen", {
      port: env.port,
      nodeEnv: env.nodeEnv,
      databaseReady: hasDatabaseCredentials(),
    });
  });

  const shutdown = async (): Promise<void> => {
    server.close();
    await close().catch(() => undefined);
  };
  process.on("SIGINT", () => {
    void shutdown().then(() => process.exit(0));
  });
  process.on("SIGTERM", () => {
    void shutdown().then(() => process.exit(0));
  });
}

void main();
