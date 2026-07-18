# Units — Traceability Matrix

**Module:** Units (masters + unit-engine)  
**Queue:** 6  
**Status:** Review PASS (2026-07-18)  
**Branch:** `phase1/units-analysis`

| Capability | Flutter / asset | API / service | DB / JSON | Notes | Trace |
|---|---|---|---|---|---|
| Warehouse packaging picker | `PackagingTypeSelector` + `StockTrackingMode` | Item create body `default_unit` | `catalog_items.default_unit` | Products host UX | Complete |
| Unit setup sheet | `QuickCatalogUnitSetupSheet` | `PATCH /catalog-items/{id}` | catalog smart cols | When stock commit blocked | Complete |
| Client classify | `SmartUnitClassifier`, `SmartUnitService` | — | Flutter `unit_rules_master.json` **v10** | May drift vs server | Documented |
| Server text resolve | — | `resolve_from_text` | Backend JSON **v11** | No DB rules | Complete |
| Server item resolve | — | `resolve_for_catalog_item` | catalog row then JSON | PCS override rule | Complete |
| Merge into item | — | `merge_unit_resolution_into_catalog_row` | catalog smart columns | On create/update/scan/batch | Complete |
| Canonical profile | — | `_apply_canonical_unit_profile` | catalog | POST single create only | Complete |
| Clear incompatible extras | — | `_sync_item_unit_extras` | catalog | bag/box/tin | Complete |
| `unit_resolution` on Out | Consumers of field | `_catalog_item_out` | computed | Read-only | Complete |
| Line unit_resolution | — | `GET …/lines` | `resolve_from_text` | — | Complete |
| Purchase line guard | `purchase_line_unit_guard` | `purchase_line_unit_validation` | stock profile | — | Complete |
| Qty→stock unit | — | `unit_normalization` | — | — | Complete |
| Master units table | — | **no REST** | `master_units` seeded | Unused by resolver | Schema+seed |
| Smart unit/package rules tables | — | **no REST** | `smart_*_rules` | Unused | Schema only |
| Packaging profiles table | — | **no REST** | `item_packaging_profiles` | Unused | Schema only |
| Confidence logs | — | **no REST** | `unit_confidence_logs` | Unused | Schema only |
| Central calc preview | `central_calculation_engine` | — | — | UI only | Complete |

## Source anchors

- Models: `source-app/backend/app/models/unit_intelligence.py`
- Resolve: `source-app/backend/app/services/unit_resolution_service.py`
- JSON: `backend/app/services/unit_rules_master.json` (v11), `flutter_app/assets/config/unit_rules_master.json` (v10)
- Catalog wiring: `source-app/backend/app/routers/catalog.py` (`_apply_canonical_unit_profile`, `_sync_item_unit_extras`, `_catalog_item_out`)
- Flutter engine: `flutter_app/lib/core/unit_engine/`, `core/units/`
- Docs: `docs/20_Database_Analysis.md`, `docs/modules/products.md` §Boundary
