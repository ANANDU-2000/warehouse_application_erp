# Frontend page build loop

**Rule:** One page step at a time. Stop and show diff before the next step.  
**Master order:** [`06_Master_Page_Build_Order.md`](06_Master_Page_Build_Order.md)  
**Spec per module:** `docs/modules/<module>.md`

---

## Steps (every route)

| # | Step | Allowed | Forbidden |
|---|---|---|---|
| 1 | **SCAFFOLD** | Route + empty page shell / layout container | Fields, CTA, API |
| 2 | **LAYOUT** | Brand colors, background asset, title/chrome parity | Form fields, submit, API |
| 3 | **FIELDS** | Inputs + client validation from module doc | Submit/API wire |
| 4 | **BUTTONS** | CTA / secondary links (may navigate locally) | Live API calls |
| 5 | **WIRE** | Call backend endpoints from `18_API_Inventory` / module doc | Invented endpoints |
| 6 | **STATES** | Loading, error, success, disabled | Dropping legacy messages |
| 7 | **COMPARE** | Legacy vs New PASS/FAIL table | Calling module “done” without PASS |

After COMPARE PASS → update [`00_MASTER_CHECKLIST.md`](00_MASTER_CHECKLIST.md) → next route/module.

---

## Working example — Login

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | `phase4/login-scaffold` — `/login` + `AuthPageShell` + empty `AuthFormCard` |
| 2 LAYOUT | ✅ | Brand mint/primary, `getstarted_bg.png`, warehouse icon + titles |
| 3 FIELDS | ✅ | email/password + obscure + validators (`loginValidation.ts`) — no buttons/API |
| 4 BUTTONS | ✅ | Sign In + Forgot stub + helper/© — no live API |
| 5 WIRE | ✅ | `POST /v1/auth/login` → tokens → `GET /v1/me/businesses` → home stubs |
| 6 STATES | ✅ | network banner + full §12 HTTP error mapping |
| 7 COMPARE | ✅ | [`login_compare.md`](modules/login_compare.md) — in-scope **PASS**; deferrals listed |

### Splash (landing)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | `/splash` static shell (`SplashPage`) — no restore |
| 2 LAYOUT | ✅ | `app_logo.png` + 800ms fade + static spinner — [`splash_layout_compare.md`](modules/splash_layout_compare.md) |
| 4 BUTTONS | ✅ | Retry + Use another account → `/login` — [`splash_buttons_compare.md`](modules/splash_buttons_compare.md) |
| 5 WIRE | ✅ | tokens → refresh → me/businesses → home/login — [`splash_wire_compare.md`](modules/splash_wire_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`splash_compare.md`](modules/splash_compare.md) |

### Dashboard (owner `/home`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty section slots — [`home_scaffold_compare.md`](modules/home_scaffold_compare.md) |
| 2 LAYOUT | ✅ | compact header + cards — [`home_layout_compare.md`](modules/home_layout_compare.md) |
| 3 FIELDS | ✅ | period chips + client state — [`home_fields_compare.md`](modules/home_fields_compare.md) |
| 4 BUTTONS | ✅ | header + tools + View all stubs — [`home_buttons_compare.md`](modules/home_buttons_compare.md) |
| 5 WIRE | ✅ | `reports/home-overview` — [`home_wire_compare.md`](modules/home_wire_compare.md) |
| 6 STATES | ✅ | skeleton + FriendlyLoadError/Retry + empty — [`home_states_compare.md`](modules/home_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`home_compare.md`](modules/home_compare.md) |

### Dashboard (owner `/home/activity`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty slots — [`home_activity_scaffold_compare.md`](modules/home_activity_scaffold_compare.md) |
| 2 LAYOUT | ✅ | AppBar / caption / table header — [`home_activity_layout_compare.md`](modules/home_activity_layout_compare.md) |
| 3 FIELDS | ✅ | period chips + custom — [`home_activity_fields_compare.md`](modules/home_activity_fields_compare.md) |
| 4 BUTTONS | ✅ | back popOrGo `/home` — [`home_activity_buttons_compare.md`](modules/home_activity_buttons_compare.md) |
| 5 WIRE | ✅ | trade/audit/staff feed — [`home_activity_wire_compare.md`](modules/home_activity_wire_compare.md) |
| 6 STATES | ✅ | skeleton / FriendlyLoadError / empty — [`home_activity_states_compare.md`](modules/home_activity_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`home_activity_compare.md`](modules/home_activity_compare.md) |

