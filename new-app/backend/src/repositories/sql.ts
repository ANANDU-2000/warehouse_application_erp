/**
 * Parameterized query helpers for mssql Request.
 * Always use @params — never string-concatenate user input.
 */
import type { ConnectionPool, IResult, ISqlType } from "mssql";

/** Accepted by mssql `request.input` (e.g. sql.UniqueIdentifier or sql.NVarChar(320)). */
export type SqlTypeArg = ISqlType | (() => ISqlType);

export type SqlParam = {
  name: string;
  // mssql factories (UniqueIdentifier) and length types (NVarChar(n)) both accepted at runtime
  type: SqlTypeArg | object;
  value: unknown;
};

export async function queryMany<T extends object>(
  pool: ConnectionPool,
  text: string,
  params: SqlParam[] = [],
): Promise<T[]> {
  const request = pool.request();
  for (const p of params) {
    request.input(p.name, p.type as SqlTypeArg, p.value);
  }
  const result: IResult<T> = await request.query(text);
  return result.recordset;
}

export async function queryOne<T extends object>(
  pool: ConnectionPool,
  text: string,
  params: SqlParam[] = [],
): Promise<T | null> {
  const rows = await queryMany<T>(pool, text, params);
  return rows[0] ?? null;
}
