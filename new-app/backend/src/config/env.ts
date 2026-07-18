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
};
