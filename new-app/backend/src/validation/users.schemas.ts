/**
 * Users create body — port of UserCreateIn (schemas/users.py).
 */
import { z } from "zod";

/**
 * Mirrors UserCreateIn + resolve_email model_validator.
 * role pattern admin|manager|staff; email optional → {digits}@staff.harisree.local.
 */
export const userCreateInSchema = z
  .object({
    full_name: z.string().min(1).max(255),
    email: z.string().min(5).max(320).optional().nullable(),
    phone: z.string().min(6).max(32),
    role: z.string().regex(/^(admin|manager|staff)$/),
    password: z.string().optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    is_active: z.boolean().optional().default(true),
  })
  .transform((data, ctx) => {
    let email: string;
    if (data.email && data.email.trim()) {
      email = data.email.trim().toLowerCase();
    } else {
      const digits = (data.phone || "").replace(/\D/g, "");
      if (digits.length < 6) {
        ctx.addIssue({ code: "custom", message: "Invalid phone" });
        return z.NEVER;
      }
      email = `${digits}@staff.harisree.local`;
    }
    return {
      full_name: data.full_name,
      email,
      phone: data.phone,
      role: data.role as "admin" | "manager" | "staff",
      /** Raw password from body (before strip) — needed for generated_password truthiness. */
      password: data.password ?? null,
      notes: data.notes ?? null,
      is_active: data.is_active ?? true,
    };
  });

export type UserCreateIn = z.infer<typeof userCreateInSchema>;

/**
 * Mirrors UserPatchIn — all fields optional.
 * role pattern admin|manager|staff|owner; email lower applied in service (field_validator).
 */
export const userPatchInSchema = z.object({
  full_name: z.string().min(1).max(255).optional().nullable(),
  email: z.string().min(5).max(320).optional().nullable(),
  phone: z.string().min(1).max(32).optional().nullable(),
  role: z
    .string()
    .regex(/^(admin|manager|staff|owner)$/)
    .optional()
    .nullable(),
  is_active: z.boolean().optional().nullable(),
  is_blocked: z.boolean().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type UserPatchIn = z.infer<typeof userPatchInSchema>;

/** Digits-only phone — users.py:_phone_digits */
export function phoneDigits(phone: string): string {
  return (phone || "").replace(/\D/g, "");
}
