const ADMIN_API = (import.meta.env.VITE_BASE_URL as string) || "";

/** Resolve relative storage paths (e.g. `/storage/...`) to absolute URLs. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = ADMIN_API.replace(/\/api\/v1\/admin\/?$/i, "").replace(/\/$/, "");
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
