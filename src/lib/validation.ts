import i18n from "../i18n";

type Validator = (value: any, ...args: any[]) => string | null;

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

const validators: Record<string, Validator> = {
  required: (value, name = "This field") => {
    if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
      const fieldLabel = name === "This field" ? name : resolveFieldLabel(name);
      return i18n.t("VALIDATIONS.required", { field: fieldLabel, defaultValue: `${fieldLabel} is required` });
    }
    return null;
  },
  email: (value) => {
    if (!value) return null;
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value))
      return i18n.t("VALIDATIONS.invalidEmail", { defaultValue: "Invalid email address" });
    return null;
  },
  minLength: (value, limit: number) => {
    if (!value) return null;
    if (String(value).length < limit)
      return i18n.t("VALIDATIONS.minLength", { count: limit, defaultValue: `Minimum ${limit} characters` });
    return null;
  },
  maxLength: (value, limit: number) => {
    if (!value) return null;
    if (String(value).length > limit)
      return i18n.t("VALIDATIONS.maxLength", { count: limit, defaultValue: `Maximum ${limit} characters` });
    return null;
  },
  password_confirmed: (value, target: any) => {
    if (value !== target)
      return i18n.t("VALIDATIONS.passwordConfirmed", { defaultValue: "Passwords must match" });
    return null;
  },
  arabic: (value) => {
    if (!value) return null;
    if (!/^[\u0600-\u06FF\s]+$/.test(value))
      return i18n.t("VALIDATIONS.arabic", { defaultValue: "Arabic letters only" });
    return null;
  },
  english: (value) => {
    if (!value) return null;
    if (!/^[A-Za-z\s]+$/.test(value))
      return i18n.t("VALIDATIONS.english", { defaultValue: "English letters only" });
    return null;
  },
};

export function validate(value: any, rules: string, formValues?: Record<string, any>): string | null {
  const parts = rules.split("|");
  for (const part of parts) {
    const [ruleName, ...args] = part.split(":");
    if (ruleName === "type") continue;
    const fn = validators[ruleName];
    if (!fn) continue;
    if (ruleName === "password_confirmed" && formValues) {
      const err = fn(value, formValues[args[0]]);
      if (err) return err;
    } else {
      const parsedArgs = args.map((a) => (isNaN(Number(a)) ? a : Number(a)));
      const err = fn(value, ...parsedArgs);
      if (err) return err;
    }
  }
  return null;
}

export function validateSchema(values: Record<string, any>, schema: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, rules] of Object.entries(schema)) {
    const err = validate(values[field], rules, values);
    if (err) errors[field] = err;
  }
  return errors;
}
