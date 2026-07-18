# Settings — Traceability Matrix

**Module:** Settings (hub / business profile / export & backup / help)  
**Queue:** 15  
**Status:** Review PASS (2026-07-18)  
**Branch:** `phase1/settings-analysis`

| Capability | Flutter | API | DB / notes | Auth | Trace |
|---|---|---|---|---|---|
| Settings hub | `SettingsPage` | — | — | membership | Complete |
| Staff settings alias | `/staff/settings` | — | same widget | staff route | Complete |
| Business profile | `BusinessProfilePage` | `me.py` branding PATCH | `businesses` cols | owner save | Complete |
| Stock Excel | BackupPage | `GET …/exports/stock-inventory.xlsx` | catalog | `export_access` | Complete |
| Purchases month PDF | BackupPage | `GET …/exports/purchases-month.pdf` | trade | `export_access` | Complete |
| JSON backup | BackupPage + web auto | `GET …/exports/backup/export` | catalog/suppliers/purchases | `export_access` | Complete |
| ZIP backup | BackupPage (native) + desktop auto | `POST …/exports/backup` | multi-file ZIP | `export_access` | Complete |
| Daily auto-backup | `backup_auto_service` | same exports | prefs keys | `export_access` | Complete |
| Monthly banner | `backup_monthly_banner` | — | local dismiss | owner | Complete |
| Help guide | `HelpGuidePage` | — | local content | membership | Complete |
| Notif prefs | hub toggles | — | device-local | — | Complete |
| Users entry | hub / sidebar link | — | — | manage users | → #3 |
| WhatsApp fields | removed | — | dropped 066 | — | Absent |
| PO Share PDF | — | local `sharePurchasePdf` | — | — | → #9 cite |
| Reports in-shell export | — | — | — | — | → #14 |
| In-app restore | none | none | export-only | — | Absent |

## Source anchors

- Flutter: `features/settings/presentation/*`, `backup_auto_service.dart`, `backup_deliver.dart`
- Backend: `exports.py`, `export_files.py`, `me.py`, `models/business.py`, `066_drop_scan_and_whatsapp.sql`
- Tests: `test_exports_backup.py`
- Prior: `docs/modules/reports.md` §Boundary, `docs/modules/sales.md` WhatsApp deferral
