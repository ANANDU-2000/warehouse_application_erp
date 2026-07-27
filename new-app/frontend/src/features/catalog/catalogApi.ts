/**
 * Catalog hub WIRE API — Formula source: hexa_api listItemCategories /
 * listCatalogItems / listCategoryTypesIndex / createItemCategory /
 * updateItemCategory / deleteItemCategory
 */
import { readTokens } from "../../shared/auth/tokenStore";

export class CatalogApiError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "CatalogApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class CatalogNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogNetworkError";
  }
}

export type CatalogCategory = { id: string; name: string };

export type CatalogItemRow = {
  id: string;
  name: string;
  category_id: string | null;
};

export type CategoryTypeIndexRow = {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
};

async function readDetail(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (
      body &&
      typeof body === "object" &&
      "detail" in body &&
      typeof (body as { detail: unknown }).detail === "string"
    ) {
      return (body as { detail: string }).detail;
    }
  } catch {
    /* ignore */
  }
  return "Something went wrong. Please try again.";
}

function authHeaders(json = false): HeadersInit {
  const tokens = readTokens();
  if (!tokens) {
    throw new CatalogApiError(401, "Not authenticated");
  }
  const h: Record<string, string> = {
    Authorization: `Bearer ${tokens.access_token}`,
  };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

function asList(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (e): e is Record<string, unknown> =>
      !!e && typeof e === "object" && !Array.isArray(e),
  );
}

export async function listItemCategories(
  businessId: string,
): Promise<CatalogCategory[]> {
  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(businessId)}/item-categories`,
      { headers: authHeaders() },
    );
  } catch {
    throw new CatalogNetworkError("Network error");
  }
  if (!res.ok) {
    throw new CatalogApiError(res.status, await readDetail(res));
  }
  const data: unknown = await res.json();
  return asList(data).map((r) => ({
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
  }));
}

export async function listCatalogItems(
  businessId: string,
): Promise<CatalogItemRow[]> {
  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(businessId)}/catalog-items`,
      { headers: authHeaders() },
    );
  } catch {
    throw new CatalogNetworkError("Network error");
  }
  if (!res.ok) {
    throw new CatalogApiError(res.status, await readDetail(res));
  }
  const data: unknown = await res.json();
  return asList(data).map((r) => ({
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    category_id:
      r.category_id == null || r.category_id === ""
        ? null
        : String(r.category_id),
  }));
}

export async function listCategoryTypesIndex(
  businessId: string,
): Promise<CategoryTypeIndexRow[]> {
  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(businessId)}/category-types-index`,
      { headers: authHeaders() },
    );
  } catch {
    throw new CatalogNetworkError("Network error");
  }
  if (!res.ok) {
    throw new CatalogApiError(res.status, await readDetail(res));
  }
  const data: unknown = await res.json();
  return asList(data).map((r) => ({
    id: String(r.id ?? ""),
    category_id: String(r.category_id ?? ""),
    category_name: String(r.category_name ?? ""),
    name: String(r.name ?? ""),
  }));
}

export async function createItemCategory(args: {
  businessId: string;
  name: string;
}): Promise<CatalogCategory> {
  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(args.businessId)}/item-categories`,
      {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ name: args.name }),
      },
    );
  } catch {
    throw new CatalogNetworkError("Network error");
  }
  if (!res.ok) {
    throw new CatalogApiError(res.status, await readDetail(res));
  }
  const r = (await res.json()) as Record<string, unknown>;
  return { id: String(r.id ?? ""), name: String(r.name ?? args.name) };
}

export async function updateItemCategory(args: {
  businessId: string;
  categoryId: string;
  name: string;
}): Promise<CatalogCategory> {
  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(args.businessId)}/item-categories/${encodeURIComponent(args.categoryId)}`,
      {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ name: args.name }),
      },
    );
  } catch {
    throw new CatalogNetworkError("Network error");
  }
  if (!res.ok) {
    throw new CatalogApiError(res.status, await readDetail(res));
  }
  const r = (await res.json()) as Record<string, unknown>;
  return { id: String(r.id ?? args.categoryId), name: String(r.name ?? "") };
}

export async function deleteItemCategory(args: {
  businessId: string;
  categoryId: string;
}): Promise<void> {
  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(args.businessId)}/item-categories/${encodeURIComponent(args.categoryId)}`,
      { method: "DELETE", headers: authHeaders() },
    );
  } catch {
    throw new CatalogNetworkError("Network error");
  }
  if (!res.ok && res.status !== 204) {
    throw new CatalogApiError(res.status, await readDetail(res));
  }
}