### Dashboard (owner `/home/breakdown-more`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty slots — [`home_breakdown_scaffold_compare.md`](modules/home_breakdown_scaffold_compare.md) |
| 2 LAYOUT | ✅ | AppBar / Total card / search chrome — [`home_breakdown_layout_compare.md`](modules/home_breakdown_layout_compare.md) |
| 3 FIELDS | ✅ | search input + match helper — [`home_breakdown_fields_compare.md`](modules/home_breakdown_fields_compare.md) |
| 4 BUTTONS | ✅ | back popOrGo `/home` — [`home_breakdown_buttons_compare.md`](modules/home_breakdown_buttons_compare.md) |
| 5 WIRE | ✅ | home-overview Total + rows — [`home_breakdown_wire_compare.md`](modules/home_breakdown_wire_compare.md) |
| 6 STATES | ✅ | cold spinner / silent empty — [`home_breakdown_states_compare.md`](modules/home_breakdown_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`home_breakdown_compare.md`](modules/home_breakdown_compare.md) |

### Dashboard (staff `/staff/home`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty section slots — [`staff_home_scaffold_compare.md`](modules/staff_home_scaffold_compare.md) |
| 2 LAYOUT | ✅ | greeting + section headers — [`staff_home_layout_compare.md`](modules/staff_home_layout_compare.md) |
| 3 FIELDS | ✅ | Home focus radios — [`staff_home_fields_compare.md`](modules/staff_home_fields_compare.md) |
| 4 BUTTONS | ✅ | profile sheet + tools/CTAs — [`staff_home_buttons_compare.md`](modules/staff_home_buttons_compare.md) |
| 5 WIRE | ✅ | scoped shell counts — [`staff_home_wire_compare.md`](modules/staff_home_wire_compare.md) |
| 6 STATES | ✅ | skeleton / FriendlyLoadError — [`staff_home_states_compare.md`](modules/staff_home_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`staff_home_compare.md`](modules/staff_home_compare.md) |

### Users & Roles (`/settings/users`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty chrome slots + manage gate — [`users_management_scaffold_compare.md`](modules/users_management_scaffold_compare.md) |
| 2 LAYOUT | ✅ | AppBar + muted strips + cards — [`users_management_layout_compare.md`](modules/users_management_layout_compare.md) |
| 3 FIELDS | ✅ | search + status chips — [`users_management_fields_compare.md`](modules/users_management_fields_compare.md) |
| 4 BUTTONS | ✅ | back/select/Add/drawer/bulk — [`users_management_buttons_compare.md`](modules/users_management_buttons_compare.md) |
| 5 WIRE | ✅ | list/create/bulk + cards — [`users_management_wire_compare.md`](modules/users_management_wire_compare.md) |
| 6 STATES | ✅ | ListSkeleton + HexaErrorCard — [`users_management_states_compare.md`](modules/users_management_states_compare.md) |
| 7 COMPARE | ✅ | Master PASS — [`users_management_compare.md`](modules/users_management_compare.md) |

### User profile (`/settings/users/:userId`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty slots + manage gate — [`user_profile_scaffold_compare.md`](modules/user_profile_scaffold_compare.md) |
| 2 LAYOUT | ✅ | brand AppBar/header/tabs — [`user_profile_layout_compare.md`](modules/user_profile_layout_compare.md) |
| 3 FIELDS | ✅ | header + KPI/activity/perms catalogs — [`user_profile_fields_compare.md`](modules/user_profile_fields_compare.md) |
| 4 BUTTONS | ✅ | back/Edit/More/Save stubs — [`user_profile_buttons_compare.md`](modules/user_profile_buttons_compare.md) |
| 5 WIRE | ✅ | profile GET/PATCH/reset/delete/perms — [`user_profile_wire_compare.md`](modules/user_profile_wire_compare.md) |
| 6 STATES | ✅ | spinner + HexaErrorCard/FriendlyLoadError — [`user_profile_states_compare.md`](modules/user_profile_states_compare.md) |
| 7 COMPARE | ✅ | Master PASS — [`user_profile_compare.md`](modules/user_profile_compare.md) |
| — Activity WIRE | ✅ | feed/stock/purchases/items/ledger — [`user_profile_activity_wire_compare.md`](modules/user_profile_activity_wire_compare.md) |

