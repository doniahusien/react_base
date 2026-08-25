export interface NormalizedList<T> {
  data: T[];
  meta?: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    from?: number;
    to?: number;
    filters?: Record<string, Array<{ value: string; label: string }>>;
    available_statuses?: string[];
  };
}

export function normalizeResponse<T = any>(raw: any, key?: string): NormalizedList<T> {
  if (Array.isArray(raw)) return { data: raw };
  const inner = raw?.data ?? raw;
  const meta = (inner && !Array.isArray(inner) ? inner.meta ?? inner.pagination : undefined)
    ?? raw?.meta
    ?? raw?.pagination;

  if (key && inner?.[key] != null) {
    const nested = inner[key];
    if (Array.isArray(nested)) return { data: nested, meta };
    if (nested && typeof nested === "object" && Array.isArray(nested.data)) {
      return { data: nested.data, meta: nested.meta ?? meta };
    }
  }
  if (Array.isArray(inner?.data)) return { data: inner.data, meta: inner.meta ?? meta };
  if (Array.isArray(inner?.items)) return { data: inner.items, meta };
  if (Array.isArray(inner)) return { data: inner, meta };
  if (Array.isArray(raw?.data) && raw?.meta) return { data: raw.data, meta: raw.meta };
  if (inner && typeof inner === "object") {
    for (const val of Object.values(inner)) {
      if (Array.isArray(val)) return { data: val as T[], meta };
      if (val && typeof val === "object" && Array.isArray((val as any).data)) {
        return {
          data: (val as any).data as T[],
          meta: (val as any).meta ?? meta,
        };
      }
    }
  }
  return { data: [] };
}
