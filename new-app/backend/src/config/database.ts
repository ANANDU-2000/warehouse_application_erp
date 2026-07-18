/**
 * SQL Server connection stub — Phase 3.1.
 * Real mssql pool / repositories land in Phase 3.2.
 */
import { env } from "./env";

export type DatabaseConfig = typeof env.sql;

export function getDatabaseConfig(): DatabaseConfig {
  return env.sql;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(env.sql.host && env.sql.database);
}
