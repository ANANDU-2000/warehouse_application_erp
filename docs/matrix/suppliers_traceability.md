# Suppliers — Traceability Matrix

**Module:** Suppliers (Contacts — suppliers + brokers)  
**Queue:** 7  
**Status:** Review PASS (2026-07-18)  
**Branch:** `phase1/suppliers-analysis`

| Capability | Flutter | API | DB | Auth / notes | Trace |
|---|---|---|---|---|---|
| Contacts hub | `ContactsPage` | list suppliers/brokers | — | Staff blocked | Complete |
| Create supplier simple | `SupplierCreateSimple` | `POST /suppliers` | `suppliers` | Membership | Complete |
| Create/edit supplier wizard | `SupplierCreateWizardPage` | POST/PATCH | + M2M + prefs | Membership | Complete |
| Delete supplier | Hub ⋮ | `DELETE /suppliers/{id}` | hard delete | **Owner**; TP block | Complete |
| Supplier detail | `SupplierDetailPage` | GET + listTradePurchases | — | — | Complete |
| Supplier ledger surface | `SupplierLedgerPage` | purchases by supplier | — | PO rows deferred | Surface |
| Create/edit broker | `BrokerWizardPage` | POST/PATCH `/brokers` | `brokers` + M2M | Membership | Complete |
| Delete broker | Hub ⋮ | `DELETE /brokers/{id}` | hard | **Owner**; TP + assigned suppliers | Complete |
| Broker detail | `BrokerDetailPage` | GET + metrics + linked-suppliers | — | No detail edit | Complete |
| Broker history | `BrokerHistoryPage` | purchases by broker | — | Surface | Surface |
| Linked suppliers | detail list | `GET …/linked-suppliers` | via TPs | Max 200 | Complete |
| Metrics | broker card; hub unused | `…/metrics?from&to` | TP aggregates | Membership | Complete |
| Contacts search API | unused by hub | `GET /contacts/search` | — | API exists | Documented |
| Category-items | `/contacts/category` | `GET /contacts/category-items` | — | Boundary | Noted |
| Batch items | detail menu | — | — | **Products** | Boundary |
| Customers | none | none | none | Queue #8 | Absent |
| Preferences / AI flag | wizard store | preferences_json | Text JSON | Consumer Unknown | Documented |

## Source anchors

- Router: `source-app/backend/app/routers/contacts.py`
- Models: `source-app/backend/app/models/contacts.py`; `BrokerSupplierLink` in `trade_purchase.py`
- Flutter: `features/contacts/presentation/*`, `features/supplier/…/supplier_ledger_page.dart`, `features/broker/…/broker_history_page.dart`
- Providers: `contacts_hub_provider.dart`, `suppliers_list_provider.dart`, `brokers_list_provider.dart`
- Staff block: `app_router.dart` `_staffRedirectForBlockedRoute`
- Docs: `docs/20_Database_Analysis.md`, `docs/18_API_Inventory.md`, Products/Units boundary
