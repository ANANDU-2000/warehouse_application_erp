/**
 * Unit-of-work helper — mirrors FastAPI service-owned commit/rollback
 * (e.g. commit_trade_purchase_delivery: one commit; on failure rollback).
 * Lower layers must not commit; callers own the boundary.
 *
 * Savepoints / SQL Server lock helpers: deferred (see docs/42_Transactions.md).
 */
import sql, { type ConnectionPool } from "mssql";
import type { Request } from "mssql";

/** Minimal surface used by withTransaction + SqlClient repos. */
export type TransactionHandle = {
  begin(): Promise<unknown>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  request(): Request;
};

export type WithTransactionOptions = {
  /** Test seam — defaults to `new sql.Transaction(pool)`. */
  createTransaction?: (pool: ConnectionPool) => TransactionHandle;
};

export async function withTransaction<T>(
  pool: ConnectionPool,
  fn: (tx: TransactionHandle) => Promise<T>,
  options?: WithTransactionOptions,
): Promise<T> {
  const create =
    options?.createTransaction ??
    ((p: ConnectionPool): TransactionHandle => new sql.Transaction(p));
  const tx = create(pool);
  await tx.begin();
  try {
    const result = await fn(tx);
    await tx.commit();
    return result;
  } catch (err) {
    try {
      await tx.rollback();
    } catch {
      // Transaction may already be aborted by the driver
    }
    throw err;
  }
}
