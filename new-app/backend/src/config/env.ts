import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  sql: {
    host: process.env.SQLSERVER_HOST ?? "localhost",
    port: Number(process.env.SQLSERVER_PORT ?? 1433),
    database: process.env.SQLSERVER_DATABASE ?? "WarehouseErp",
    user: process.env.SQLSERVER_USER ?? "",
    password: process.env.SQLSERVER_PASSWORD ?? "",
    encrypt: (process.env.SQLSERVER_ENCRYPT ?? "true").toLowerCase() === "true",
    trustServerCertificate:
      (process.env.SQLSERVER_TRUST_SERVER_CERTIFICATE ?? "true").toLowerCase() ===
      "true",
  },
  /** Mirrors source-app/backend/app/config.py jwt_* settings. */
  jwt: {
    secret: process.env.JWT_SECRET ?? "change-me-min-32-chars-dev-only",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ?? "change-me-min-32-chars-refresh-dev",
    accessTtlMinutes: Number(process.env.JWT_ACCESS_TTL_MINUTES ?? 15),
    refreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30),
  },
};

/**
 * Production guard — same intent as FastAPI Settings production checks.
 * Call at process start in production (documented; wired when deploy hardens).
 */
export function assertJwtSecretsForProduction(): void {
  if (env.nodeEnv !== "production") {
    return;
  }
  const { secret, refreshSecret } = env.jwt;
  if (
    secret.toLowerCase().includes("change-me") ||
    refreshSecret.toLowerCase().includes("change-me")
  ) {
    throw new Error("JWT secrets must be changed in production");
  }
  if (secret.length < 32 || refreshSecret.length < 32) {
    throw new Error("JWT secrets must be at least 32 characters in production");
  }
}
