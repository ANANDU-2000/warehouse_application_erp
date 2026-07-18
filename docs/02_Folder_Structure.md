# 02 — Folder Structure

> Extracted directly via `find` on the extracted zip, filtered to depth 3 and excluding native platform scaffolding (`ios/`, `android/`, `macos/`, `linux/`, `windows/` under `flutter_app/`, which are Flutter-generated and not hand-authored application logic) and dependency/VCS dirs.

## Repo root

```
PurchaseAssiastant-main/
├── .cursor/rules/              # Cursor AI editor rule files (e.g. figma-design-system.mdc, referenced by README)
├── backend/                    # FastAPI Python backend — see below
├── config/                     # MCP tool templates (render.mcp.template.json, supabase.mcp.template.json) — dev tooling, not app code
├── data/                       # Seed data: brokers_seed.json, products/, products_categories_items/, supplers/ (sic), files/, files.zip
├── docs/                       # Project documentation (partial — see 01_Project_Overview.md gaps)
├── flutter_app/                # Flutter client — see below
├── scripts/                    # Root-level PowerShell/bash ops scripts (deploy verification, smoke tests, git push helper)
├── 04_STOCK_MODULE_REDESIGN.md # Standalone planning doc at repo root
├── PRE_CLIENT_AUDIT_RESULT.md  # Pre-launch audit/handoff checklist
├── README.md
├── TASKS.md                    # 1,967-line engineering task/changelog log
├── docker-compose.yml          # Local Postgres + Redis
├── package.json                # Placeholder only — satisfies Vercel's Node installer step, not a real Node app (see 01_Project_Overview.md)
├── render.yaml                 # Render (backend host) deployment config
└── vercel.json                 # Vercel (frontend host) deployment config
```

## `backend/` (FastAPI)

```
backend/
├── alembic/
│   └── versions/               # Alembic auto-generated migration revisions
├── alembic.ini
├── app/
│   ├── main.py                 # FastAPI app instance, router registration, middleware wiring
│   ├── config.py                # Settings (env vars via pydantic-settings)
│   ├── database.py              # Async SQLAlchemy engine/session setup
│   ├── deps.py                  # FastAPI dependency-injection helpers (auth, db session, etc.)
│   ├── db_resilience.py         # DB retry/circuit-breaker style helpers
│   ├── db_schema_compat.py      # Schema compatibility shims
│   ├── sqlite_bootstrap.py      # SQLite fallback bootstrap (likely for tests/local-no-postgres)
│   ├── async_budget.py          # Async timeout/budget guard
│   ├── http_etag.py             # ETag/caching helpers for HTTP responses
│   ├── read_cache_generation.py # Cache-generation/invalidation helper
│   ├── middleware/               # Custom middleware (rate_limit.py)
│   ├── models/                   # 29 files — SQLAlchemy ORM models (46 tables) — see 20_Database_Analysis.md
│   ├── routers/                  # 26 files — FastAPI route handlers (+ stock/ subpackage with 5 more) — see 18_API_Inventory.md
│   ├── schemas/                  # 8 files — Pydantic request/response schemas
│   └── services/                 # 53 files — business logic layer (purchase engine, stock, notifications, OCR/AI, auth, etc.)
├── docs/                        # Backend-specific docs (24K, not yet inventoried in this batch)
├── requirements.txt
├── runtime.txt                  # Python version pin for Render
├── schema_expected.json         # Likely a schema-drift-detection fixture (DB schema snapshot)
├── scripts/                     # Seed/migration/ops scripts (data/, migrations/, ops/ subfolders)
├── sql/                         # 60 numbered raw SQL migration files (021–067), run alongside/instead of Alembic
└── tests/                       # 464K — pytest test suite
```

## `flutter_app/` (client)

```
flutter_app/
├── lib/
│   ├── core/                    # Shared/cross-cutting app infrastructure (26 subfolders):
│   │   api/ auth/ catalog/ config/ decision/ design_system/ errors/ models/
│   │   navigation/ notifications/ platform/ pricing/ providers/ purchase/
│   │   reporting/ router/ search/ services/ stock/ theme/ trade/
│   │   unit_engine/ units/ utils/ widgets/
│   ├── features/                # 21 feature modules (screens + feature-local widgets) — see 03_Module_Inventory.md
│   │   auth/ barcode/ broker/ catalog/ contacts/ dashboard/ home/ item/
│   │   notifications/ operations/ purchase/ reports/ search/ settings/
│   │   shell/ splash/ staff/ stock/ supplier/
│   ├── shared/widgets/          # Cross-feature reusable widgets
│   └── widgets/                 # Additional shared widgets (legacy location alongside shared/?)
├── assets/                      # brand/, config/, fonts/, images/ (2.4M)
├── test/                        # core/, features/ — 388K Dart test suite
├── tool/                        # Dev tooling scripts
├── web/                         # PWA shell: index.html, manifest.json, service worker, icons
├── pubspec.yaml / pubspec.lock
└── run_web_dev.ps1              # Windows-oriented local dev runner
```

**Note:** `flutter_app/lib` has both `shared/widgets/` and a separate top-level `widgets/` — this is a naming/organization inconsistency worth resolving during migration rather than mirroring 1:1 into the new React structure. Flagged for `45_Technical_Debt.md`.

## Native platform folders (excluded from detailed docs — not app logic)

`flutter_app/android/`, `flutter_app/ios/`, `flutter_app/macos/`, `flutter_app/linux/`, `flutter_app/windows/` — standard Flutter-generated native shells. Relevant only if native (non-PWA) builds are in scope; README states PWA is the primary target, native builds "optional."

## Directories not yet analyzed in this batch (flagged for later docs)

- `backend/docs/` (24K)
- `backend/scripts/` (512K — data/, migrations/, ops/)
- `backend/tests/` (464K)
- `data/` (552K — seed data, likely feeds `09_Field_Validation.md` / seed logic docs)
- `docs/cleanup/`, `docs/debug/`, `docs/perf/`, `docs/plans/`, `docs/users/`
- `TASKS.md`, `PRE_CLIENT_AUDIT_RESULT.md`, `04_STOCK_MODULE_REDESIGN.md`

These will be opened and cited directly (not summarized secondhand) when producing the docs that depend on them (business rules, test inventory, migration plan, known limitations).
