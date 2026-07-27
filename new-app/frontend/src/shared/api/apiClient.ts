import { readTokens } from "../auth/tokenStore";

const API_BASE = "";

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const tokens = readTokens();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${tokens?.access_token ?? ""}`,
    },
  });
  if (!res.ok) {
    const detail = await readDetail(res);
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const tokens = readTokens();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens?.access_token ?? ""}`,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await readDetail(res);
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const tokens = readTokens();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens?.access_token ?? ""}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await readDetail(res);
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const tokens = readTokens();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens?.access_token ?? ""}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await readDetail(res);
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

export async function apiDelete(path: string): Promise<void> {
  const tokens = readTokens();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${tokens?.access_token ?? ""}`,
    },
  });
  if (!res.ok) {
    const detail = await readDetail(res);
    throw new ApiError(res.status, detail);
  }
}

async function readDetail(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (
      body &&
      typeof body === "object" &&
      "detail" in body &&
      typeof (body as Record<string, unknown>).detail === "string"
    ) {
      return (body as { detail: string }).detail;
    }
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}
