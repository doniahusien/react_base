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

function isPlainObject(value: any): boolean {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/**
 * Some endpoints split the envelope: `pagination` holds the page counters while
 * `meta` holds extras like `statuses` or `categories`. Merging both keeps either
 * layout working, with the page counters winning on any overlapping key.
 */
const PAGINATION_KEYS = [
  "total",
  "current_page",
  "last_page",
  "per_page",
  "from",
  "to",
];

/**
 * A Laravel paginator inlines its counters next to the rows instead of nesting
 * them, so lift them out when they appear at the envelope root.
 */
function inlinePagination(obj: any): any {
  if (!isPlainObject(obj) || obj.current_page == null) return undefined;
  const out: Record<string, any> = {};
  for (const k of PAGINATION_KEYS) {
    if (obj[k] != null) out[k] = obj[k];
  }
  if (isPlainObject(obj.metadata)) Object.assign(out, obj.metadata);
  return out;
}

function mergeMeta(...candidates: any[]): any {
  const objects = candidates.filter(isPlainObject);
  if (objects.length === 0) return undefined;
  if (objects.length === 1) return objects[0];
  return Object.assign({}, ...objects);
}

export function normalizeResponse<T = any>(raw: any, key?: string): NormalizedList<T> {
  if (Array.isArray(raw)) return { data: raw };
  const inner = raw?.data ?? raw;
  const meta = mergeMeta(
    raw?.meta,
    isPlainObject(inner) ? inner.meta : undefined,
    raw?.pagination,
    isPlainObject(inner) ? inner.pagination : undefined,
    inlinePagination(raw),
    inlinePagination(inner)
  );

  if (key && inner?.[key] != null) {
    const nested = inner[key];
    if (Array.isArray(nested)) return { data: nested, meta };
    if (nested && typeof nested === "object" && Array.isArray(nested.data)) {
      return { data: nested.data, meta: mergeMeta(meta, nested.meta) };
    }
  }
  if (Array.isArray(inner?.data)) return { data: inner.data, meta };
  if (Array.isArray(inner?.items)) return { data: inner.items, meta };
  if (Array.isArray(inner)) return { data: inner, meta };
  if (Array.isArray(raw?.data) && meta) return { data: raw.data, meta };
  if (inner && typeof inner === "object") {
    for (const val of Object.values(inner)) {
      if (Array.isArray(val)) return { data: val as T[], meta };
      if (val && typeof val === "object" && Array.isArray((val as any).data)) {
        return {
          data: (val as any).data as T[],
          meta: mergeMeta(meta, (val as any).meta),
        };
      }
    }
  }
  return { data: [] };
}
