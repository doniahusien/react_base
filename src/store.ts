import { create } from "zustand";
import type { Locale } from "./i18n";
import i18n from "./i18n";

function getInitialLocale(): Locale {
  try { return (localStorage.getItem("locale") as Locale) || "en"; } catch { return "en"; }
}
function getInitialTheme(): "light" | "dark" {
  try { return (localStorage.getItem("theme") as "light" | "dark") || "light"; } catch { return "light"; }
}
function getInitialCollapsed(): boolean {
  try { return localStorage.getItem("sidebarCollapsed") === "1"; } catch { return false; }
}
function getInitialMode(): "vertical" | "horizontal" {
  try { return localStorage.getItem("sidebarMode") === "horizontal" ? "horizontal" : "vertical"; } catch { return "vertical"; }
}

function applyTheme(value: "light" | "dark") {
  if (value === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}
function applyDirection(value: Locale) {
  document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
}

interface AppStore {
  lang: Locale;
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  sidebarMode: "vertical" | "horizontal";
  sidebarOpen: boolean;
  setLang: (v: Locale) => void;
  setTheme: (v: "light" | "dark") => void;
  setSidebarCollapsed: (v: boolean) => void;
  setSidebarMode: (v: "vertical" | "horizontal") => void;
  setSidebarOpen: (v: boolean) => void;
}

const initialLang = getInitialLocale();
const initialTheme = getInitialTheme();
applyTheme(initialTheme);
applyDirection(initialLang);

export const useAppStore = create<AppStore>((set) => ({
  lang: initialLang,
  theme: initialTheme,
  sidebarCollapsed: getInitialCollapsed(),
  sidebarMode: getInitialMode(),
  sidebarOpen: false,

  setLang: (v) => {
    localStorage.setItem("locale", v);
    applyDirection(v);
    i18n.changeLanguage(v);
    set({ lang: v });
  },
  setTheme: (v) => {
    localStorage.setItem("theme", v);
    applyTheme(v);
    set({ theme: v });
  },
  setSidebarCollapsed: (v) => {
    localStorage.setItem("sidebarCollapsed", v ? "1" : "0");
    set({ sidebarCollapsed: v });
  },
  setSidebarMode: (v) => {
    localStorage.setItem("sidebarMode", v);
    set({ sidebarMode: v });
  },
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}));
