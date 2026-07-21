import { z, ZodSchema, ZodError, ZodIssueCode } from "zod";
import i18n from "../i18n";

// Helper to resolve field names from translations
function humanizeField(field: string) {
  return field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveFieldLabel(field: string) {
  if (!field || field === "This field") return field;
  const fromFields = i18n.t(`FIELDS.${field}`, { defaultValue: "" });
  if (fromFields) return fromFields;
  const fromTitles = i18n.t(`TITLES.${field}`, { defaultValue: "" });
  if (fromTitles) return fromTitles;
  return humanizeField(field);
}

// Custom error map for Zod with i18n support
export const zodI18nErrorMap: z.ZodErrorMap = (issue, ctx) => {
  let message: string;
  const fieldLabel = issue.path[0] ? resolveFieldLabel(String(issue.path[0])) : "This field";

  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === "undefined" || issue.received === "null") {
        message = i18n.t("VALIDATIONS.required", { field: fieldLabel, defaultValue: `${fieldLabel} is required` });
      } else {
        message = i18n.t("VALIDATIONS.invalidType", {
          expected: issue.expected,
          received: issue.received,
          defaultValue: `Expected ${issue.expected}, received ${issue.received}`,
        });
      }
      break;

    case ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        message = i18n.t("VALIDATIONS.invalidEmail", { defaultValue: "Invalid email address" });
      } else if (issue.validation === "url") {
        message = i18n.t("VALIDATIONS.invalidUrl", { defaultValue: "Invalid URL" });
      } else {
        message = i18n.t("VALIDATIONS.invalidString", { defaultValue: "Invalid format" });
      }
      break;

    case ZodIssueCode.too_small:
      if (issue.type === "string") {
        message = i18n.t("VALIDATIONS.minLength", {
          count: issue.minimum as number,
          defaultValue: `Minimum ${issue.minimum} characters`,
        });
      } else if (issue.type === "number") {
        message = i18n.t("VALIDATIONS.minValue", {
          min: issue.minimum,
          defaultValue: `Must be at least ${issue.minimum}`,
        });
      } else if (issue.type === "array") {
        message = i18n.t("VALIDATIONS.minItems", {
          count: issue.minimum as number,
          defaultValue: `At least ${issue.minimum} item(s) required`,
        });
      } else {
        message = ctx.defaultError;
      }
      break;

    case ZodIssueCode.too_big:
      if (issue.type === "string") {
        message = i18n.t("VALIDATIONS.maxLength", {
          count: issue.maximum as number,
          defaultValue: `Maximum ${issue.maximum} characters`,
        });
      } else if (issue.type === "number") {
        message = i18n.t("VALIDATIONS.maxValue", {
          max: issue.maximum,
          defaultValue: `Must be at most ${issue.maximum}`,
        });
      } else if (issue.type === "array") {
        message = i18n.t("VALIDATIONS.maxItems", {
          count: issue.maximum as number,
          defaultValue: `At most ${issue.maximum} item(s) allowed`,
        });
      } else {
        message = ctx.defaultError;
      }
      break;

    case ZodIssueCode.custom:
      // Support "$$TRANSLATION.KEY" convention for i18n keys in custom messages
      if (issue.message?.startsWith("$$")) {
        message = i18n.t(issue.message.slice(2), { defaultValue: issue.message.slice(2) });
      } else {
        message = issue.message ?? ctx.defaultError;
      }
      break;

    default:
      message = ctx.defaultError;
  }

  return { message };
};

// Set global error map for Zod
z.setErrorMap(zodI18nErrorMap);

// Validate values against a Zod schema
export function validateSchema<T extends Record<string, any>>(
  values: T,
  schema: ZodSchema<T>
): Record<string, string> {
  try {
    schema.parse(values);
    return {};
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = err.message;
        }
      });
      return errors;
    }
    return {};
  }
}

// Helper validation functions for custom Zod refinements
export const customValidators = {
  arabic: (value: string) => /^[\u0600-\u06FF\s]+$/.test(value),
  english: (value: string) => /^[A-Za-z\s]+$/.test(value),
  phoneCode: (value: string) => /^\+?\d+$/.test(value),
};

// Common Zod schema builders with i18n
export const zodHelpers = {
  required: (fieldName?: string) => {
    const label = fieldName ? resolveFieldLabel(fieldName) : "This field";
    return z.string({
      required_error: i18n.t("VALIDATIONS.required", { field: label, defaultValue: `${label} is required` }),
    }).min(1, i18n.t("VALIDATIONS.required", { field: label, defaultValue: `${label} is required` }));
  },

  optionalString: () => z.string().optional().or(z.literal("")),

  email: (fieldName = "email") => {
    const label = resolveFieldLabel(fieldName);
    return z
      .string({
        required_error: i18n.t("VALIDATIONS.required", { field: label, defaultValue: `${label} is required` }),
      })
      .min(1, i18n.t("VALIDATIONS.required", { field: label, defaultValue: `${label} is required` }))
      .email(i18n.t("VALIDATIONS.invalidEmail", { defaultValue: "Invalid email address" }));
  },

  minLength: (min: number) =>
    z.string().min(min, i18n.t("VALIDATIONS.minLength", { count: min, defaultValue: `Minimum ${min} characters` })),

  maxLength: (max: number) =>
    z.string().max(max, i18n.t("VALIDATIONS.maxLength", { count: max, defaultValue: `Maximum ${max} characters` })),

  arabic: (fieldName?: string) => {
    const label = fieldName ? resolveFieldLabel(fieldName) : "This field";
    return z
      .string()
      .min(1, i18n.t("VALIDATIONS.required", { field: label, defaultValue: `${label} is required` }))
      .refine(customValidators.arabic, {
        message: i18n.t("VALIDATIONS.arabic", { defaultValue: "Arabic letters only" }),
      });
  },

  english: (fieldName?: string) => {
    const label = fieldName ? resolveFieldLabel(fieldName) : "This field";
    return z
      .string()
      .min(1, i18n.t("VALIDATIONS.required", { field: label, defaultValue: `${label} is required` }))
      .refine(customValidators.english, {
        message: i18n.t("VALIDATIONS.english", { defaultValue: "English letters only" }),
      });
  },

  file: (fieldName?: string) => {
    const label = fieldName ? resolveFieldLabel(fieldName) : "This field";
    return z.any().refine((val) => val !== null && val !== undefined, {
      message: i18n.t("VALIDATIONS.required", { field: label, defaultValue: `${label} is required` }),
    });
  },
};

// Export Zod for direct use
export { z };
