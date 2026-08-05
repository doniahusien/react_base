import type { ReactNode } from "react";

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

/**
 * Calculate default column size based on header text length
 */
export function getDefaultColumnSize(header: string | ReactNode, index: number): number {
  const label = typeof header === "string" ? header : String(header ?? "");
  const base = Math.max(120, Math.min(240, label.length * 10));
  return index === 0 ? Math.max(base, 60) : base;
}
