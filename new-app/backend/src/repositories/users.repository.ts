/**
 * `users` repository — global identity (no business_id).
 * Columns: `new-app/database/ddl/01_core.sql` (users).
 * Auth / password verify → Phase 3.5. Business rules → Phase 3.3.
 */
import { sql } from "../config/database";
import { queryOne, type SqlClient } from "./sql";
import type { UserRow } from "./types";

const USER_COLUMNS = `
  id, email, username, password_hash, google_sub, phone, name,
  is_super_admin, ai_monthly_token_budget, ai_tokens_used_month,
  is_active, is_blocked, token_version, last_login_at, last_active_at,
  device_info, created_by, created_at, deleted_at, notes
`.trim();

export type UserInsertInput = {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  phone: string;
  name: string;
  is_active: boolean;
  is_blocked: boolean;
  notes: string | null;
  created_by: string;
  created_at: Date;
};

export class UsersRepository {
  constructor(private readonly client: SqlClient) {}

  async findById(id: string): Promise<UserRow | null> {
    return queryOne<UserRow>(
      this.client,
      `SELECT ${USER_COLUMNS} FROM users WHERE id = @id`,
      [{ name: "id", type: sql.UniqueIdentifier, value: id }],
    );
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    return queryOne<UserRow>(
      this.client,
      `SELECT ${USER_COLUMNS} FROM users WHERE email = @email`,
      [{ name: "email", type: sql.NVarChar(320), value: email }],
    );
  }

  /** True if username taken (any row). */
  async usernameExists(username: string): Promise<boolean> {
    const row = await queryOne<{ id: string }>(
      this.client,
      `SELECT TOP 1 [id] FROM [users] WHERE [username] = @username`,
      [{ name: "username", type: sql.NVarChar(64), value: username }],
    );
    return row != null;
  }

  /**
   * Active (non-soft-deleted) email exists — create_user filter.
   * Source: User.email == email AND deleted_at IS NULL
   */
  async emailExistsActive(email: string): Promise<boolean> {
    const row = await queryOne<{ id: string }>(
      this.client,
      `SELECT TOP 1 [id] FROM [users]
       WHERE [email] = @email AND [deleted_at] IS NULL`,
      [{ name: "email", type: sql.NVarChar(320), value: email }],
    );
    return row != null;
  }

  /** Insert user row for create_user. */
  async insert(row: UserInsertInput): Promise<void> {
    await queryOne(
      this.client,
      `INSERT INTO [users] (
         [id], [email], [username], [password_hash], [google_sub], [phone], [name],
         [is_super_admin], [ai_monthly_token_budget], [ai_tokens_used_month],
         [is_active], [is_blocked], [token_version],
         [last_login_at], [last_active_at], [device_info],
         [created_by], [created_at], [deleted_at], [notes]
       ) VALUES (
         @id, @email, @username, @password_hash, NULL, @phone, @name,
         0, 100000, 0,
         @is_active, @is_blocked, 0,
         NULL, NULL, NULL,
         @created_by, @created_at, NULL, @notes
       )`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: row.id },
        { name: "email", type: sql.NVarChar(320), value: row.email },
        { name: "username", type: sql.NVarChar(64), value: row.username },
        {
          name: "password_hash",
          type: sql.NVarChar(255),
          value: row.password_hash,
        },
        { name: "phone", type: sql.NVarChar(32), value: row.phone },
        { name: "name", type: sql.NVarChar(255), value: row.name },
        { name: "is_active", type: sql.Bit, value: row.is_active },
        { name: "is_blocked", type: sql.Bit, value: row.is_blocked },
        {
          name: "created_by",
          type: sql.UniqueIdentifier,
          value: row.created_by,
        },
        { name: "created_at", type: sql.DateTimeOffset, value: row.created_at },
        { name: "notes", type: sql.NVarChar(2000), value: row.notes },
      ],
    );
  }
}

export function createUsersRepository(client: SqlClient): UsersRepository {
  return new UsersRepository(client);
}
