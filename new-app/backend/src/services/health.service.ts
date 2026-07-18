import { isDatabaseConfigured } from "../config/database";
import { env } from "../config/env";

export type HealthStatus = {
  status: "ok";
  service: string;
  timestamp: string;
  databaseConfigured: boolean;
  nodeEnv: string;
};

export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    service: "warehouse-erp-backend",
    timestamp: new Date().toISOString(),
    databaseConfigured: isDatabaseConfigured(),
    nodeEnv: env.nodeEnv,
  };
}
