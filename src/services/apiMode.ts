// ============================================================================
// Single switch between mock data and the real backend.
//
// The endpoints in backend-handover/page_builder_api.md are live, so the real
// API is the default. Set VITE_USE_MOCK_PAGE_BUILDER=true to fall back to the
// local mock data; no screen or component needs to change either way.
// ============================================================================

export const USE_MOCK_PAGE_BUILDER =
  (import.meta.env.VITE_USE_MOCK_PAGE_BUILDER ?? "false") === "true";

// VITE_BASE_URL already ends with /api/v1/admin, so admin resource paths are
// relative. Guest endpoints need the unprefixed base instead.
export const GUEST_BASE_URL = import.meta.env.VITE_BASE_URL_GENERAL ?? "";
