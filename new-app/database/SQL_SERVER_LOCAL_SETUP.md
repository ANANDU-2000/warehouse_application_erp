# SQL Server local setup

See **[docs/44_Local_SQL_Bootstrap.md](../../docs/44_Local_SQL_Bootstrap.md)** for exact env names, verify gate (46 tables / 103 FKs), cascade-path notes, and smoke test (`GET /api/health`).

Quick apply (requires `sqlcmd` on PATH + SQL auth login):

```powershell
cd new-app/database/migrate
.\Apply-Schema.ps1 -Server localhost -Database WarehouseErp -Username warehouse_dev -Password (ConvertTo-SecureString "YOUR_PASSWORD" -AsPlainText -Force)
```
