import { create } from "zustand";
import type { Locale } from "./i18n";
import i18n from "./i18n";
import { emitLanguageChange } from "./lib/languageChangeEvent";

export type SidebarMode = "vertical" | "horizontal" | "two-column";
export type ThemeIntent = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type FontFamily = "inter" | "system" | "changa";
export type BorderRadius = "none" | "sm" | "md" | "lg" | "xl";

function getInitialLocale(): Locale {
  try { return (localStorage.getItem("locale") as Locale) || "en"; } catch { return "en"; }
}
function getInitialTheme(): "light" | "dark" {
  try { return (localStorage.getItem("theme") as "light" | "dark") || "light"; } catch { return "light"; }
}
function getInitialThemeIntent(): ThemeIntent {
  try { 
    const stored = localStorage.getItem("theme-intent");
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored as ThemeIntent;
    }
    return "system";
  } catch { 
    return "system"; 
  }
}
function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function getInitialFontFamily(): FontFamily {
  try {
    const stored = localStorage.getItem("fontFamily");
    if (stored === "inter" || stored === "system" || stored === "changa") return stored;
    return "changa";
  } catch {
    return "changa";
  }
}
function getInitialBorderRadius(): BorderRadius {
  try {
    const stored = localStorage.getItem("borderRadius");
    if (stored === "none" || stored === "sm" || stored === "md" || stored === "lg" || stored === "xl") return stored;
    return "md";
  } catch {
    return "md";
  }
}
function getInitialCollapsed(): boolean {
  try { return localStorage.getItem("sidebarCollapsed") === "1"; } catch { return false; }
}
function getInitialMode(): SidebarMode {
  try {
    const stored = localStorage.getItem("sidebarMode");
    if (stored === "horizontal" || stored === "two-column" || stored === "vertical") return stored;
    return "vertical";
  } catch {
    return "vertical";
  }
}
function getInitialPinnedItems(): string[] {
  try {
    const stored = localStorage.getItem("pinnedItems");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}
function getInitialPinnedItemsV2(): PinnedItem[] {
  try {
    const stored = localStorage.getItem("pinnedItemsV2");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function applyTheme(value: "light" | "dark") {
  if (value === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}
function applyDirection(value: Locale) {
  document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
}
function resolveThemeIntent(intent: ThemeIntent, systemPref: ResolvedTheme): ResolvedTheme {
  return intent === "system" ? systemPref : intent;
}

function applyFontFamily(value: FontFamily) {
  const fontMap: Record<FontFamily, string> = {
    inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
    system: 'ui-sans-serif, system-ui, sans-serif',
    changa: '"Changa", Arial, sans-serif'
  };
  document.documentElement.style.setProperty('--font-sans', fontMap[value]);
}

function applyBorderRadius(value: BorderRadius) {
  const radiusMap: Record<BorderRadius, { sm: string; md: string; lg: string; xl: string }> = {
    none: { sm: '0', md: '0', lg: '0', xl: '0' },
    sm: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem' },
    md: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' },
    lg: { sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.25rem' },
    xl: { sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2rem' }
  };
  const radii = radiusMap[value];
  document.documentElement.style.setProperty('--radius-sm', radii.sm);
  document.documentElement.style.setProperty('--radius-md', radii.md);
  document.documentElement.style.setProperty('--radius-lg', radii.lg);
  document.documentElement.style.setProperty('--radius-xl', radii.xl);
}

interface PinnedItem {
  id: string;
  type: "item" | "group";
  href?: string;
  groupKey?: string;
}

export type { PinnedItem };

interface AppStore {
  lang: Locale;
  theme: "light" | "dark";
  themeIntent: ThemeIntent;
  systemPreference: ResolvedTheme;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  sidebarCollapsed: boolean;
  sidebarMode: SidebarMode;
  sidebarOpen: boolean;
  activeNavGroupKey: string | null;
  customizerOpen: boolean;
  pinnedItems: string[];
  pinnedItemsV2: PinnedItem[];
  setLang: (v: Locale) => void;
  setTheme: (v: "light" | "dark") => void;
  setThemeIntent: (v: ThemeIntent) => void;
  setSystemPreference: (v: ResolvedTheme) => void;
  setFontFamily: (v: FontFamily) => void;
  setBorderRadius: (v: BorderRadius) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setSidebarMode: (v: SidebarMode) => void;
  setSidebarOpen: (v: boolean) => void;
  setActiveNavGroupKey: (v: string | null) => void;
  setCustomizerOpen: (v: boolean) => void;
  togglePinItem: (href: string) => void;
  togglePinGroup: (groupKey: string, groupItems: any[]) => void;
  reorderPinnedItems: (newOrder: PinnedItem[]) => void;
}

const initialLang = getInitialLocale();
const initialTheme = getInitialTheme();
const initialFontFamily = getInitialFontFamily();
const initialBorderRadius = getInitialBorderRadius();
applyTheme(initialTheme);
applyDirection(initialLang);
applyFontFamily(initialFontFamily);
applyBorderRadius(initialBorderRadius);

export const useAppStore = create<AppStore>((set, get) => ({
  lang: initialLang,
  theme: initialTheme,
  themeIntent: getInitialThemeIntent(),
  systemPreference: getSystemPreference(),
  fontFamily: initialFontFamily,
  borderRadius: initialBorderRadius,
  sidebarCollapsed: getInitialCollapsed(),
  sidebarMode: getInitialMode(),
  sidebarOpen: false,
  activeNavGroupKey: null,
  customizerOpen: false,
  pinnedItems: getInitialPinnedItems(),
  pinnedItemsV2: getInitialPinnedItemsV2(),

  setLang: (v) => {
    localStorage.setItem("locale", v);
    applyDirection(v);
    i18n.changeLanguage(v);
    set({ lang: v });
    // Emit global language change event
    emitLanguageChange(v);
  },
  setTheme: (v) => {
    localStorage.setItem("theme", v);
    applyTheme(v);
    set({ theme: v });
  },
  setThemeIntent: (v) => {
    localStorage.setItem("theme-intent", v);
    set({ themeIntent: v });
  },
  setSystemPreference: (v) => {
    set({ systemPreference: v });
  },
  setFontFamily: (v) => {
    localStorage.setItem("fontFamily", v);
    applyFontFamily(v);
    set({ fontFamily: v });
  },
  setBorderRadius: (v) => {
    localStorage.setItem("borderRadius", v);
    applyBorderRadius(v);
    set({ borderRadius: v });
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
  setActiveNavGroupKey: (v) => set({ activeNavGroupKey: v }),
  setCustomizerOpen: (v) => set({ customizerOpen: v }),
  togglePinItem: (href) => {
    const current = get().pinnedItemsV2;
    const itemId = `item-${href}`;
    const exists = current.find(p => p.id === itemId);

    const newPinned: PinnedItem[] = exists
      ? current.filter(p => p.id !== itemId)
      : [...current, { id: itemId, type: "item", href }];

    localStorage.setItem("pinnedItemsV2", JSON.stringify(newPinned));
    set({ pinnedItemsV2: newPinned });
  },
  togglePinGroup: (groupKey, groupItems) => {
    const current = get().pinnedItemsV2;
    const groupItemHrefs = groupItems.map(item => item.href);
    const hasAnyPinned = current.some(p => p.type === "item" && p.href && groupItemHrefs.includes(p.href));

    let newPinned: PinnedItem[];
    if (hasAnyPinned) {
      newPinned = current.filter(p => !(p.type === "item" && p.href && groupItemHrefs.includes(p.href)));
    } else {
      const itemsToPinned = groupItems.map(item => ({
        id: `item-${item.href}`,
        type: "item" as const,
        href: item.href
      }));

      const uniqueItems = itemsToPinned.filter(newItem =>
        !current.some(p => p.id === newItem.id)
      );

      newPinned = [...current, ...uniqueItems];
    }

    localStorage.setItem("pinnedItemsV2", JSON.stringify(newPinned));
    set({ pinnedItemsV2: newPinned });
  },
  reorderPinnedItems: (newOrder) => {
    localStorage.setItem("pinnedItemsV2", JSON.stringify(newOrder));
    set({ pinnedItemsV2: newOrder });
  },
}));
