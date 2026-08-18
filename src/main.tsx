import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import { App } from "./app.tsx";
import { useAuthStore } from "./stores/auth";
import { applyBrandTheme } from "./theme-presets";

// Apply saved brand theme on app start
try {
  const savedTheme = localStorage.getItem('selected-brand-theme');
  const theme = !savedTheme || savedTheme === 'purple' ? 'elwaseet' : savedTheme;
  applyBrandTheme(theme);
  if (savedTheme === 'purple') {
    localStorage.setItem('selected-brand-theme', 'elwaseet');
  }
} catch {
  // Fail silently if localStorage is not available
}

// Refresh profile from API on every app start (non-blocking)
useAuthStore.getState().fetchProfile();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
