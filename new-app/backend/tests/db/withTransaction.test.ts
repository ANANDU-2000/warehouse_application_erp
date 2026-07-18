/**
 * withTransaction — commit on success, rollback on throw (mocked TransactionHandle).
 */
import { describe, expect, it, vi } from "vitest";
import type { ConnectionPool } from "mssql";
import {
  withTransaction,
  type TransactionHandle,
} from "../../src/db/withTransaction";
import { queryOne, type SqlClient } from "../../src/repositories/sql";

function createMockTx(overrides?: Partial<TransactionHandle>): {
  tx: TransactionHandle;
  begin: ReturnType<typeof vi.fn>;
  commit: ReturnType<typeof vi.fn>;
  rollback: ReturnType<typeof vi.fn>;
  request: ReturnType<typeof vi.fn>;
} {
  const begin = vi.fn().mockResolvedValue(undefined);
  const commit = vi.fn().mockResolvedValue(undefined);
  const rollback = vi.fn().mockResolvedValue(undefined);
  const request = vi.fn();
  const tx: TransactionHandle = {
    begin,
    commit,
    rollback,
    request,
    ...overrides,
  };
  return { tx, begin, commit, rollback, request };
}

describe("withTransaction", () => {
  const pool = {} as ConnectionPool;

  it("begins, runs fn, and commits on success", async () => {
    const { tx, begin, commit, rollback } = createMockTx();
    const result = await withTransaction(
      pool,
      async (handle) => {
        expect(handle).toBe(tx);
        return 42;
      },
      { createTransaction: () => tx },
    );

    expect(result).toBe(42);
    expect(begin).toHaveBeenCalledOnce();
    expect(commit).toHaveBeenCalledOnce();
    expect(rollback).not.toHaveBeenCalled();
  });

  it("rolls back and rethrows when fn throws", async () => {
    const { tx, begin, commit, rollback } = createMockTx();
    const boom = new Error("write failed");

    await expect(
      withTransaction(
        pool,
        async () => {
          throw boom;
        },
        { createTransaction: () => tx },
      ),
    ).rejects.toThrow("write failed");

    expect(begin).toHaveBeenCalledOnce();
    expect(commit).not.toHaveBeenCalled();
    expect(rollback).toHaveBeenCalledOnce();
  });

  it("rethrows even if rollback itself fails", async () => {
    const { tx, commit } = createMockTx({
      rollback: vi.fn().mockRejectedValue(new Error("already aborted")),
    });

    await expect(
      withTransaction(
        pool,
        async () => {
          throw new Error("domain fail");
        },
        { createTransaction: () => tx },
      ),
    ).rejects.toThrow("domain fail");

    expect(commit).not.toHaveBeenCalled();
  });

  it("passes SqlClient (tx) into query helpers via request()", async () => {
    const query = vi.fn().mockResolvedValue({
      recordset: [{ id: "a" }],
    });
    const input = vi.fn();
    const { tx } = createMockTx({
      request: vi.fn().mockReturnValue({ input, query }),
    });

    const row = await withTransaction(
      pool,
      async (handle) => {
        const client: SqlClient = handle;
        return queryOne<{ id: string }>(client, "SELECT 1 AS id", []);
      },
      { createTransaction: () => tx },
    );

    expect(row).toEqual({ id: "a" });
    expect(query).toHaveBeenCalledOnce();
  });
});
