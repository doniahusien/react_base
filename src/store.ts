import { create } from "zustand";
import type { Locale } from "./i18n";
import i18n from "./i18n";
import { emitLanguageChange } from "./lib/languageChangeEvent";

export type SidebarMode = "vertical" | "horizontal" | "two-column";

function getInitialLocale(): Locale {
  try { return (localStorage.getItem("locale") as Locale) || "en"; } catch { return "en"; }
}
function getInitialTheme(): "light" | "dark" {
  try { return (localStorage.getItem("theme") as "light" | "dark") || "light"; } catch { return "light"; }
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
  sidebarCollapsed: boolean;
  sidebarMode: SidebarMode;
  sidebarOpen: boolean;
  activeNavGroupKey: string | null;
  customizerOpen: boolean;
  pinnedItems: string[];
  pinnedItemsV2: PinnedItem[];
  setLang: (v: Locale) => void;
  setTheme: (v: "light" | "dark") => void;
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
applyTheme(initialTheme);
applyDirection(initialLang);

export const useAppStore = create<AppStore>((set, get) => ({
  lang: initialLang,
  theme: initialTheme,
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
