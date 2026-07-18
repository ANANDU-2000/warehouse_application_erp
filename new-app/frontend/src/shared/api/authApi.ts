/**
 * Auth HTTP — POST /v1/auth/login + GET /v1/me/businesses.
 * Paths: docs/modules/login.md; docs/43_Me_Businesses.md.
 * Dev: Vite proxies /v1 → backend :3000.
 */

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

/** Snake_case BusinessBrief — docs/43. */
export type BusinessBrief = {
  id: string;
  name: string;
  role: string;
  permissions: Record<string, boolean>;
  branding_title: string | null;
  branding_logo_url: string | null;
  gst_number: string | null;
  address: string | null;
  phone: string | null;
  contact_email: string | null;
};

export class AuthApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "AuthApiError";
    this.status = status;
    this.detail = detail;
  }
}

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

export async function login(
  email: string,
  password: string,
): Promise<TokenPair> {
  const res = await fetch("/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new AuthApiError(res.status, await readDetail(res));
  }
  return (await res.json()) as TokenPair;
}

export async function meBusinesses(
  accessToken: string,
): Promise<BusinessBrief[]> {
  const res = await fetch("/v1/me/businesses", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new AuthApiError(res.status, await readDetail(res));
  }
  return (await res.json()) as BusinessBrief[];
}
