import {
  isDatabaseConfigured,
  ping,
  getPool,
} from "../config/database";
import { env } from "../config/env";

export type HealthStatus = {
  status: "ok";
  service: string;
  timestamp: string;
  /** Host + database env present (not a live ping). */
  databaseConfigured: boolean;
  /** Live `SELECT 1` succeeded on connected pool; false if pool not up. */
  databaseConnected: boolean;
  nodeEnv: string;
};

function isPoolConnected(): boolean {
  try {
    getPool();
    return true;
  } catch {
    return false;
  }
}

export async function getHealthStatus(): Promise<HealthStatus> {
  let databaseConnected = false;
  if (isPoolConnected()) {
    try {
      databaseConnected = await ping();
    } catch {
      databaseConnected = false;
    }
  }

  return {
    status: "ok",
    service: "warehouse-erp-backend",
    timestamp: new Date().toISOString(),
    databaseConfigured: isDatabaseConfigured(),
    databaseConnected,
    nodeEnv: env.nodeEnv,
  };
}
