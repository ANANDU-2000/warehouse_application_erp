/**
 * `users` repository — global identity (no business_id).
 * Columns: `new-app/database/ddl/01_core.sql` (users).
 * Auth / password verify → Phase 3.5. Business rules → Phase 3.3.
 */
import type { ConnectionPool } from "mssql";
import { sql } from "../config/database";
import { queryOne } from "./sql";
import type { UserRow } from "./types";

const USER_COLUMNS = `
  id, email, username, password_hash, google_sub, phone, name,
  is_super_admin, ai_monthly_token_budget, ai_tokens_used_month,
  is_active, is_blocked, token_version, last_login_at, last_active_at,
  device_info, created_by, created_at, deleted_at, notes
`.trim();

export class UsersRepository {
  constructor(private readonly pool: ConnectionPool) {}

  async findById(id: string): Promise<UserRow | null> {
    return queryOne<UserRow>(
      this.pool,
      `SELECT ${USER_COLUMNS} FROM users WHERE id = @id`,
      [{ name: "id", type: sql.UniqueIdentifier, value: id }],
    );
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    return queryOne<UserRow>(
      this.pool,
      `SELECT ${USER_COLUMNS} FROM users WHERE email = @email`,
      [{ name: "email", type: sql.NVarChar(320), value: email }],
    );
  }
}

export function createUsersRepository(pool: ConnectionPool): UsersRepository {
  return new UsersRepository(pool);
}
