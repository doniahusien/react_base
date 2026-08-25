import type { CSSProperties, ReactNode } from "react";

/**
 * Safely access nested object properties using dot notation
 */
export function dig(obj: any, path: string): any {
  return path.split(".").reduce((c, k) => c?.[k], obj);
}

/**
 * Get the current page number from URL query parameters
 */
export function pageFromUrl(): number {
  return parseInt(new URLSearchParams(window.location.search).get("page") ?? "1", 10);
}

/**
 * Update the page number in URL query parameters
 */
export function setPageUrl(page: number): void {
  const params = new URLSearchParams(window.location.search);
  params.set("page", String(page));
  window.history.pushState({}, "", `${window.location.pathname}?${params}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const COMPACT_COLUMN_SIZES: Record<string, number> = {
  select: 44,
  actions: 64,
  quick_view: 48,
};

/**
 * Columns that should stay at a fixed width instead of absorbing leftover table space.
 */
export function getCompactColumnSize(id: string): number | undefined {
  return COMPACT_COLUMN_SIZES[id];
}

export function isCompactTableColumn(id: string): boolean {
  return id in COMPACT_COLUMN_SIZES;
}

/**
 * Calculate default column size based on header text length
 */
export function getDefaultColumnSize(header: string | ReactNode, index: number, field?: string): number {
  if (field && COMPACT_COLUMN_SIZES[field] != null) return COMPACT_COLUMN_SIZES[field];
  const label = typeof header === "string" ? header : String(header ?? "");
  const base = Math.max(100, Math.min(220, label.length * 10));
  if (field && /email/i.test(field)) return Math.max(base, 180);
  if (field && /phone/i.test(field)) return Math.max(base, 120);
  return index === 0 ? Math.max(base, 160) : base;
}

export function getColumnWidthStyle(id: string, size: number): CSSProperties {
  const compact = getCompactColumnSize(id);
  const width = compact ?? size;
  return compact != null
    ? { width, minWidth: width, maxWidth: width }
    : { width, minWidth: width };
}
