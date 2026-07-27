/**
 * Catalog hub `/catalog` — STATES (Step 6).
 * Source: catalog_page.dart ListSkeleton() · FriendlyLoadError defaults;
 * RefreshIndicator soft refetch when hasData.
 * Staff: blocked → `/staff/home`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  CatalogApiError,
  CatalogNetworkError,
  deleteItemCategory,
  listCatalogItems,
  listCategoryTypesIndex,
  listItemCategories,
  updateItemCategory,
  type CatalogCategory,
  type CatalogItemRow,
  type CategoryTypeIndexRow,
} from "./catalogApi";
import {
  CATALOG_BACK_FALLBACK,
  CATALOG_DELETE_CANCEL,
  CATALOG_DELETE_CONFIRM,
  CATALOG_DELETE_TITLE,
  CATALOG_DELETED_SNACK,
  CATALOG_FAB_LABEL,
  CATALOG_LOAD_FAILED,
  CATALOG_MENU_DELETE,
  CATALOG_MENU_RENAME,
  CATALOG_PATH_NEW_CATEGORY,
  CATALOG_PATH_SCAN,
  CATALOG_PATH_STOCK,
  CATALOG_PATH_TAXONOMY,
  CATALOG_RENAME_CANCEL,
  CATALOG_RENAME_SAVE,
  CATALOG_RENAME_TITLE,
  CATALOG_RETRY,
  CATALOG_SAVED_SNACK,
  CATALOG_SEARCH_HINT,
  CATALOG_SKELETON_HEIGHT_PX,
  CATALOG_SKELETON_ROWS,
  CATALOG_STAFF_REDIRECT,
  CATALOG_TITLE,
  CATALOG_TOOLTIP_BACK,
  CATALOG_TOOLTIP_QUICK_CATEGORIES,
  CATALOG_TOOLTIP_SCAN,
  CATALOG_TOOLTIP_STOCK_LIST,
  catalogCategoryPath,
} from "./catalogCopy";
import {
  CATALOG_SEARCH_DEBOUNCE_MS,
  catalogEmptyMode,
  catalogEmptySub,
  catalogEmptyTitle,
} from "./catalogFields";
import {
  mapCatalogLoadSubtitle,
  mapCatalogLoadTitle,
} from "./catalogLoadSubtitle";
import {
  catalogCategoryMeta,
  catalogDisplayCategories,
  catalogSuggestionCategories,
  itemCountForCategory,
  typeCountForCategory,
} from "./catalogTaxonomy";
import "./CatalogPage.css";

function popOrGo(
  navigate: ReturnType<typeof useNavigate>,
  fallback: string,
): void {
  if (window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback);
}

function friendlyCatalogError(e: unknown): string {
  if (e instanceof CatalogApiError) return e.detail;
  if (e instanceof CatalogNetworkError) return e.message;
  if (e instanceof Error && e.message) return e.message;
  return CATALOG_LOAD_FAILED;
}

export function CatalogPage() {
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "").toLowerCase();
  if (role === "staff") {
    return <Navigate to={CATALOG_STAFF_REDIRECT} replace />;
  }

  return <CatalogPageStates />;
}

function CatalogPageStates() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";

  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [items, setItems] = useState<CatalogItemRow[]>([]);
  const [typesIndex, setTypesIndex] = useState<CategoryTypeIndexRow[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const [hasData, setHasData] = useState(false);
  const hasDataRef = useRef(false);
  const [snack, setSnack] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<CatalogCategory | null>(
    null,
  );
  const [renameDraft, setRenameDraft] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CatalogCategory | null>(
    null,
  );
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearchQuery(searchDraft);
    }, CATALOG_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchDraft]);

  useEffect(() => {
    hasDataRef.current = false;
    setHasData(false);
    setCategories([]);
    setItems([]);
    setTypesIndex(null);
    setLoadError(null);
  }, [businessId]);

  const reload = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      setLoadError("Not signed in");
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const [cats, its, types] = await Promise.all([
        listItemCategories(businessId),
        listCatalogItems(businessId),
        listCategoryTypesIndex(businessId),
      ]);
      setCategories(cats);
      setItems(its);
      setTypesIndex(types);
      hasDataRef.current = true;
      setHasData(true);
      setLoadError(null);
    } catch (e: unknown) {
      if (!hasDataRef.current) {
        setCategories([]);
        setItems([]);
        setTypesIndex(null);
      }
      setLoadError(e);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await reload();
    })();
    return () => {
      cancelled = true;
    };
  }, [reload, retryTick]);

  const display = useMemo(
    () => catalogDisplayCategories(categories, searchQuery),
    [categories, searchQuery],
  );
  const suggestions = useMemo(
    () => catalogSuggestionCategories(categories, searchQuery),
    [categories, searchQuery],
  );

  const showInitialSkeleton = loading && !hasData;
  const showError = !loading && loadError != null && !hasData;
  const showBody = !showInitialSkeleton && !showError;
  const showEmpty = showBody && display.length === 0;
  const emptyMode = catalogEmptyMode({
    listLength: display.length,
    searchQuery,
  });
  const showClear = searchDraft.length > 0;
  const showSuggestions = searchQuery.trim().length > 0 && suggestions.length > 0;
  const errorTitle = mapCatalogLoadTitle(loadError);
  const errorSubtitle = mapCatalogLoadSubtitle(loadError);

  const retryLoad = () => setRetryTick((n) => n + 1);

  const onBack = () => popOrGo(navigate, CATALOG_BACK_FALLBACK);
  const onQuickCategories = () => navigate(CATALOG_PATH_TAXONOMY);
  const onStockList = () => navigate(CATALOG_PATH_STOCK);
  const onScan = () => navigate(CATALOG_PATH_SCAN);
  const onAddCategory = () => navigate(CATALOG_PATH_NEW_CATEGORY);
  const onOpenCategory = (id: string) => navigate(catalogCategoryPath(id));

  const flash = (msg: string) => {
    setSnack(msg);
    window.setTimeout(() => setSnack(null), 2500);
  };

  const onSaveRename = async () => {
    if (!renameTarget || !businessId) return;
    const name = renameDraft.trim();
    if (!name) return;
    setMutating(true);
    try {
      await updateItemCategory({
        businessId,
        categoryId: renameTarget.id,
        name,
      });
      setRenameTarget(null);
      flash(CATALOG_SAVED_SNACK);
      setRetryTick((n) => n + 1);
    } catch (e: unknown) {
      flash(friendlyCatalogError(e));
    } finally {
      setMutating(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget || !businessId) return;
    setMutating(true);
    try {
      await deleteItemCategory({
        businessId,
        categoryId: deleteTarget.id,
      });
      setDeleteTarget(null);
      flash(CATALOG_DELETED_SNACK);
      setRetryTick((n) => n + 1);
    } catch (e: unknown) {
      flash(friendlyCatalogError(e));
    } finally {
      setMutating(false);
    }
  };

  return (
    <div className="catalog-page" data-page="catalog-states">
      <header className="catalog-page__appbar" data-slot="appBar">
        <button
          type="button"
          className="catalog-page__icon-btn catalog-page__icon-btn--active"
          data-action="back"
          title={CATALOG_TOOLTIP_BACK}
          aria-label={CATALOG_TOOLTIP_BACK}
          onClick={onBack}
        >
          ←
        </button>
        <h1 className="catalog-page__title">{CATALOG_TITLE}</h1>
        <div className="catalog-page__appbar-actions" data-slot="appBarActions">
          <button
            type="button"
            className="catalog-page__icon-btn catalog-page__icon-btn--active"
            data-action="quick-categories"
            title={CATALOG_TOOLTIP_QUICK_CATEGORIES}
            aria-label={CATALOG_TOOLTIP_QUICK_CATEGORIES}
            onClick={onQuickCategories}
          >
            ▤
          </button>
          <button
            type="button"
            className="catalog-page__icon-btn catalog-page__icon-btn--active"
            data-action="stock-list"
            title={CATALOG_TOOLTIP_STOCK_LIST}
            aria-label={CATALOG_TOOLTIP_STOCK_LIST}
            onClick={onStockList}
          >
            ▦
          </button>
          <button
            type="button"
            className="catalog-page__icon-btn catalog-page__icon-btn--active"
            data-action="scan-barcode"
            title={CATALOG_TOOLTIP_SCAN}
            aria-label={CATALOG_TOOLTIP_SCAN}
            onClick={onScan}
          >
            ▣
          </button>
        </div>
      </header>

      {snack ? (
        <div className="catalog-page__snack" data-testid="catalog-snack">
          {snack}
        </div>
      ) : null}

      <div className="catalog-page__shell" data-slot="shell">
        <div
          className="catalog-page__search catalog-page__search--active"
          data-slot="search"
        >
          <span className="catalog-page__search-icon" aria-hidden>
            ⌕
          </span>
          <input
            className="catalog-page__search-input"
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={CATALOG_SEARCH_HINT}
            aria-label={CATALOG_SEARCH_HINT}
            data-testid="catalog-search"
            autoComplete="off"
          />
          {showClear ? (
            <button
              type="button"
              className="catalog-page__search-clear"
              data-testid="catalog-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setSearchDraft("");
                setSearchQuery("");
              }}
            >
              ×
            </button>
          ) : null}
        </div>

        <div
          className="catalog-page__suggestions"
          data-slot="suggestions"
          data-search-query={searchQuery.trim()}
        >
          {showSuggestions
            ? suggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="catalog-page__chip"
                  data-action="suggestion-chip"
                  onClick={() => onOpenCategory(c.id)}
                >
                  {c.name}
                </button>
              ))
            : null}
        </div>

        {showInitialSkeleton ? (
          <div
            className="catalog-page__skeleton"
            data-slot="loading"
            data-testid="catalog-loading"
            aria-busy="true"
            aria-label="ListSkeleton"
          >
            {Array.from({ length: CATALOG_SKELETON_ROWS }, (_, i) => (
              <div
                key={i}
                className="catalog-page__skeleton-row"
                style={{ height: CATALOG_SKELETON_HEIGHT_PX }}
              />
            ))}
          </div>
        ) : null}

        {showError ? (
          <div
            className="catalog-page__friendly-error"
            data-slot="error"
            data-testid="catalog-error"
            role="alert"
          >
            <p className="catalog-page__friendly-error-title">{errorTitle}</p>
            <p className="catalog-page__friendly-error-sub">{errorSubtitle}</p>
            <button
              type="button"
              className="catalog-page__friendly-error-retry"
              data-action="retry"
              data-testid="catalog-retry"
              onClick={retryLoad}
            >
              {CATALOG_RETRY}
            </button>
          </div>
        ) : null}

        {showBody ? (
          <div className="catalog-page__grid" data-slot="categoryGrid">
            {showEmpty ? (
              <div
                className="catalog-page__empty"
                data-slot="empty"
                data-empty-mode={emptyMode}
                data-testid="catalog-empty"
              >
                <div className="catalog-page__empty-icon" aria-hidden>
                  📁
                </div>
                <p className="catalog-page__empty-title">
                  {catalogEmptyTitle(emptyMode)}
                </p>
                <p className="catalog-page__empty-sub">
                  {catalogEmptySub(emptyMode)}
                </p>
              </div>
            ) : (
              display.map((c) => {
                const itemCount = itemCountForCategory(items, c.id);
                const subCount =
                  typesIndex == null
                    ? -1
                    : typeCountForCategory(typesIndex, c.id);
                const initial =
                  c.name.trim().length > 0
                    ? c.name.trim()[0]!.toUpperCase()
                    : "?";
                return (
                  <div key={c.id} className="catalog-page__card-wrap">
                    <button
                      type="button"
                      className="catalog-page__card catalog-page__card--hit"
                      data-action="open-category"
                      onClick={() => onOpenCategory(c.id)}
                    >
                      <div className="catalog-page__avatar">{initial}</div>
                      <div className="catalog-page__card-body">
                        <div className="catalog-page__card-name">{c.name}</div>
                        <div className="catalog-page__card-meta">
                          {catalogCategoryMeta({ subCount, itemCount })}
                        </div>
                      </div>
                      <div className="catalog-page__card-trail">›</div>
                    </button>
                    <div className="catalog-page__card-menu">
                      <button
                        type="button"
                        className="catalog-page__menu-btn"
                        data-action="category-menu"
                        aria-label="Category menu"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId((id) => (id === c.id ? null : c.id));
                        }}
                      >
                        ⋮
                      </button>
                      {menuOpenId === c.id ? (
                        <div
                          className="catalog-page__menu-panel"
                          data-testid="catalog-category-menu"
                        >
                          <button
                            type="button"
                            data-action="rename-category"
                            onClick={() => {
                              setMenuOpenId(null);
                              setRenameTarget(c);
                              setRenameDraft(c.name);
                            }}
                          >
                            {CATALOG_MENU_RENAME}
                          </button>
                          <button
                            type="button"
                            data-action="delete-category"
                            onClick={() => {
                              setMenuOpenId(null);
                              setDeleteTarget(c);
                            }}
                          >
                            {CATALOG_MENU_DELETE}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="catalog-page__fab catalog-page__fab--active"
        data-slot="fab"
        data-action="add-category"
        data-label={CATALOG_FAB_LABEL}
        aria-label={CATALOG_FAB_LABEL}
        onClick={onAddCategory}
      >
        <span className="catalog-page__fab-icon" aria-hidden>
          +
        </span>
        <span className="catalog-page__fab-label">{CATALOG_FAB_LABEL}</span>
      </button>

      {renameTarget ? (
        <div className="catalog-page__dialog" data-testid="catalog-rename-dialog">
          <div className="catalog-page__dialog-card">
            <h2>{CATALOG_RENAME_TITLE}</h2>
            <label>
              Name
              <input
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                autoFocus
              />
            </label>
            <div className="catalog-page__dialog-actions">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                disabled={mutating}
              >
                {CATALOG_RENAME_CANCEL}
              </button>
              <button
                type="button"
                data-action="rename-save"
                onClick={() => void onSaveRename()}
                disabled={mutating || !renameDraft.trim()}
              >
                {CATALOG_RENAME_SAVE}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="catalog-page__dialog" data-testid="catalog-delete-dialog">
          <div className="catalog-page__dialog-card">
            <h2>{CATALOG_DELETE_TITLE}</h2>
            <p>
              Delete “{deleteTarget.name}”? It must have no items.
            </p>
            <div className="catalog-page__dialog-actions">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={mutating}
              >
                {CATALOG_DELETE_CANCEL}
              </button>
              <button
                type="button"
                data-action="delete-confirm"
                onClick={() => void onConfirmDelete()}
                disabled={mutating}
              >
                {CATALOG_DELETE_CONFIRM}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