### Notifications (`/notifications`) — Subagent 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | appBar/search/filters/list slots — [`notifications_scaffold_compare.md`](modules/notifications_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa chips/search/card chrome — [`notifications_layout_compare.md`](modules/notifications_layout_compare.md) |
| 3 FIELDS | ✅ | search/filter state + empty catalogs — [`notifications_fields_compare.md`](modules/notifications_fields_compare.md) |
| 4 BUTTONS | ✅ | back/mark-all stub/clear dialog/CTA nav — [`notifications_buttons_compare.md`](modules/notifications_buttons_compare.md) |
| 5 WIRE | ✅ | list/merge/mark-all/clear/patch — [`notifications_wire_compare.md`](modules/notifications_wire_compare.md) |
| 6 STATES | ✅ | progress/error map/empty gate/pull — [`notifications_states_compare.md`](modules/notifications_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`notifications_compare.md`](modules/notifications_compare.md) |

### Staff search (`/staff/search`) — Subagent 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | search/filters/results (no AppBar) — [`staff_search_scaffold_compare.md`](modules/staff_search_scaffold_compare.md) |
| 2 LAYOUT | ✅ | ChoiceChip tokens + Quick filters empty chrome — [`staff_search_layout_compare.md`](modules/staff_search_layout_compare.md) |
| 3 FIELDS | ✅ | query/section/recents + empty catalogs — [`staff_search_fields_compare.md`](modules/staff_search_fields_compare.md) |
| 4 BUTTONS | ✅ | Quick-filter push/go — [`staff_search_buttons_compare.md`](modules/staff_search_buttons_compare.md) |
| 5 WIRE | ✅ | GET /search + rows + addRecent — [`staff_search_wire_compare.md`](modules/staff_search_wire_compare.md) |
| 6 STATES | ✅ | FriendlyLoadError + reload/cold gates + TTL — [`staff_search_states_compare.md`](modules/staff_search_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`staff_search_compare.md`](modules/staff_search_compare.md) |

### Staff item gallery (`/staff/items`) — Subagent 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | AppBar + search/filters/summary/results — [`staff_items_scaffold_compare.md`](modules/staff_items_scaffold_compare.md) |
| 2 LAYOUT | ✅ | ChoiceChip tokens + Card/list chrome CSS — [`staff_items_layout_compare.md`](modules/staff_items_layout_compare.md) |
| 3 FIELDS | ✅ | debounce/filter chips + match helpers — [`staff_items_fields_compare.md`](modules/staff_items_fields_compare.md) |
| 4 BUTTONS | ✅ | expand/subtabs/row menu/nav — [`staff_items_buttons_compare.md`](modules/staff_items_buttons_compare.md) |
| 5 WIRE | ✅ | listStock paginate + gallery fields — [`staff_items_wire_compare.md`](modules/staff_items_wire_compare.md) |
| 6 STATES | ✅ | FriendlyLoadError + body gates + 3m cache — [`staff_items_states_compare.md`](modules/staff_items_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`staff_items_compare.md`](modules/staff_items_compare.md) |

### Staff stock (`/staff/stock`) — Subagent 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | AppBar + tabs + status/search/table/empty — [`staff_stock_scaffold_compare.md`](modules/staff_stock_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa operational tokens + chip/table chrome — [`staff_stock_layout_compare.md`](modules/staff_stock_layout_compare.md) |
| 3 FIELDS | ✅ | debounce 180ms + status/tabs + empty titles — [`staff_stock_fields_compare.md`](modules/staff_stock_fields_compare.md) |
| 4 BUTTONS | ✅ | period/filters/search-toggle/Scan — [`staff_stock_buttons_compare.md`](modules/staff_stock_buttons_compare.md) |
| 5 WIRE | ✅ | listStock + SYS/PHYS/DIFF rows — [`staff_stock_wire_compare.md`](modules/staff_stock_wire_compare.md) |
| 6 STATES | ✅ | ListSkeleton + FriendlyLoadError + 3m cache — [`staff_stock_states_compare.md`](modules/staff_stock_states_compare.md) |
| 7 COMPARE | ✅ | Aggregator SCAFFOLD→STATES — [`staff_stock_compare.md`](modules/staff_stock_compare.md) |

### Staff purchase history (`/staff/purchase-history`) — Subagent 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | AppBar + tabs + search/chips/empty — [`staff_purchase_history_scaffold_compare.md`](modules/staff_purchase_history_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa tokens + row/date chrome — [`staff_purchase_history_layout_compare.md`](modules/staff_purchase_history_layout_compare.md) |
| 3 FIELDS | ✅ | debounce 250ms + status/low chips + empty titles — [`staff_purchase_history_fields_compare.md`](modules/staff_purchase_history_fields_compare.md) |
| 4 BUTTONS | ✅ | row tap + Inform owner + date grouping — [`staff_purchase_history_buttons_compare.md`](modules/staff_purchase_history_buttons_compare.md) |
| 5 WIRE | ✅ | trade-purchases + low listStock — [`staff_purchase_history_wire_compare.md`](modules/staff_purchase_history_wire_compare.md) |
| 6 STATES | ✅ | ListSkeleton + FriendlyLoadError + 2m cache — [`staff_purchase_history_states_compare.md`](modules/staff_purchase_history_states_compare.md) |
| 7 COMPARE | ✅ | Aggregator SCAFFOLD→STATES — [`staff_purchase_history_compare.md`](modules/staff_purchase_history_compare.md) |

