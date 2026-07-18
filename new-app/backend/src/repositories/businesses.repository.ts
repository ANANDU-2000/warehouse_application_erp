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
}

export function createBusinessesRepository(client: SqlClient): BusinessesRepository {
  return new BusinessesRepository(client);
}
