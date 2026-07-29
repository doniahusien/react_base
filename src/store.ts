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
  sidebarMode: "vertical" | "horizontal";
  sidebarOpen: boolean;
  pinnedItems: string[];
  pinnedItemsV2: PinnedItem[];
  setLang: (v: Locale) => void;
  setTheme: (v: "light" | "dark") => void;
  setSidebarCollapsed: (v: boolean) => void;
  setSidebarMode: (v: "vertical" | "horizontal") => void;
  setSidebarOpen: (v: boolean) => void;
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
  pinnedItems: getInitialPinnedItems(),
  pinnedItemsV2: getInitialPinnedItemsV2(),

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
  togglePinItem: (href) => {
    const current = get().pinnedItemsV2;
    const itemId = `item-${href}`;
    const exists = current.find(p => p.id === itemId);
    
    const newPinned = exists
      ? current.filter(p => p.id !== itemId)
      : [...current, { id: itemId, type: "item", href }];
    
    localStorage.setItem("pinnedItemsV2", JSON.stringify(newPinned));
    set({ pinnedItemsV2: newPinned });
  },
  togglePinGroup: (groupKey, groupItems) => {
    const current = get().pinnedItemsV2;
    // Check if any item from this group is pinned
    const groupItemHrefs = groupItems.map(item => item.href);
    const hasAnyPinned = current.some(p => p.type === "item" && p.href && groupItemHrefs.includes(p.href));
    
    let newPinned;
    if (hasAnyPinned) {
      // Unpin all items from this group
      newPinned = current.filter(p => !(p.type === "item" && p.href && groupItemHrefs.includes(p.href)));
    } else {
      // Pin all items from this group (without duplicates)
      const itemsToPinned = groupItems.map(item => ({
        id: `item-${item.href}`,
        type: "item" as const,
        href: item.href
      }));
      
      // Filter out items that are already pinned
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
