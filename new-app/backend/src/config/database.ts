/**
 * SQL Server connection pool (mssql).
 * Phase 3.2 — repositories use getPool() after connect().
 *
 * Drivers:
 * - tedious (default non-Windows) — requires TCP/IP on port 1433
 * - msnodesqlv8 (default Windows) — ODBC connection string (works without TCP)
 * Override with SQLSERVER_DRIVER=tedious|msnodesqlv8
 * ODBC driver name: SQLSERVER_ODBC_DRIVER (default "ODBC Driver 18 for SQL Server")
 */
import sqlTedious, {
  type ConnectionPool,
  type config as SqlConfig,
} from "mssql";
import sqlNative from "mssql/msnodesqlv8";
import { env } from "./env";

export type DatabaseConfig = typeof env.sql;

let pool: ConnectionPool | null = null;

function resolveDriver(): "tedious" | "msnodesqlv8" {
  const raw = (process.env.SQLSERVER_DRIVER ?? "").toLowerCase();
  if (raw === "tedious" || raw === "msnodesqlv8") {
    return raw;
  }
  return process.platform === "win32" ? "msnodesqlv8" : "tedious";
}

const driver = resolveDriver();
/** Active mssql binding (tedious or msnodesqlv8). */
export const sql = driver === "msnodesqlv8" ? sqlNative : sqlTedious;

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

function odbcDriverName(): string {
  return process.env.SQLSERVER_ODBC_DRIVER ?? "ODBC Driver 18 for SQL Server";
}

/** Escape ODBC connection-string values that may contain `;` or `}`. */
function odbcEscape(value: string): string {
  return value.replace(/\}/g, "}}");
}

function buildNativeConnectionString(): string {
  const encrypt = env.sql.encrypt ? "yes" : "no";
  const trust = env.sql.trustServerCertificate ? "yes" : "no";
  return [
    `Driver={${odbcDriverName()}}`,
    `Server=${odbcEscape(env.sql.host)}`,
    `Database=${odbcEscape(env.sql.database)}`,
    `Uid=${odbcEscape(env.sql.user)}`,
    `Pwd=${odbcEscape(env.sql.password)}`,
    `Encrypt=${encrypt}`,
    `TrustServerCertificate=${trust}`,
  ].join(";");
}

function buildConfig(): SqlConfig | { connectionString: string } {
  if (driver === "msnodesqlv8") {
    return { connectionString: buildNativeConnectionString() };
  }
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
  pool = await new sql.ConnectionPool(buildConfig() as SqlConfig).connect();
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

export function getSqlDriver(): "tedious" | "msnodesqlv8" {
  return driver;
}
