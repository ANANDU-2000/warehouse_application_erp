/**
 * BusinessUsersRepository SQL shape smoke (mocked pool).
 * Source: users.py list_users + _today_stats + _activity_count_7d
 */
import { describe, it, expect } from "vitest";
import { BusinessUsersRepository } from "../../src/repositories/businessUsers.repository";
import { createMockPool } from "../repositories/mockPool";

describe("BusinessUsersRepository", () => {
  it("listForBusiness joins memberships and filters deleted_at", async () => {
    const { pool, input, query } = createMockPool([
      {
        id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        name: "A",
        phone: null,
        email: "a@example.com",
        username: "a",
        role: "staff",
        is_active: true,
        is_blocked: false,
        last_login_at: null,
        last_active_at: null,
        notes: null,
        created_at: new Date("2024-01-01T00:00:00Z"),
      },
    ]);
    const repo = new BusinessUsersRepository(pool);
    const rows = await repo.listForBusiness(
      "11111111-2222-3333-4444-555555555555",
      false,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.email).toBe("a@example.com");
    expect(input).toHaveBeenCalledWith(
      "businessId",
      expect.anything(),
      "11111111-2222-3333-4444-555555555555",
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("u.[deleted_at] IS NULL"),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("u.[is_active] = 1"),
    );
  });

  it("listForBusiness omits is_active filter when includeInactive", async () => {
    const { pool, query } = createMockPool([]);
    const repo = new BusinessUsersRepository(pool);
    await repo.listForBusiness(
      "11111111-2222-3333-4444-555555555555",
      true,
    );
    const sqlText = String(query.mock.calls[0]?.[0] ?? "");
    expect(sqlText).toContain("deleted_at] IS NULL");
    expect(sqlText).not.toContain("is_active] = 1");
  });

  it("todayStats maps SCAN / STOCK_UPDATE / ITEM_CREATE", async () => {
    const { pool } = createMockPool([
      { action_type: "SCAN", c: 2 },
      { action_type: "STOCK_UPDATE", c: 5 },
    ]);
    const repo = new BusinessUsersRepository(pool);
    const stats = await repo.todayStats(
      "11111111-2222-3333-4444-555555555555",
      "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    );
    expect(stats).toEqual({
      scans: 2,
      stock_updates: 5,
      items_created: 0,
    });
  });

  it("activityCount7d returns count", async () => {
    const { pool } = createMockPool([{ c: 7 }]);
    const repo = new BusinessUsersRepository(pool);
    expect(
      await repo.activityCount7d(
        "11111111-2222-3333-4444-555555555555",
        "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      ),
    ).toBe(7);
  });
});
