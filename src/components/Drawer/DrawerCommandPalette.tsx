import { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { NavItem } from "../../types/sidebar";
import { makeKeyHint } from "./utils";

interface DrawerCommandPaletteProps {
  isOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: NavItem[];
  goToItems: NavItem[];
  systemCommands: any[];
  preferences: any[];
  selectedIndex: number | null;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onClose: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function DrawerCommandPalette({
  isOpen,
  searchQuery,
  setSearchQuery,
  searchResults,
  goToItems,
  systemCommands,
  preferences,
  selectedIndex,
  setSelectedIndex,
  onClose,
  mobileOpen,
  onMobileClose,
}: DrawerCommandPaletteProps) {
  const { t } = useTranslation();
  const modalSearchRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | HTMLAnchorElement | null>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => modalSearchRef.current?.focus(), 0);
      setSelectedIndex(null);
    }
  }, [isOpen, setSelectedIndex]);

  const goToWithIdx = goToItems.map((it, i) => ({ ...it, idx: i }));
  const systemWithIdx = systemCommands.map((s, i) => ({ ...s, idx: goToWithIdx.length + i }));
  const prefsWithIdx = preferences.map((p, i) => ({
    ...p,
    idx: goToWithIdx.length + systemWithIdx.length + i,
  }));

  const displayedItems =
    searchQuery.trim() === ""
      ? [
          ...goToItems.map((it) => ({
            type: "page",
            label: it.label,
            subtitle: it.labelStr,
            icon: it.icon,
            href: it.href,
            action: undefined,
            keyHint: makeKeyHint(it.labelStr || it.label),
          })),
          ...systemCommands.map((s) => ({
            type: "system",
            label: s.label,
            subtitle: s.subtitle,
            icon: s.icon,
            href: undefined,
            action: s.action,
            keyHint: s.shortcut,
          })),
          ...preferences.map((p) => ({
            type: "pref",
            label: p.label,
            subtitle: p.subtitle,
            icon: p.icon,
            href: undefined,
            action: p.action,
            keyHint: p.shortcut,
          })),
        ]
      : searchResults.map((it) => ({
          type: "page",
          label: it.label,
          subtitle: it.labelStr,
          icon: it.icon,
          href: it.href,
          action: undefined,
          keyHint: makeKeyHint(it.labelStr || it.label),
        }));

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev: number | null) => {
          const next = prev === null ? 0 : Math.min(displayedItems.length - 1, prev + 1);
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev: number | null) => {
          const next =
            prev === null ? Math.max(0, displayedItems.length - 1) : Math.max(0, prev - 1);
          return next;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex !== null) {
          const sel = displayedItems[selectedIndex];
          if (!sel) return;
          if (sel.type === "page" && sel.href) {
            onClose();
            setSearchQuery("");
            navigate(sel.href);
          } else if ((sel.type === "system" || sel.type === "pref") && sel.action) {
            sel.action();
            onClose();
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, displayedItems, selectedIndex, navigate, onClose, setSearchQuery, setSelectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const el = itemRefs.current[selectedIndex];
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-6">
      <div
        className="absolute inset-0 bg-background-70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl bg-card border rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-4 h-4 text-foreground-50" />
            </span>
            <input
              ref={modalSearchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("SIDEBAR.SearchPlaceholder")}
              className="w-full rounded-md px-10 py-3 text-sm placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label={t("SIDEBAR.Search")}
            />
          </div>
        </div>
        <div className="max-h-80 overflow-auto">
          {searchQuery.trim() === "" ? (
            <div className="space-y-4 p-3">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-70">
                    {t("SIDEBAR.GoTo")}
                  </p>
                  <div className="mt-2 grid md:grid-cols-2 gap-1">
                    {goToWithIdx.map((item) => {
                      const idx = item.idx;
                      const selected = selectedIndex === idx;
                      const cls = `flex items-center gap-3 px-3 py-2 rounded-md ${
                        selected ? "bg-primary-soft" : "hover:bg-primary-soft"
                      }`;
                      return (
                        <Link
                          key={`goto-${item.href}-${idx}`}
                          to={item.href}
                          onClick={() => {
                            onClose();
                            if (mobileOpen) onMobileClose();
                          }}
                          ref={(el) => {
                            itemRefs.current[idx] = el;
                          }}
                          className={cls}
                        >
                          <item.icon className="w-4 h-4 text-foreground-70" />
                          <div className="truncate">
                            <div className="text-sm font-medium text-foreground truncate">
                              {item.label}
                            </div>
                            {item.labelStr && (
                              <div className="text-xs text-foreground-50 truncate">
                                {item.labelStr}
                              </div>
                            )}
                          </div>
                          <div className="ml-auto text-xs text-foreground-60 px-2">
                            {makeKeyHint(item.labelStr || item.label)}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-70">
                    {t("SIDEBAR.Preferences")}
                  </p>
                  <div className="mt-2 grid md:grid-cols-2 gap-1">
                    {prefsWithIdx.map((pref) => {
                      const idx = pref.idx;
                      const selected = selectedIndex === idx;
                      const cls = `w-full flex items-center gap-3 px-3 py-3 ${
                        selected ? "bg-primary-soft" : "hover:bg-primary-soft"
                      }`;
                      return (
                        <button
                          key={pref.id}
                          onClick={() => {
                            pref.action();
                            onClose();
                          }}
                          ref={(el) => {
                            itemRefs.current[idx] = el;
                          }}
                          className={cls}
                        >
                          <pref.icon className="w-4 h-4 text-foreground-70" />
                          <div className="truncate text-left">
                            <div className="text-sm font-medium text-foreground truncate">
                              {pref.label}
                            </div>
                            {pref.subtitle && (
                              <div className="text-xs text-foreground-50 truncate">
                                {pref.subtitle}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {searchResults.map((item, idx) => {
                const selected = selectedIndex === idx;
                const cls = `flex items-center gap-3 px-4 py-3 ${
                  selected ? "bg-primary-soft" : "hover:bg-primary-soft"
                }`;
                return (
                  <Link
                    key={`${item.href}-${idx}`}
                    to={item.href}
                    onClick={() => {
                      onClose();
                      setSearchQuery("");
                      if (mobileOpen) onMobileClose();
                    }}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    className={cls}
                  >
                    <span className="text-foreground-70">
                      <item.icon className="w-4 h-4" />
                    </span>
                    <div className="truncate">
                      <div className="text-sm font-medium text-foreground truncate">
                        {item.label}
                      </div>
                      {item.labelStr && (
                        <div className="text-xs text-foreground-50 truncate">{item.labelStr}</div>
                      )}
                    </div>
                    <div className="ml-auto text-xs text-foreground-60 px-2">
                      {makeKeyHint(item.labelStr || item.label)}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
