import { sql } from "../config/database";
import { queryOne, type SqlClient } from "./sql";

export type DamageReportRow = {
  id: string;
  purchase_id: string;
  catalog_item_id: string | null;
  qty_damaged: number;
  damage_type: string;
  unit: string | null;
  reason: string | null;
  status: string;
  notes: string | null;
  photo_url: string | null;
  reported_by_user_id: string | null;
  created_at: Date;
  updated_at: Date;
};

export class DamageReportsRepository {
  constructor(private readonly client: SqlClient) {}

  async countPending(businessId: string): Promise<number> {
    const row = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT([id]) AS c FROM purchase_damage_reports
       WHERE [business_id] = @businessId AND [status] = N'pending'`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    return Number(row?.c ?? 0);
  }

  async getById(businessId: string, reportId: string): Promise<DamageReportRow | null> {
    const row = await queryOne<DamageReportRow>(
      this.client,
      `SELECT * FROM purchase_damage_reports
       WHERE [id] = @reportId AND [business_id] = @businessId`,
      [
        { name: "reportId", type: sql.UniqueIdentifier, value: reportId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    return row ?? null;
  }

  async updateStatus(
    businessId: string,
    reportId: string,
    status: string,
    notes: string | null,
  ): Promise<DamageReportRow | null> {
    await this.client.request()
      .input("reportId", sql.UniqueIdentifier, reportId)
      .input("businessId", sql.UniqueIdentifier, businessId)
      .input("status", sql.NVarChar(32), status)
      .input("notes", sql.NVarChar(sql.MAX), notes ?? null)
      .query(
        `UPDATE purchase_damage_reports
         SET [status] = @status, [notes] = ISNULL(@notes, [notes]), [updated_at] = SYSUTCDATETIME()
         WHERE [id] = @reportId AND [business_id] = @businessId`,
      );
    return this.getById(businessId, reportId);
  }
}

export function createDamageReportsRepository(client: SqlClient): DamageReportsRepository {
  return new DamageReportsRepository(client);
}
