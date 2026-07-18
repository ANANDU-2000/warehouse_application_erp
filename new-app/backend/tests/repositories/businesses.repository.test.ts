import { describe, it, expect } from "vitest";
import { BusinessesRepository } from "../../src/repositories/businesses.repository";
import type { BusinessRow } from "../../src/repositories/types";
import { createMockPool } from "./mockPool";

const sampleBusiness: BusinessRow = {
  id: "11111111-2222-3333-4444-555555555555",
  name: "Acme Warehouse",
  branding_title: null,
  branding_logo_url: null,
  gst_number: null,
  address: null,
  phone: null,
  contact_email: null,
  default_currency: "INR",
  created_at: new Date("2024-01-01T00:00:00Z"),
};

describe("BusinessesRepository", () => {
  it("findById returns a business row when present", async () => {
    const { pool, input, query } = createMockPool([sampleBusiness]);
    const repo = new BusinessesRepository(pool);

    const row = await repo.findById(sampleBusiness.id);

    expect(row).toEqual(sampleBusiness);
    expect(input).toHaveBeenCalledWith("id", expect.anything(), sampleBusiness.id);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("FROM businesses WHERE id = @id"),
    );
  });

  it("findById returns null when absent", async () => {
    const { pool } = createMockPool([]);
    const repo = new BusinessesRepository(pool);
    expect(await repo.findById(sampleBusiness.id)).toBeNull();
  });
});
