import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import { App } from "./app.tsx";
import { useAuthStore } from "./stores/auth";

// Refresh profile from API on every app start (non-blocking)
useAuthStore.getState().fetchProfile();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
