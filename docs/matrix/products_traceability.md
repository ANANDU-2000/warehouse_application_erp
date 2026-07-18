# Traceability matrix — Products (catalog items)

| Legacy Feature | Future React (placeholder) | Future API | DB | Rules | Status |
|---|---|---|---|---|---|
| Catalog hub category grid | `features/catalog/CatalogPage` | list categories (Categories module) | item_categories | staff blocked from hub | Complete |
| Type item list | `…/TypeItemsPage` | `GET /catalog-items?type_id=` | catalog_items | deleted_at null | Complete |
| Quick-add create | `…/ItemCreatePage` | `POST /catalog-items` | catalog_items + defaults | name unique cat+type | Complete |
| From-scan create | `…/BarcodeQuickCreate` | `POST /catalog-items/from-scan` | catalog_items | unique barcode/code | Complete |
| Batch create | `…/BatchItemCreate` | `POST /catalog-items/batch` | catalog_items | supplier ids min 1 | Complete |
| Item detail | `…/ItemDetailPage` | `GET /catalog-items/{id}` + stock bundle | catalog_items | staff financial redaction | Complete |
| Item edit | `…/ItemEditPage` | `PATCH /catalog-items/{id}` | catalog_items | opening stock owner dashboard | Complete |
| Variants | detail/edit | variants CRUD | catalog_variants | name unique per item | Complete |
| Codes / barcode | missing-codes + patch | generate-code, item-code, barcode | catalog_items | barcode needs stock_edit | Complete |
| Duplicates archive | `…/DuplicatesPage` | duplicate-clusters + bulk-archive | catalog_items | soft deleted_at | Complete |
| Reorder levels setup | `…/SetupReorderLevels` | bulk-reorder / update | catalog_items.reorder_level | owner | Complete |
| Hard delete | admin action | `DELETE /catalog-items/{id}` | catalog_items | owner; trade-line block | Complete |
| Fuzzy name check | create UX | `GET /catalog/fuzzy-check` | catalog_items | rapidfuzz | Complete |

Evidence: [`docs/modules/products.md`](../modules/products.md)
