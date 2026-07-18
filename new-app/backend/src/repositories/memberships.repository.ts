/**
 * `memberships` repository — user↔business junction (has business_id).
 * listByUserId returns memberships for Login/business picker.
 * Future tenant-scoped repos must accept businessId and filter (docs/29).
 * Columns: `new-app/database/ddl/01_core.sql` (memberships).
 */
import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient } from "./sql";
import type { MembershipRow } from "./types";

const MEMBERSHIP_COLUMNS = `
  id, user_id, business_id, role, permissions_json, created_at
`.trim();

export class MembershipsRepository {
  constructor(private readonly client: SqlClient) {}

  async findById(id: string): Promise<MembershipRow | null> {
    return queryOne<MembershipRow>(
      this.client,
      `SELECT ${MEMBERSHIP_COLUMNS} FROM memberships WHERE id = @id`,
      [{ name: "id", type: sql.UniqueIdentifier, value: id }],
    );
  }

  /** Memberships for a user (Login / business list). Caller scopes further in 3.3+. */
  async listByUserId(userId: string): Promise<MembershipRow[]> {
    return queryMany<MembershipRow>(
      this.client,
      `SELECT ${MEMBERSHIP_COLUMNS} FROM memberships WHERE user_id = @userId ORDER BY created_at`,
      [{ name: "userId", type: sql.UniqueIdentifier, value: userId }],
    );
  }

  /**
   * Explicit tenant-safe lookup: membership for user in a given business.
   * Prefer this over filtering client-side when checking access to one business.
   */
  async findByUserAndBusiness(
    userId: string,
    businessId: string,
  ): Promise<MembershipRow | null> {
    return queryOne<MembershipRow>(
      this.client,
      `SELECT ${MEMBERSHIP_COLUMNS}
       FROM memberships
       WHERE user_id = @userId AND business_id = @businessId`,
      [
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
  }

  /** Insert membership for create_user. */
  async insert(row: {
    id: string;
    user_id: string;
    business_id: string;
    role: string;
    permissions_json: string;
    created_at: Date;
  }): Promise<void> {
    await queryOne(
      this.client,
      `INSERT INTO [memberships] (
         [id], [user_id], [business_id], [role], [permissions_json], [created_at]
       ) VALUES (
         @id, @userId, @businessId, @role, @permissionsJson, @createdAt
       )`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: row.id },
        { name: "userId", type: sql.UniqueIdentifier, value: row.user_id },
        {
          name: "businessId",
          type: sql.UniqueIdentifier,
          value: row.business_id,
        },
        { name: "role", type: sql.NVarChar(32), value: row.role },
        {
          name: "permissionsJson",
          type: sql.NVarChar(/* MAX */ -1),
          value: row.permissions_json,
        },
        { name: "createdAt", type: sql.DateTimeOffset, value: row.created_at },
      ],
    );
  }
}

export function createMembershipsRepository(client: SqlClient): MembershipsRepository {
  return new MembershipsRepository(client);
}