### Staff low stock (`/staff/low-stock`) — Subagent 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | AppBar + search/tabs/empty — [`staff_low_stock_scaffold_compare.md`](modules/staff_low_stock_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa tokens + category/row chrome — [`staff_low_stock_layout_compare.md`](modules/staff_low_stock_layout_compare.md) |
| 3 FIELDS | ✅ | debounce 200ms + scopes + tab filters — [`staff_low_stock_fields_compare.md`](modules/staff_low_stock_fields_compare.md) |
| 4 BUTTONS | ✅ | Inform/Receive/profile/export empty snack — [`staff_low_stock_buttons_compare.md`](modules/staff_low_stock_buttons_compare.md) |
| 5 WIRE | ✅ | ops list + notify-owner — [`staff_low_stock_wire_compare.md`](modules/staff_low_stock_wire_compare.md) |
| 6 STATES | ✅ | spinner + 10s slow + FriendlyLoadError + pull — [`staff_low_stock_states_compare.md`](modules/staff_low_stock_states_compare.md) |
| 7 COMPARE | ✅ | Aggregator SCAFFOLD→STATES — [`staff_low_stock_compare.md`](modules/staff_low_stock_compare.md) |

### Staff activity (`/staff/activity`) — Subagent 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | AppBar + period chips + empty — [`staff_activity_scaffold_compare.md`](modules/staff_activity_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa tokens + avatar/row chrome — [`staff_activity_layout_compare.md`](modules/staff_activity_layout_compare.md) |
| 3 FIELDS | ✅ | period Today/Week/Month select — [`staff_activity_fields_compare.md`](modules/staff_activity_fields_compare.md) |
| 4 BUTTONS | ✅ | back + display-only rows — [`staff_activity_buttons_compare.md`](modules/staff_activity_buttons_compare.md) |
| 5 WIRE | ✅ | activity-log by period + labels — [`staff_activity_wire_compare.md`](modules/staff_activity_wire_compare.md) |
| 6 STATES | ✅ | ListSkeleton 10 + HexaErrorCard map — [`staff_activity_states_compare.md`](modules/staff_activity_states_compare.md) |
| 7 COMPARE | ✅ | Aggregator SCAFFOLD→STATES — [`staff_activity_compare.md`](modules/staff_activity_compare.md) |

### Staff deliveries (`/staff/deliveries`) — Subagent 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | AppBar + 3 sections + empty — [`staff_deliveries_scaffold_compare.md`](modules/staff_deliveries_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa tokens + card/row chrome — [`staff_deliveries_layout_compare.md`](modules/staff_deliveries_layout_compare.md) |
| 3 FIELDS | ✅ | title/count/empty gates (no inputs) — [`staff_deliveries_fields_compare.md`](modules/staff_deliveries_fields_compare.md) |
| 4 BUTTONS | ✅ | back + scan + row→receive stubs — [`staff_deliveries_buttons_compare.md`](modules/staff_deliveries_buttons_compare.md) |
| 5 WIRE | ✅ | trade-purchases + groupStaffDeliverySections — [`staff_deliveries_wire_compare.md`](modules/staff_deliveries_wire_compare.md) |
| 6 STATES | ✅ | ListSkeleton 6 + FriendlyLoadError — [`staff_deliveries_states_compare.md`](modules/staff_deliveries_states_compare.md) |
| 7 COMPARE | ✅ | Aggregator SCAFFOLD→STATES — [`staff_deliveries_compare.md`](modules/staff_deliveries_compare.md) |

