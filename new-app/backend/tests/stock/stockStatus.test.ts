/**
 * Backend computeStockStatus — stock_inventory.stock_status
 */
import { describe, it, expect } from "vitest";
import { computeStockStatus } from "../../src/repositories/staffHome.repository";

describe("computeStockStatus", () => {
  it("returns out when stock <= 0", () => {
    expect(computeStockStatus(0, 10)).toBe("out");
    expect(computeStockStatus(-1, 5)).toBe("out");
  });

  it("returns critical when stock <= reorder * 0.5", () => {
    expect(computeStockStatus(4, 10)).toBe("critical");
  });

  it("returns low when stock <= reorder", () => {
    expect(computeStockStatus(8, 10)).toBe("low");
  });

  it("returns healthy when above reorder", () => {
    expect(computeStockStatus(20, 10)).toBe("healthy");
  });

  it("returns low for fractional stock when reorder <= 0", () => {
    expect(computeStockStatus(0.5, 0)).toBe("low");
  });
});
