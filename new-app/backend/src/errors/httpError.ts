/**
 * Throw-able HTTP error for Express next(err) → errorHandler.
 * Phase 3.8 — FastAPI HTTPException analogue (string detail).
 */
export class HttpError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "HttpError";
    this.status = status;
    this.detail = detail;
  }
}
