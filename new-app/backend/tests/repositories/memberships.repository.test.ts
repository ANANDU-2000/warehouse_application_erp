import { describe, it, expect } from "vitest";
import { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type { MembershipRow } from "../../src/repositories/types";
import { createMockPool } from "./mockPool";

const sampleMembership: MembershipRow = {
  id: "99999999-8888-7777-6666-555555555555",
  user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  business_id: "11111111-2222-3333-4444-555555555555",
  role: "owner",
  permissions_json: null,
  created_at: new Date("2024-01-01T00:00:00Z"),
};

describe("MembershipsRepository", () => {
  it("listByUserId returns memberships for user", async () => {
    const { pool, input, query } = createMockPool([sampleMembership]);
    const repo = new MembershipsRepository(pool);

    const rows = await repo.listByUserId(sampleMembership.user_id);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.business_id).toBe(sampleMembership.business_id);
    expect(input).toHaveBeenCalledWith(
      "userId",
      expect.anything(),
      sampleMembership.user_id,
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("FROM memberships WHERE user_id = @userId"),
    );
  });

  it("findByUserAndBusiness filters by both ids (tenancy)", async () => {
    const { pool, input, query } = createMockPool([sampleMembership]);
    const repo = new MembershipsRepository(pool);

    const row = await repo.findByUserAndBusiness(
      sampleMembership.user_id,
      sampleMembership.business_id,
    );

    expect(row).toEqual(sampleMembership);
    expect(input).toHaveBeenCalledWith(
      "userId",
      expect.anything(),
      sampleMembership.user_id,
    );
    expect(input).toHaveBeenCalledWith(
      "businessId",
      expect.anything(),
      sampleMembership.business_id,
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(/user_id = @userId AND business_id = @businessId/s),
    );
  });

  it("listByUserId returns empty array when none", async () => {
    const { pool } = createMockPool([]);
    const repo = new MembershipsRepository(pool);
    expect(await repo.listByUserId(sampleMembership.user_id)).toEqual([]);
  });
});
