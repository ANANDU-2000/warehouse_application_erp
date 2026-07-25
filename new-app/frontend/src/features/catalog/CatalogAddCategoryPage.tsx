/**
 * Catalog new category `/catalog/new-category` — WIRE (Step 5).
 * Formula source: catalog_add_category_page.dart
 * Similar fuzzy minScore 86 · limit 4 · POST createItemCategory · snack · pop.
 * Saving disables close/cancel/create (PopScope canPop: !_saving).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  CatalogApiError,
  CatalogNetworkError,
  createItemCategory,
  listItemCategories,
} from "./catalogApi";
import {
  ADD_CATEGORY_BACK_FALLBACK_OWNER,
  ADD_CATEGORY_BACK_FALLBACK_STAFF,
  ADD_CATEGORY_CANCEL,
  ADD_CATEGORY_CREATE,
  ADD_CATEGORY_CREATED_SNACK,
  ADD_CATEGORY_LOAD_FAILED,
  ADD_CATEGORY_NAME_HINT,
  ADD_CATEGORY_NAME_LABEL,
  ADD_CATEGORY_SIMILAR_GO_BACK,
  ADD_CATEGORY_SIMILAR_LIMIT,
  ADD_CATEGORY_SIMILAR_MIN_SCORE,
  ADD_CATEGORY_SIMILAR_TITLE,
  ADD_CATEGORY_TITLE,
  ADD_CATEGORY_TOOLTIP_CLOSE,
  addCategorySimilarBody,
} from "./catalogAddCategoryCopy";
import {
  addCategoryNameError,
  addCategoryNameIsEmpty,
} from "./catalogAddCategoryFields";
import { catalogFuzzyRank } from "./catalogFuzzy";
import "./CatalogAddCategoryPage.css";

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

function friendlyAddCategoryError(e: unknown): string {
  if (e instanceof CatalogApiError) return e.detail;
  if (e instanceof CatalogNetworkError) return e.message;
  if (e instanceof Error && e.message) return e.message;
  return ADD_CATEGORY_LOAD_FAILED;
}

export function CatalogAddCategoryPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";
  const role = (session?.role ?? "").toLowerCase();
  const isStaff = role === "staff";
  const backFallback = isStaff
    ? ADD_CATEGORY_BACK_FALLBACK_STAFF
    : ADD_CATEGORY_BACK_FALLBACK_OWNER;

  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);
  const [similarOpen, setSimilarOpen] = useState(false);
  const [similarBody, setSimilarBody] = useState("");
  const [pendingName, setPendingName] = useState("");

  const nameError = addCategoryNameError({ touched, name });
  const showError = nameError != null;

  const flash = (msg: string) => {
    setSnack(msg);
    window.setTimeout(() => setSnack(null), 2500);
  };

  const onClose = () => {
    if (saving) return;
    popOrGo(navigate, backFallback);
  };
  const onCancel = () => {
    if (saving) return;
    popOrGo(navigate, backFallback);
  };

  const postCreate = async (n: string) => {
    if (!businessId) {
      flash(ADD_CATEGORY_LOAD_FAILED);
      return;
    }
    setSaving(true);
    try {
      await createItemCategory({ businessId, name: n });
      flash(ADD_CATEGORY_CREATED_SNACK);
      window.setTimeout(() => {
        popOrGo(navigate, backFallback);
      }, 400);
    } catch (e: unknown) {
      flash(friendlyAddCategoryError(e));
    } finally {
      setSaving(false);
    }
  };

  const onCreate = async () => {
    if (saving) return;
    if (addCategoryNameIsEmpty(name)) {
      setTouched(true);
      return;
    }
    const n = name.trim();
    try {
      const cats = await listItemCategories(businessId);
      const similar = catalogFuzzyRank(n, cats, (c) => c.name, {
        minScore: ADD_CATEGORY_SIMILAR_MIN_SCORE,
        limit: ADD_CATEGORY_SIMILAR_LIMIT,
      });
      if (similar.length > 0) {
        setPendingName(n);
        setSimilarBody(
          addCategorySimilarBody(
            n,
            similar.map((c) => c.name),
          ),
        );
        setSimilarOpen(true);
        return;
      }
    } catch {
      /* Flutter: catch (_) {} then continue create */
    }
    await postCreate(n);
  };

  const onSimilarGoBack = () => {
    setSimilarOpen(false);
    setPendingName("");
  };

  const onSimilarConfirm = async () => {
    setSimilarOpen(false);
    const n = pendingName;
    setPendingName("");
    if (!n) return;
    await postCreate(n);
  };

  return (
    <div
      className="add-category-page"
      data-page="catalog-new-category"
      data-step="WIRE"
    >
      <header className="add-category-page__appbar" data-slot="appBar">
        <button
          type="button"
          className="add-category-page__icon-btn add-category-page__icon-btn--active"
          data-action="close"
          title={ADD_CATEGORY_TOOLTIP_CLOSE}
          aria-label={ADD_CATEGORY_TOOLTIP_CLOSE}
          disabled={saving}
          onClick={onClose}
        >
          ×
        </button>
        <h1 className="add-category-page__title">{ADD_CATEGORY_TITLE}</h1>
      </header>

      <div className="add-category-page__body">
        <label
          className={
            showError
              ? "add-category-page__field add-category-page__field--active add-category-page__field--error"
              : "add-category-page__field add-category-page__field--active"
          }
          data-slot="nameField"
          data-chrome="name-outline"
          data-error={showError ? "true" : "false"}
        >
          <span className="add-category-page__field-label">
            {ADD_CATEGORY_NAME_LABEL}
          </span>
          <input
            className="add-category-page__field-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={ADD_CATEGORY_NAME_HINT}
            aria-label={ADD_CATEGORY_NAME_LABEL}
            aria-invalid={showError}
            autoComplete="off"
            autoCapitalize="words"
            autoFocus
            disabled={saving}
            data-testid="add-category-name"
          />
          {showError ? (
            <span
              className="add-category-page__field-error add-category-page__field-error--visible"
              data-chrome="name-error"
              data-testid="add-category-name-error"
            >
              {nameError}
            </span>
          ) : null}
        </label>

        <div className="add-category-page__footer" data-slot="footer">
          <button
            type="button"
            className="add-category-page__btn add-category-page__btn--cancel add-category-page__btn--active"
            data-action="cancel"
            data-label={ADD_CATEGORY_CANCEL}
            disabled={saving}
            onClick={onCancel}
          >
            {ADD_CATEGORY_CANCEL}
          </button>
          <button
            type="button"
            className="add-category-page__btn add-category-page__btn--create add-category-page__btn--active"
            data-action="create"
            data-label={ADD_CATEGORY_CREATE}
            disabled={saving}
            onClick={() => void onCreate()}
          >
            {saving ? (
              <span
                className="add-category-page__spinner"
                data-slot="saving"
                aria-hidden
              />
            ) : (
              ADD_CATEGORY_CREATE
            )}
          </button>
        </div>
      </div>

      {similarOpen ? (
        <div
          className="add-category-page__dialog"
          data-slot="similarDialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-category-similar-title"
        >
          <div className="add-category-page__dialog-card">
            <h2
              id="add-category-similar-title"
              className="add-category-page__dialog-title"
            >
              {ADD_CATEGORY_SIMILAR_TITLE}
            </h2>
            <p className="add-category-page__dialog-body">{similarBody}</p>
            <div className="add-category-page__dialog-actions">
              <button
                type="button"
                data-action="similar-go-back"
                onClick={onSimilarGoBack}
              >
                {ADD_CATEGORY_SIMILAR_GO_BACK}
              </button>
              <button
                type="button"
                className="add-category-page__dialog-confirm"
                data-action="similar-create"
                onClick={() => void onSimilarConfirm()}
              >
                {ADD_CATEGORY_CREATE}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {snack ? (
        <div className="add-category-page__snack" data-testid="add-category-snack">
          {snack}
        </div>
      ) : null}
    </div>
  );
}
