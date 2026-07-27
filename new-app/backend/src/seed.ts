import { randomUUID } from "node:crypto";
import { hash } from "bcrypt";
import { connect, close, getPool, sql } from "./config/database";
import { queryOne, queryMany } from "./repositories/sql";

export async function seed(): Promise<void> {
  await connect();
  try {
    const pool = getPool();

    const existing = await queryOne<{ id: string }>(
      pool,
      "SELECT id FROM users WHERE email = @email",
      [{ name: "email", type: sql.NVarChar(320), value: "admin@demo.com" }],
    );

    if (existing) {
      console.log("Seed data already exists; skipping.");
      return;
    }

    const businessId = randomUUID();
    const userId = randomUUID();
    const membershipId = randomUUID();
    const passwordHash = await hash("Admin@123", 10);
    const now = new Date();

    await queryMany(
      pool,
      `INSERT INTO businesses (id, name, default_currency, created_at) VALUES (@id, @name, @defaultCurrency, @createdAt)`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: businessId },
        { name: "name", type: sql.NVarChar(255), value: "Demo Business" },
        { name: "defaultCurrency", type: sql.NVarChar(3), value: "INR" },
        { name: "createdAt", type: sql.DateTimeOffset, value: now },
      ],
    );

    await queryMany(
      pool,
      `INSERT INTO users (id, email, username, name, password_hash, is_super_admin, ai_tokens_used_month, is_active, is_blocked, token_version, created_at) VALUES (@id, @email, @username, @name, @passwordHash, @isSuperAdmin, @aiTokensUsedMonth, @isActive, @isBlocked, @tokenVersion, @createdAt)`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: userId },
        { name: "email", type: sql.NVarChar(320), value: "admin@demo.com" },
        { name: "username", type: sql.NVarChar(64), value: "admin" },
        { name: "name", type: sql.NVarChar(255), value: "Admin User" },
        { name: "passwordHash", type: sql.NVarChar(255), value: passwordHash },
        { name: "isSuperAdmin", type: sql.Bit, value: true },
        { name: "aiTokensUsedMonth", type: sql.Int, value: 0 },
        { name: "isActive", type: sql.Bit, value: true },
        { name: "isBlocked", type: sql.Bit, value: false },
        { name: "tokenVersion", type: sql.Int, value: 0 },
        { name: "createdAt", type: sql.DateTimeOffset, value: now },
      ],
    );

    await queryMany(
      pool,
      `INSERT INTO memberships (id, user_id, business_id, role, created_at) VALUES (@id, @userId, @businessId, @role, @createdAt)`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: membershipId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "role", type: sql.NVarChar(32), value: "owner" },
        { name: "createdAt", type: sql.DateTimeOffset, value: now },
      ],
    );

    console.log("Seed completed successfully.");
    console.log(`  Email: admin@demo.com`);
    console.log(`  Password: Admin@123`);
  } finally {
    await close();
  }
}