### Catalog hub (`/catalog`) — Seq 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | AppBar + empty slots + staff gate — [`catalog_scaffold_compare.md`](modules/catalog_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa tokens + search/card/FAB chrome — [`catalog_layout_compare.md`](modules/catalog_layout_compare.md) |
| 3 FIELDS | ✅ | Search + 150ms debounce + empty catalogs — [`catalog_fields_compare.md`](modules/catalog_fields_compare.md) |
| 4 BUTTONS | ✅ | Back/taxonomy/stock/scan/FAB/card nav — [`catalog_buttons_compare.md`](modules/catalog_buttons_compare.md) |
| 5 WIRE | ✅ | item-categories + items + types-index + fuzzy + rename/delete — [`catalog_wire_compare.md`](modules/catalog_wire_compare.md) |
| 6 STATES | ✅ | ListSkeleton 6×84 + FriendlyLoadError — [`catalog_states_compare.md`](modules/catalog_states_compare.md) |
| 7 COMPARE | ✅ | Aggregator SCAFFOLD→STATES — [`catalog_compare.md`](modules/catalog_compare.md) |

### Catalog taxonomy hub (`/catalog/taxonomy`) — Seq 5

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | AppBar + explainer/chips/search/list/empty/FAB + staff allowed — [`catalog_taxonomy_scaffold_compare.md`](modules/catalog_taxonomy_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa tokens + ActionChip/search/row/FAB chrome — [`catalog_taxonomy_layout_compare.md`](modules/catalog_taxonomy_layout_compare.md) |
| 3 FIELDS | ✅ | Search contains (no debounce) + empty catalogs — [`catalog_taxonomy_fields_compare.md`](modules/catalog_taxonomy_fields_compare.md) |
| 4 BUTTONS | ✅ | Back/full-catalog/chips/FAB/empty/row nav stubs — [`catalog_taxonomy_buttons_compare.md`](modules/catalog_taxonomy_buttons_compare.md) |
| 5 WIRE | ✅ | item-categories + types-index + sub counts — [`catalog_taxonomy_wire_compare.md`](modules/catalog_taxonomy_wire_compare.md) |
| 6 STATES | ✅ | ListSkeleton 6×84 + FriendlyLoadError — [`catalog_taxonomy_states_compare.md`](modules/catalog_taxonomy_states_compare.md) |
| 7 COMPARE | ✅ | Aggregator SCAFFOLD→STATES — [`catalog_taxonomy_compare.md`](modules/catalog_taxonomy_compare.md) |

### Catalog new category (`/catalog/new-category`) — Seq 5

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | AppBar + name/footer slots + staff allowed — [`catalog_new_category_scaffold_compare.md`](modules/catalog_new_category_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa tokens + Outline name + Cancel/Create chrome — [`catalog_new_category_layout_compare.md`](modules/catalog_new_category_layout_compare.md) |
| 3 FIELDS | ✅ | Name input + `Enter a name` — [`catalog_new_category_fields_compare.md`](modules/catalog_new_category_fields_compare.md) |
| 4 BUTTONS | ✅ | Close/Cancel pop + Create touch validation — [`catalog_new_category_buttons_compare.md`](modules/catalog_new_category_buttons_compare.md) |
| 5 WIRE | ✅ | POST create + similar fuzzy 86 + snack — [`catalog_new_category_wire_compare.md`](modules/catalog_new_category_wire_compare.md) |
| 6 STATES | ✅ | Retryable error snack + saving polish — [`catalog_new_category_states_compare.md`](modules/catalog_new_category_states_compare.md) |
| 7 COMPARE | ✅ | Aggregator SCAFFOLD→STATES — [`catalog_new_category_compare.md`](modules/catalog_new_category_compare.md) |

### Catalog new subcategory (`/catalog/category/:categoryId/new-subcategory`) — Seq 5

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | AppBar + name/footer slots + categoryId + staff allowed — [`catalog_new_subcategory_scaffold_compare.md`](modules/catalog_new_subcategory_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa tokens + Outline name + Cancel/Create chrome — [`catalog_new_subcategory_layout_compare.md`](modules/catalog_new_subcategory_layout_compare.md) |
| 3 FIELDS | ✅ | Name input + `Enter a name` — [`catalog_new_subcategory_fields_compare.md`](modules/catalog_new_subcategory_fields_compare.md) |
| 4 BUTTONS | ✅ | Close/Cancel pop + Create touch validation — [`catalog_new_subcategory_buttons_compare.md`](modules/catalog_new_subcategory_buttons_compare.md) |
| 5 WIRE | ⬜ | Ask before WIRE |
| 6 STATES | ⬜ | |
| 7 COMPARE | ⬜ | |

### Prompt template (copy per page)

```
PAGE: <name>
STEP: <n. NAME>

READ FIRST:
1. docs/modules/<module>.md
2. docs/05_Navigation_Map.md (exact path)
3. Backend routes for this page (if WIRE+)

TASK: <one step only>
STOP after this. Show diff before next step.
```
