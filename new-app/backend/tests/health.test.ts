import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("GET /api/health", () => {
  it("returns 200 and ok status with databaseConnected false without pool", async () => {
    const app = createApp();
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("warehouse-erp-backend");
    expect(res.body).toHaveProperty("databaseConfigured");
    expect(res.body.databaseConnected).toBe(false);
  });
});
