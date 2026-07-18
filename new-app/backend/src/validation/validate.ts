/**
 * Zod validation helper — Phase 3.7.
 * Auth uses a single detail string (login) rather than FastAPI 422 error arrays.
 */
import type { z } from "zod";

export class SchemaValidationError extends Error {
  readonly code = "SCHEMA_VALIDATION" as const;
  readonly detail: string;

  constructor(detail: string) {
    super(detail);
    this.name = "SchemaValidationError";
    this.detail = detail;
  }
}

/**
 * Parse body with schema. On failure throws SchemaValidationError with `fallbackDetail`
 * (or first Zod issue message if fallback not provided).
 */
export function validateWithSchema<T extends z.ZodType>(
  schema: T,
  body: unknown,
  fallbackDetail?: string,
): z.infer<T> {
  const result = schema.safeParse(body);
  if (result.success) {
    return result.data;
  }
  const first = result.error.issues[0]?.message;
  const detail = fallbackDetail ?? first ?? "Validation failed";
  throw new SchemaValidationError(detail);
}
