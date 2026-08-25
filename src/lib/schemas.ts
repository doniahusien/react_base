/**
 * Centralized Zod schemas for the entire application.
 */

import { z, zodHelpers } from "./validation";

const fields = {
  full_name: zodHelpers.required("full_name").max(100),
  email: zodHelpers.email(),
  preferred_language: z.enum(["ar", "en"]),
  password: zodHelpers.required("password").min(8).max(16),
  current_password: zodHelpers.required("current_password").min(8),
  new_password: zodHelpers.required("new_password").min(8),
  new_password_confirmation: zodHelpers.required("new_password_confirmation"),
};

const withNewPasswordMatch = <T extends z.ZodObject<any>>(schema: T) =>
  schema.superRefine(
    (data: { new_password?: string; new_password_confirmation?: string }, ctx) => {
      if (
        data.new_password &&
        data.new_password_confirmation &&
        data.new_password !== data.new_password_confirmation
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["new_password_confirmation"],
          message: "$$VALIDATIONS.passwordConfirmed",
        });
      }
    }
  );

export const schemas = {
  login: z.object({
    email: fields.email,
    password: fields.password,
  }),

  profileEdit: z.object({
    full_name: fields.full_name,
    email: fields.email,
    preferred_language: fields.preferred_language,
  }),

  profilePassword: withNewPasswordMatch(
    z.object({
      current_password: fields.current_password,
      new_password: fields.new_password,
      new_password_confirmation: fields.new_password_confirmation,
    })
  ),
};

export { fields };
