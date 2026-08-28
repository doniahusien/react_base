// ============================================================================
// Single switch between mock data and the real backend.
//
// While the backend is being built, leave this on. When the endpoints in
// backend-handover/page_builder_api.md are live, set
// VITE_USE_MOCK_PAGE_BUILDER=false in .env. No screen or component needs to
// change — only this flag.
// ============================================================================

export const USE_MOCK_PAGE_BUILDER =
  (import.meta.env.VITE_USE_MOCK_PAGE_BUILDER ?? "true") !== "false";

// VITE_BASE_URL already ends with /api/v1/admin, so admin resource paths are
// relative. Guest endpoints need the unprefixed base instead.
export const GUEST_BASE_URL = import.meta.env.VITE_BASE_URL_GENERAL ?? "";
