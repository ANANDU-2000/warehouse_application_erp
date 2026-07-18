/**
 * Parameterized query helpers for mssql Request.
 * Always use @params — never string-concatenate user input.
 *
 * `SqlClient` is a ConnectionPool or Transaction (both expose `.request()`),
 * so the same helpers work inside `withTransaction`.
 */
import type { ConnectionPool, IResult, ISqlType, Request, Transaction } from "mssql";

/** Pool or open transaction — anything that can create a Request. */
export type SqlClient = ConnectionPool | Transaction | { request(): Request };

/** Accepted by mssql `request.input` (e.g. sql.UniqueIdentifier or sql.NVarChar(320)). */
export type SqlTypeArg = ISqlType | (() => ISqlType);

export type SqlParam = {
  name: string;
  // mssql factories (UniqueIdentifier) and length types (NVarChar(n)) both accepted at runtime
  type: SqlTypeArg | object;
  value: unknown;
};

export async function queryMany<T extends object>(
  client: SqlClient,
  text: string,
  params: SqlParam[] = [],
): Promise<T[]> {
  const request = client.request();
  for (const p of params) {
    request.input(p.name, p.type as SqlTypeArg, p.value);
  }
  const result: IResult<T> = await request.query(text);
  return result.recordset;
}

export async function queryOne<T extends object>(
  client: SqlClient,
  text: string,
  params: SqlParam[] = [],
): Promise<T | null> {
  const rows = await queryMany<T>(client, text, params);
  return rows[0] ?? null;
}
