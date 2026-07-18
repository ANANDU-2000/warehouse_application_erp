import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("mssql", () => {
  const ConnectionPool = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue({
      connected: true,
      request: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined),
    }),
    connected: false,
    close: vi.fn(),
  }));
  return {
    default: {
      ConnectionPool,
      UniqueIdentifier: "UniqueIdentifier",
      NVarChar: (n: number) => `NVarChar(${n})`,
    },
    ConnectionPool,
  };
});

describe("database config helpers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("isDatabaseConfigured is true when host and database set", async () => {
    process.env.SQLSERVER_HOST = "localhost";
    process.env.SQLSERVER_DATABASE = "WarehouseErp";
    process.env.SQLSERVER_USER = "";
    process.env.SQLSERVER_PASSWORD = "";
    const { isDatabaseConfigured, hasDatabaseCredentials } = await import(
      "../../src/config/database"
    );
    expect(isDatabaseConfigured()).toBe(true);
    expect(hasDatabaseCredentials()).toBe(false);
  });

  it("getPool throws when not connected", async () => {
    const { getPool } = await import("../../src/config/database");
    expect(() => getPool()).toThrow(/not connected/i);
  });
});
