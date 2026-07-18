/**
 * Shared mock for mssql ConnectionPool.request().input().query() chain.
 */
import { vi } from "vitest";
import type { ConnectionPool } from "mssql";

export function createMockPool(recordset: unknown[] = []): {
  pool: ConnectionPool;
  request: ReturnType<typeof vi.fn>;
  input: ReturnType<typeof vi.fn>;
  query: ReturnType<typeof vi.fn>;
} {
  const query = vi.fn().mockResolvedValue({ recordset });
  const input = vi.fn().mockReturnThis();
  const request = vi.fn().mockReturnValue({ input, query });
  const pool = { request } as unknown as ConnectionPool;
  return { pool, request, input, query };
}
