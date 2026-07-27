/**
 * Backend computeStockStatus + stockStatusWhereSql — stock_inventory / stock_helpers
 */
import { describe, it, expect } from "vitest";
import {
  computeStockStatus,
  stockStatusWhereSql,
} from "../../src/repositories/staffHome.repository";

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

describe("stockStatusWhereSql", () => {
  it("returns null for all", () => {
    expect(stockStatusWhereSql("all")).toBeNull();
  });

  it("returns out fragment", () => {
    expect(stockStatusWhereSql("out")).toContain("current_stock");
    expect(stockStatusWhereSql("out")).toContain("<= 0");
  });

  it("returns shortage as union", () => {
    const sql = stockStatusWhereSql("shortage") ?? "";
    expect(sql).toContain("OR");
    expect(sql.toLowerCase()).toContain("reorder_level");
  });

  it("returns low / critical fragments", () => {
    expect(stockStatusWhereSql("low")).toContain("reorder_level");
    expect(stockStatusWhereSql("critical")).toContain("* 0.5");
  });
});
