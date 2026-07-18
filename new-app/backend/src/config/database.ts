/**
 * SQL Server connection pool (mssql / Tedious).
 * Phase 3.2 — repositories use getPool() after connect().
 */
import sql, { type ConnectionPool, type config as SqlConfig } from "mssql";
import { env } from "./env";

export type DatabaseConfig = typeof env.sql;

let pool: ConnectionPool | null = null;

export function getDatabaseConfig(): DatabaseConfig {
  return env.sql;
}

/** True when host + database are set (credentials may still be empty). */
export function isDatabaseConfigured(): boolean {
  return Boolean(env.sql.host && env.sql.database);
}

/** True when connect() can run with non-empty credentials. */
export function hasDatabaseCredentials(): boolean {
  return Boolean(
    env.sql.host &&
      env.sql.database &&
      env.sql.user &&
      env.sql.password !== undefined &&
      env.sql.password !== "",
  );
}

function buildConfig(): SqlConfig {
  return {
    server: env.sql.host,
    port: env.sql.port,
    database: env.sql.database,
    user: env.sql.user,
    password: env.sql.password,
    options: {
      encrypt: env.sql.encrypt,
      trustServerCertificate: env.sql.trustServerCertificate,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30_000,
    },
  };
}

export async function connect(): Promise<ConnectionPool> {
  if (pool?.connected) {
    return pool;
  }
  if (!hasDatabaseCredentials()) {
    throw new Error(
      "SQL Server credentials missing. Set SQLSERVER_USER and SQLSERVER_PASSWORD (and host/database).",
    );
  }
  pool = await new sql.ConnectionPool(buildConfig()).connect();
  return pool;
}

export async function close(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

export function getPool(): ConnectionPool {
  if (!pool?.connected) {
    throw new Error("Database pool not connected. Call connect() first.");
  }
  return pool;
}

/** Optional liveness check — only when pool is already connected. */
export async function ping(): Promise<boolean> {
  const result = await getPool().request().query<{ ok: number }>("SELECT 1 AS ok");
  return result.recordset[0]?.ok === 1;
}

export { sql };
