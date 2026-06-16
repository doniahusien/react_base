export interface NormalizedList<T> {
  data: T[];
  meta?: {
    total: number; current_page: number; last_page: number;
    per_page: number; from?: number; to?: number;
  };
}

export function normalizeResponse<T = any>(raw: any, key?: string): NormalizedList<T> {
  if (Array.isArray(raw)) return { data: raw };
  const inner = raw?.data ?? raw;
  if (key && Array.isArray(inner?.[key])) return { data: inner[key], meta: inner.meta };
  if (Array.isArray(inner?.data)) return { data: inner.data, meta: inner.meta };
  if (Array.isArray(inner)) return { data: inner };
  if (inner && typeof inner === "object") {
    for (const val of Object.values(inner)) {
      if (Array.isArray(val)) return { data: val as T[], meta: (inner as any).meta };
    }
  }
  return { data: [] };
}
