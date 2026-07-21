/**
 * Centralized Zod schemas for the entire application.
 *
 * Usage in a form:
 *   import { schemas } from "../../lib/schemas";
 *   <Form schema={schemas.category} ... />
 *
 * For forms with conditional schemas (create vs edit), pick the right one:
 *   <Form schema={editing ? schemas.userEdit : schemas.userCreate} ... />
 */

import { z, zodHelpers } from "./validation";

// ---------------------------------------------------------------------------
// Reusable field definitions
// ---------------------------------------------------------------------------
const fields = {
  name_ar: zodHelpers.required("name_ar"),
  name_en: zodHelpers.required("name_en"),
  first_name: zodHelpers.required("first_name"),
  last_name: zodHelpers.required("last_name"),
  email: zodHelpers.email(),
  phone_code: zodHelpers.required("phone_code"),
  phone: zodHelpers.required("phone"),
  password: zodHelpers.required("password").min(8).max(16),
  password_confirmation: zodHelpers.required("password_confirmation"),
  current_password: zodHelpers.required("current_password").min(8),
  image: zodHelpers.file("image"),
  flag: zodHelpers.file("flag"),
  phone_length: zodHelpers.required("phone_length"),
  currency_ar: zodHelpers.required("currency_ar"),
  currency_en: zodHelpers.required("currency_en"),
  estimated_arrival_days: zodHelpers.required("estimated_arrival_days"),
};

// ---------------------------------------------------------------------------
// Reusable superRefine: password === password_confirmation
// ---------------------------------------------------------------------------
const withPasswordMatch = <T extends z.ZodObject<any>>(schema: T) =>
  schema.superRefine(
    (data: { password?: string; password_confirmation?: string }, ctx) => {
      if (
        data.password &&
        data.password_confirmation &&
        data.password !== data.password_confirmation
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password_confirmation"],
          message: "$$VALIDATIONS.passwordConfirmed",
        });
      }
    }
  );

// ---------------------------------------------------------------------------
// Application schemas
// ---------------------------------------------------------------------------
export const schemas = {
  // Auth
  login: z.object({
    email: fields.email,
    password: fields.password,
  }),

  // Categories
  category: z.object({
    name_ar: fields.name_ar,
    name_en: fields.name_en,
    image: fields.image,
  }),

  // Cities
  city: z.object({
    name_ar: fields.name_ar,
    name_en: fields.name_en,
  }),

  // Countries
  country: z.object({
    name_ar: fields.name_ar,
    name_en: fields.name_en,
    phone_code: fields.phone_code,
    phone_length: fields.phone_length,
    currency_ar: fields.currency_ar,
    currency_en: fields.currency_en,
    estimated_arrival_days: fields.estimated_arrival_days,
  }),

  // Users
  userCreate: withPasswordMatch(
    z.object({
      first_name: fields.first_name,
      last_name: fields.last_name,
      email: fields.email,
      password: fields.password,
      password_confirmation: fields.password_confirmation,
      phone_code: fields.phone_code,
      phone: fields.phone,
    })
  ),

  userEdit: z.object({
    first_name: fields.first_name,
    last_name: fields.last_name,
    email: fields.email,
    phone_code: fields.phone_code,
    phone: fields.phone,
  }),

  // Profile
  profileEdit: z.object({
    first_name: fields.first_name,
    last_name: fields.last_name,
    email: fields.email,
    phone_code: fields.phone_code,
    phone: fields.phone,
  }),

  profilePassword: withPasswordMatch(
    z.object({
      current_password: fields.current_password,
      password: fields.password,
      password_confirmation: fields.password_confirmation,
    })
  ),
};

// Export fields for one-off field reuse in unique forms
export { fields };
