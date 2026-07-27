/**
 * `businesses` repository — tenant root.
 * Load by explicit id only (no list-all). See docs/29 tenancy.
 * Columns: `new-app/database/ddl/01_core.sql` (businesses).
 */
import { sql } from "../config/database";
import { queryOne, type SqlClient } from "./sql";
import type { BusinessRow } from "./types";

const BUSINESS_COLUMNS = `
  id, name, branding_title, branding_logo_url, gst_number, address,
  phone, contact_email, default_currency, created_at
`.trim();

export class BusinessesRepository {
  constructor(private readonly client: SqlClient) {}

  async findById(id: string): Promise<BusinessRow | null> {
    return queryOne<BusinessRow>(
      this.client,
      `SELECT ${BUSINESS_COLUMNS} FROM businesses WHERE id = @id`,
      [{ name: "id", type: sql.UniqueIdentifier, value: id }],
    );
  }

  async updateBranding(
    id: string,
    fields: Record<string, unknown>,
  ): Promise<void> {
    const setClauses: string[] = [];
    const params: import("./sql").SqlParam[] = [
      { name: "id", type: sql.UniqueIdentifier, value: id },
    ];
    let i = 0;
    for (const [key, val] of Object.entries(fields)) {
      const col = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      const pname = `p${i}`;
      setClauses.push(`[${col}] = @${pname}`);
      params.push({
        name: pname,
        type:
          val === null || val === undefined
            ? sql.NVarChar(sql.MAX)
            : typeof val === "number"
              ? sql.Decimal(18, 2)
              : sql.NVarChar(sql.MAX),
        value: val ?? null,
      });
      i++;
    }
    if (setClauses.length === 0) return;
    const request = this.client.request();
    for (const p of params) {
      request.input(p.name, p.type as never, p.value);
    }
    await request.query(
      `UPDATE businesses SET ${setClauses.join(", ")} WHERE id = @id`,
    );
  }
}

export function createBusinessesRepository(client: SqlClient): BusinessesRepository {
  return new BusinessesRepository(client);
}
