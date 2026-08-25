import type { TFunction } from "i18next";
import type { FilterItem } from "../components/Filter/Filter";
import type { FilterOption } from "../types/accounts";

export type ApiFilters = Record<string, FilterOption[]>;

const FILTER_TITLE_KEYS: Record<string, string> = {
  status: "TITLES.status",
  verification_status: "TITLES.verification",
  membership_type: "TITLES.membership",
  type: "TITLES.type",
};

/** Map API labels like `status.active` → i18n `STATUS.active`. */
export function translateFilterLabel(
  t: TFunction,
  label: string,
  value: string
): string {
  const fallback = value.replace(/_/g, " ");
  if (label.includes(".")) {
    const i18nKey = label
      .split(".")
      .map((part, i) => (i === 0 ? part.toUpperCase() : part))
      .join(".");
    return t(i18nKey, {
      defaultValue: t(`STATUS.${value}`, { defaultValue: fallback }),
    });
  }
  return t(`STATUS.${value}`, { defaultValue: label || fallback });
}

export function buildDynamicFilterItems(
  t: TFunction,
  apiFilters: ApiFilters | null | undefined,
  search?: {
    placeholder: string;
    prependInputIcon?: FilterItem["prependInputIcon"];
  }
): FilterItem[] {
  const items: FilterItem[] = [];

  if (search) {
    items.push({
      type: "text",
      key: "search",
      label: t("TITLES.search"),
      placeholder: search.placeholder,
      prependInputIcon: search.prependInputIcon,
    });
  }

  if (!apiFilters) return items;

  for (const [key, options] of Object.entries(apiFilters)) {
    if (!Array.isArray(options) || options.length === 0) continue;
    items.push({
      type: "radio",
      key,
      label: t(FILTER_TITLE_KEYS[key] ?? `TITLES.${key}`, {
        defaultValue: key.replace(/_/g, " "),
      }),
      options: options.map((opt) => ({
        id: opt.value,
        label: translateFilterLabel(t, opt.label, opt.value),
      })),
    });
  }

  return items;
}
