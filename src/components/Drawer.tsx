import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { 
  ChartBarIcon, 
  UsersIcon, 
  GlobeAltIcon, 
  BookOpenIcon, 
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  BellIcon,
  BoltIcon,
  MoonIcon,
  LanguageIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import {
  ChartBarIcon as ChartBarIconSolid,
  UsersIcon as UsersIconSolid,
  GlobeAltIcon as GlobeAltIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  MapPinIcon as MapPinIconSolid
} from "@heroicons/react/24/solid";
import { Bars3Icon as GripVertical } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppStore } from "../store";
import { useAuthStore } from "../stores/auth";
import type { NavGroup, NavItem } from "../types/sidebar";
import type { PinnedItem } from "../store";
import { Tooltip } from "./Tooltip";

function isItemActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.endsWith(href);
}

// Sortable wrapper for pinned items
function SortablePinnedItem({ 
  id, 
  children, 
  disabled 
}: { 
  id: string; 
  children: React.ReactNode; 
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id, 
    disabled 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      {!disabled && (
        <div className="-left-5 absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10" {...listeners}>
          <GripVertical className="w-3.5 h-3.5 text-foreground-30" />
        </div>
      )}
      {children}
    </div>
  );
}

export function Drawer() {
  const { t, i18n } = useTranslation();
  const { lang, sidebarCollapsed, sidebarMode, sidebarOpen, setSidebarOpen, clearAuth, pinnedItemsV2, togglePinItem, togglePinGroup, reorderPinnedItems, activeNavGroupKey, setActiveNavGroupKey } = {
    ...useAppStore(), clearAuth: useAuthStore((s) => s.clearAuth),
  };
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const modalSearchRef = useRef<HTMLInputElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | HTMLAnchorElement | null>>([]);
  const navigate = useNavigate();
  const [chordBuffer, setChordBuffer] = useState("");
  const chordTimer = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
        return;
      }
      if (e.key === "Escape") {
        if (searchModalOpen) {
          setSearchModalOpen(false);
        } else {
          setSearchQuery("");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchModalOpen]);



  useEffect(() => {
    if (searchModalOpen) {
      console.debug("Search modal opened");
      // focus modal input on open
      setTimeout(() => modalSearchRef.current?.focus(), 0);
      setSelectedIndex(null);
    }
  }, [searchModalOpen]);

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const shortcutLabel = isMac ? "⌘K" : "Ctrl+K";

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pinnedItemsV2.findIndex((item) => item.id === active.id);
      const newIndex = pinnedItemsV2.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(pinnedItemsV2, oldIndex, newIndex);
      reorderPinnedItems(newOrder);
    }
  };

  const groups: NavGroup[] = [
    { groupKey: "groupMain", groupLabelStr: "Main", items: [{ href: "/", label: t("SIDEBAR.Dashboard"), labelStr: "Dashboard", icon: ChartBarIcon }] },
    {
      groupKey: "groupManagement", groupLabelStr: "Management",
      items: [
        { href: "/users", label: t("SIDEBAR.Users"), labelStr: "Users", icon: UsersIcon, children: [{ href: "/users", label: t("TITLES.viewAll"), labelStr: "Users", icon: UsersIcon }, { href: "/users/form", label: t("TITLES.add", { count: t("TITLES.user") as any }), labelStr: "Add User", icon: PlusCircleIcon }] },
        { href: "/categories", label: t("SIDEBAR.Categories"), labelStr: "Categories", icon: BookOpenIcon, children: [{ href: "/categories", label: t("TITLES.viewAll"), labelStr: "Category", icon: BookOpenIcon }, { href: "/categories/form", label: t("TITLES.add", { count: t("TITLES.category") as any }), labelStr: "Add Category", icon: PlusCircleIcon }] },
      ],
    },
    { groupKey: "groupPlaces", groupLabelStr: "Places", items: [{ href: "/countries", label: t("SIDEBAR.Countries"), labelStr: "Countries", icon: GlobeAltIcon }, { href: "/cities", label: t("SIDEBAR.Cities"), labelStr: "Cities", icon: GlobeAltIcon }] },
  ];

  const collapsed = sidebarCollapsed;
  const mode = sidebarMode;
  const locale = lang;
  const isHorizontal = mode === "horizontal";
  const isTwoColumn = mode === "two-column";
  const mobileOpen = sidebarOpen;

  const groupIcon = (groupKey: string) => {
    if (groupKey === "groupManagement") return UsersIcon;
    if (groupKey === "groupPlaces") return GlobeAltIcon;
    return ChartBarIcon;
  };

  const findGroupKeyForPath = (path: string) => {
    for (const g of groups) {
      for (const item of g.items) {
        if (isItemActive(item.href, path)) return g.groupKey;
        for (const child of item.children ?? []) {
          if (isItemActive(child.href, path)) return g.groupKey;
        }
      }
    }
    return groups[0]?.groupKey ?? null;
  };

  useEffect(() => {
    if (!isTwoColumn) return;
    const matched = findGroupKeyForPath(pathname);
    if (matched && matched !== activeNavGroupKey) {
      setActiveNavGroupKey(matched);
    } else if (!activeNavGroupKey && groups[0]) {
      setActiveNavGroupKey(groups[0].groupKey);
    }
  }, [pathname, isTwoColumn]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeGroup =
    groups.find((g) => g.groupKey === activeNavGroupKey) ?? groups[0] ?? null;

  // flattened list for search/modal (include children)
  const allItemsFlat: NavItem[] = groups.flatMap(g => g.items.flatMap(item => [item, ...(item.children ?? [])]));
  const searchResults: NavItem[] = searchQuery.trim() === "" ? [] : allItemsFlat.filter(i => ((i.labelStr || i.label || "").toLowerCase().includes(searchQuery.toLowerCase())));

  // default command sections when search is empty
  const goToItems = groups.flatMap(g => g.items);
  const systemCommands = [
    { id: "lock", label: t("SIDEBAR.LockTerminal"), subtitle: t("SIDEBAR.LockTerminalDesc"), icon: LockClosedIcon, shortcut: isMac ? "⌘L" : "Ctrl+L", action: () => console.log("Lock") },
    { id: "settings", label: t("SIDEBAR.TerminalSettings"), subtitle: t("SIDEBAR.TerminalSettingsDesc"), icon: Cog6ToothIcon, shortcut: isMac ? "⌘," : "Ctrl+,", action: () => console.log("Settings") },
    { id: "notifications", label: t("SIDEBAR.Notifications"), subtitle: t("SIDEBAR.NotificationsDesc"), icon: BellIcon, shortcut: "", action: () => console.log("Notifications") },
    { id: "sidekick", label: t("SIDEBAR.SidekickAI"), subtitle: t("SIDEBAR.SidekickAIDesc"), icon: BoltIcon, shortcut: isMac ? "⌘." : "Ctrl+.", action: () => console.log("Sidekick") },
  ];
  const preferences = [
    { id: "dark", label: t("SIDEBAR.ToggleDarkMode"), subtitle: t("SIDEBAR.ToggleDarkModeDesc"), icon: MoonIcon, shortcut: "", action: () => document.documentElement.classList.toggle("dark") },
    { id: "lang", label: t("SIDEBAR.ChangeLanguage"), subtitle: t("SIDEBAR.ChangeLanguageDesc"), icon: LanguageIcon, shortcut: "", action: () => i18n.changeLanguage(i18n.language === "en" ? "ar" : "en") },
  ];

  const goToWithIdx = goToItems.map((it, i) => ({ ...it, idx: i }));
  const systemWithIdx = systemCommands.map((s, i) => ({ ...s, idx: goToWithIdx.length + i }));
  const prefsWithIdx = preferences.map((p, i) => ({ ...p, idx: goToWithIdx.length + systemWithIdx.length + i }));

  const makeKeyHint = (label?: string) => {
    if (!label) return "";
    const words = label.split(/\s+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return label.slice(0,2).toUpperCase();
  };

  // build displayed items list for keyboard navigation
  const displayedItems = searchQuery.trim() === "" ? [
    ...goToItems.map(it => ({ type: 'page', label: it.label, subtitle: it.labelStr, icon: it.icon, href: it.href, keyHint: makeKeyHint(it.labelStr || it.label) })),
    ...systemCommands.map(s => ({ type: 'system', label: s.label, subtitle: s.subtitle, icon: s.icon, action: s.action, keyHint: s.shortcut })),
    ...preferences.map(p => ({ type: 'pref', label: p.label, subtitle: p.subtitle, icon: p.icon, action: p.action, keyHint: p.shortcut })),
  ] : searchResults.map(it => ({ type: 'page', label: it.label, subtitle: it.labelStr, icon: it.icon, href: it.href, keyHint: makeKeyHint(it.labelStr || it.label) }));

  useEffect(() => {
    if (!searchModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev === null ? 0 : Math.min(displayedItems.length - 1, prev + 1);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev === null ? Math.max(0, displayedItems.length - 1) : Math.max(0, prev - 1);
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex !== null) {
          const sel = displayedItems[selectedIndex];
          if (!sel) return;
          if (sel.type === 'page' && sel.href) {
            setSearchModalOpen(false);
            setSearchQuery("");
            navigate(sel.href);
          } else if ((sel.type === 'system' || sel.type === 'pref') && sel.action) {
            sel.action();
            setSearchModalOpen(false);
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchModalOpen, displayedItems, selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const el = itemRefs.current[selectedIndex];
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  // global Ctrl/Cmd + two-letter chord handler
  useEffect(() => {
    const keyMap = new Map<string, any>();
    const allCandidates = [
      ...goToItems.map(it => ({ type: 'page', href: it.href, action: undefined, key: makeKeyHint(it.labelStr || it.label), label: it.label })),
      ...systemCommands.map(s => ({ type: 'system', href: undefined, action: s.action, key: makeKeyHint(s.label), label: s.label })),
      ...preferences.map(p => ({ type: 'pref', href: undefined, action: p.action, key: makeKeyHint(p.label), label: p.label })),
    ];
    for (const c of allCandidates) if (c.key) keyMap.set(c.key.toUpperCase(), c);

    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      // keep Ctrl/Cmd+K behavior
      if (e.key.toLowerCase() === 'k') return;
      // only letters
      const ch = e.key.length === 1 && /[a-z]/i.test(e.key) ? e.key.toUpperCase() : null;
      if (!ch) return;
      e.preventDefault();
      // append to buffer
      setChordBuffer(prev => {
        const next = (prev + ch).slice(-2).toUpperCase();
        // clear any existing timer
        if (chordTimer.current) window.clearTimeout(chordTimer.current);
        // check for match
        const match = keyMap.get(next);
        if (match) {
          // defer navigation/action to avoid updating router during render
          if (match.type === 'page' && match.href) {
            setTimeout(() => navigate(match.href), 0);
          } else if (match.action) {
            setTimeout(() => { try { match.action(); } catch (err) { console.error(err); } }, 0);
          }
          // reset buffer
          chordTimer.current = null;
          return "";
        }
        // set timer to clear buffer
        chordTimer.current = window.setTimeout(() => setChordBuffer(""), 800);
        return next;
      });
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (chordTimer.current) window.clearTimeout(chordTimer.current);
    };
  }, [goToItems, systemCommands, preferences, navigate]);

  // Horizontal layout renders below with mobile drawer shared.

  const renderItem = (link: NavItem, i: number, isChild = false, isMobileDrawer = false, showPin = false, inPinnedSection = false) => {
    const active = isItemActive(link.href, pathname);
    const hasChildren = (link.children?.length ?? 0) > 0;
    const subOpen = openSubMenu === link.href;
    const showLabel = isMobileDrawer || !collapsed;
    const itemId = `item-${link.href}`;
    const isPinned = pinnedItemsV2.some(p => p.id === itemId);

    const sharedClassName = `drawer-nav-item group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer ${isChild ? showLabel ? "gap-2.5 ms-9 px-3 py-2" : "justify-center py-2.5 mx-0.5" : showLabel ? "gap-3 px-3 py-2.5" : "justify-center py-3 mx-0.5"} ${active ? "drawer-nav-active" : "drawer-nav-idle"}`;

    const innerContent = (
      <>
        {active && showLabel && !isChild && <span className="drawer-active-pill" />}
        <span className={`relative shrink-0 flex items-center justify-center transition-all duration-200 ${!showLabel ? "size-9 rounded-xl" : ""} ${active ? !showLabel ? "drawer-icon-badge-active" : "drawer-icon-active" : !showLabel ? "drawer-icon-badge-idle" : "drawer-icon-idle"}`}>
          <link.icon className={isChild ? "w-3.5 h-3.5" : "w-4 h-4"} />
          {active && !showLabel && <span className="drawer-active-pulse" />}
        </span>
        {showLabel && (<><span className={`flex-1 truncate font-medium ${isChild ? "text-xs" : "text-sm"}`}>{link.label}</span>
        {showPin && !isChild && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePinItem(link.href);
            }}
            className={`shrink-0 p-1 rounded-md hover:bg-primary/10 transition-all duration-200 ${inPinnedSection ? "opacity-60 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            title={isPinned ? "Unpin" : "Pin"}
          >
              {isPinned ? <MapPinIconSolid className="w-3 h-3 text-primary" /> : <MapPinIcon className="w-3 h-3 text-foreground-40" />}
          </button>
        )}
        {hasChildren ? <ChevronDownIcon className={`w-3 h-3 shrink-0 transition-transform duration-200 opacity-40 ${subOpen ? "rotate-180" : ""}`} /> : !showPin && !inPinnedSection && !isChild && <ChevronRightIcon className={`w-3 h-3 shrink-0 transition-all duration-200 ${active ? "opacity-40" : "opacity-0 group-hover:opacity-25"}`} />}</>)}
      </>
    );

    const content = hasChildren ? (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpenSubMenu(subOpen ? null : link.href)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpenSubMenu(subOpen ? null : link.href); }}
        className={sharedClassName}
      >
        {innerContent}
      </div>
    ) : (
      <Link
        to={link.href}
        onClick={() => { if (isMobileDrawer) setSidebarOpen(false); }}
        className={sharedClassName}
      >
        {innerContent}
      </Link>
    );

    // Wrap with Tooltip when collapsed
    // Convert ReactNode to string for tooltip
    const tooltipContent = String(link.label);
    const contentWithTooltip = !showLabel && !isChild ? (
      <Tooltip content={tooltipContent} disabled={isMobileDrawer}>
        {content}
      </Tooltip>
    ) : content;

    const wrapper = (
      <div key={link.href} className="relative">
        {contentWithTooltip}
        {hasChildren && showLabel && subOpen && <div className="mt-0.5 space-y-0.5 overflow-hidden">{link.children!.map((child: NavItem, ci: number) => renderItem(child, ci, true, isMobileDrawer, showPin, inPinnedSection))}</div>}
      </div>
    );

    if (inPinnedSection && showLabel && !hasChildren) {
      return (
        <SortablePinnedItem key={itemId} id={itemId} disabled={collapsed}>
          {wrapper}
        </SortablePinnedItem>
      );
    }

    return wrapper;
  };

  const renderGroup = (group: NavGroup, gi: number, isMobileDrawer = false, showPin = false) => {
    const showLabel = isMobileDrawer || !collapsed;
    
    // Filter out pinned items from this group
    const pinnedHrefs = new Set(pinnedItemsV2.filter(p => p.type === "item" && p.href).map(p => p.href));
    const visibleItems = group.items.filter(item => !pinnedHrefs.has(item.href));
    
    // If all items are pinned and group is empty, don't render it
    if (visibleItems.length === 0) return null;
    
    // Check if all visible items from this group are pinned
    const groupItemHrefs = group.items.map(item => item.href);
    const allPinned = groupItemHrefs.every(href => pinnedItemsV2.some(p => p.id === `item-${href}`));
    const somePinned = groupItemHrefs.some(href => pinnedItemsV2.some(p => p.id === `item-${href}`));

    return (
      <div key={group.groupKey} className={gi > 0 ? "mt-3" : ""}>
        <div className="flex items-center justify-between group">
          {showLabel && <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]  select-none">{t(`SIDEBAR.${group.groupKey}`)}</p>}
          {showPin && showLabel && (
            <button
              onClick={() => togglePinGroup(group.groupKey, group.items)}
              className="shrink-0 p-1 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 mr-2"
              title={allPinned ? "Unpin All" : "Pin All"}
            >
              {allPinned ? <MapPinIconSolid className="w-3 h-3 text-primary" /> : somePinned ? <MapPinIconSolid className="w-3 h-3 text-primary/60" /> : <MapPinIcon className="w-3 h-3 text-foreground-40" />}
            </button>
          )}
        </div>
        {!showLabel && gi > 0 && <div className="mx-2 drawer-divider h-px my-2" />}
        <div className="space-y-0.5">{visibleItems.map((item, ii) => renderItem(item, ii, false, isMobileDrawer, showPin, false))}</div>
      </div>
    );
  };

  const sidebarContent = (isMobileDrawer = false) => {
    const showLabel = isMobileDrawer || !collapsed;
    
    // Get all items for pinned lookup
    const allItems = groups.flatMap(g => g.items);

    // searchResults computed at component scope

    // Build pinned items list (only items, no groups)
    const pinnedNavItems = pinnedItemsV2
      .filter(p => p.type === "item" && p.href)
      .map(p => allItems.find(item => item.href === p.href))
      .filter(Boolean) as NavItem[];
    
    return (
      <>
        <div className="drawer-orb drawer-orb-top" aria-hidden="true" />
        <div className="drawer-orb drawer-orb-bottom" aria-hidden="true" />
        <div className="drawer-noise" aria-hidden="true" />
        <div
          className={`relative z-10 flex px-2 py-3 ${
            !isMobileDrawer && collapsed
              ? "flex-col items-center gap-2"
              : "flex-row items-center gap-3 px-3.5 py-4"
          }`}
        >
          <div className="drawer-logo-badge shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" fillOpacity=".95" />
            </svg>
          </div>
          {(isMobileDrawer || !collapsed) && (
            <div className="min-w-0 flex-1 overflow-hidden leading-tight">
              <span className="truncate text-sm font-bold tracking-wide text-foreground">
                {t("SIDEBAR.Dashboard")}
              </span>
            </div>
          )}
          {!showLabel && (
            <Tooltip content={`${t("SIDEBAR.Search")} (${shortcutLabel})`}>
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="relative flex size-9 shrink-0 items-center justify-center rounded-xl hover:bg-primary-soft"
                aria-label={t("SIDEBAR.Search")}
              >
                <MagnifyingGlassIcon className="w-4 h-4 text-foreground-70" />
              </button>
            </Tooltip>
          )}
        </div>
        <div className="mx-3.5 drawer-divider h-px mb-2" />

        {/* Search area */}
        {showLabel && (
          <div className="px-3.5 mb-2">
            <div className="relative">
              <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none"><MagnifyingGlassIcon className="w-3.5 h-3.5 text-foreground-50" /></span>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("SIDEBAR.SearchPlaceholder", { defaultValue: "Search " })}
                className="w-full rounded-md px-9 py-2 text-sm focus:outline-none ring-2 ring-primary/30"
                aria-label={t("SIDEBAR.Search")}
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="absolute inset-y-0 end-3 flex items-center px-2 rounded-md text-[11px] text-foreground-60 hover:text-foreground transition-colors"
                aria-hidden="true"
              >
                <span className=" px-2 py-0.5 rounded-md">{shortcutLabel}</span>
              </button>
            </div>
            {searchQuery && searchResults.length === 0 && <p className="text-xs text-foreground-50 mt-2">{t("SIDEBAR.SearchNoResults")}</p>}
          </div>
        )}

        <nav className="relative z-10 flex-1 px-2 pt-1 overflow-y-auto overflow-x-hidden drawer-nav-scroll">
          {/* If searching, show filtered results */}
          {searchQuery.trim() !== "" ? (
            <div className="px-2">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-70 select-none">{t("SIDEBAR.Results")}</p>
              <div className="space-y-1 mt-2">
                {searchResults.map((item, idx) => (
                  <div key={`${item.href}-${idx}`}>
                    {renderItem(item, idx, false, isMobileDrawer, false, false)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* PINNED SECTION */}
              {pinnedNavItems.length > 0 && (
                <div className="mb-3">
                  {showLabel && <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-70 select-none">{t("SIDEBAR.Pinned")}</p>}
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={pinnedItemsV2.map(p => p.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-0.5">
                        {pinnedNavItems.map((item, idx) => renderItem(item, idx, false, isMobileDrawer, true, true))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {showLabel && <div className="mx-2 drawer-divider h-px my-3" />}
                  {!showLabel && <div className="mx-2 drawer-divider h-px my-2" />}
                </div>
              )}

              {/* REGULAR GROUPS */}
              {groups.map((group, gi) => renderGroup(group, gi, isMobileDrawer, true))}
            </>
          )}
        </nav>
        <div className="relative z-10 p-3 shrink-0">
          <div className="drawer-divider h-px mb-3" />
          {showLabel && user && <a href="/profile" onClick={() => { if (isMobileDrawer) setSidebarOpen(false); }} className="drawer-user-card flex items-center gap-2.5 px-2.5 py-2 mb-2 rounded-xl transition-all duration-200">
            {user.image ? <img src={user.image} alt={user.name} className="size-8 rounded-full object-cover ring-2 ring-primary/25 shrink-0" /> : <div className="size-8 rounded-full drawer-avatar shrink-0 flex items-center justify-center text-xs font-bold text-primary">{(user.name ?? user.full_name ?? "?")[0].toUpperCase()}</div>}
            <div className="flex-1 overflow-hidden leading-tight min-w-0"><p className="text-xs font-semibold text-foreground-80 truncate">{user.name ?? user.full_name}</p><p className="text-[10px] text-foreground-50 truncate">{user.email ?? "Admin"}</p></div>
            <ChevronRightIcon className="w-3 h-3 text-foreground-20 shrink-0" />
          </a>}
          {!isMobileDrawer && collapsed && user && <Tooltip content={user.name ?? user.full_name ?? "Profile"}><a href="/profile" className="flex justify-center mb-2">{user.image ? <img src={user.image} alt={user.name} className="size-8 rounded-full object-cover ring-2 ring-primary/25" /> : <div className="size-8 rounded-full drawer-avatar flex items-center justify-center text-xs font-bold text-primary">{(user.name ?? user.full_name ?? "?")[0].toUpperCase()}</div>}</a></Tooltip>}
          {!showLabel ? (
            <Tooltip content={t("SIDEBAR.Logout")} disabled={isMobileDrawer}>
              <button onClick={clearAuth} className={`drawer-logout group flex items-center justify-center gap-2.5 w-full rounded-xl px-3 py-2.5 transition-all duration-200`}>
                <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
              </button>
            </Tooltip>
          ) : (
            <button onClick={clearAuth} className={`drawer-logout group flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 transition-all duration-200`}>
              <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
              <span className="text-sm font-medium">{t("SIDEBAR.Logout")}</span>
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "text-right" : "text-left"}>
      {isHorizontal && (
        <div className="fixed inset-x-0 top-0 z-50 hidden h-14 lg:block">
          <div className="flex h-full items-center gap-5 px-5">
            <div className="flex shrink-0 items-center gap-2.5">
              <div className="drawer-logo-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" fillOpacity=".95" />
                </svg>
              </div>
            </div>
            <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto">
              {groups.flatMap((g) => g.items).map((link) => {
                const active = isItemActive(link.href, pathname);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "drawer-nav-active"
                        : "text-foreground-70 hover:bg-primary-soft hover:text-foreground"
                    }`}
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {!isHorizontal && isTwoColumn && (
        <div className="drawer-shell fixed inset-y-0 start-0 z-50 hidden w-[18.5rem] overflow-hidden lg:flex">
          <div className="flex w-[4.5rem] shrink-0 flex-col border-e border-border/60">
            <div className="flex justify-center px-2 py-4">
              <div className="drawer-logo-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" fillOpacity=".95" />
                </svg>
              </div>
            </div>
            <div className="mx-2.5 mb-2 h-px drawer-divider" />
            <nav className="drawer-nav-scroll flex flex-1 flex-col items-center gap-1 overflow-y-auto px-1.5">
              {groups.map((group) => {
                const Icon = groupIcon(group.groupKey);
                const selected = activeGroup?.groupKey === group.groupKey;
                return (
                  <Tooltip
                    key={group.groupKey}
                    content={t(`SIDEBAR.${group.groupKey}`, { defaultValue: group.groupLabelStr })}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveNavGroupKey(group.groupKey)}
                      className={`relative flex size-10 items-center justify-center rounded-xl transition-all ${
                        selected
                          ? "drawer-icon-badge-active drawer-nav-active"
                          : "drawer-icon-badge-idle drawer-nav-idle"
                      }`}
                      aria-label={group.groupLabelStr}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {selected && <span className="drawer-active-pulse" />}
                    </button>
                  </Tooltip>
                );
              })}
            </nav>
            <div className="shrink-0 p-2">
              <div className="mb-2 h-px drawer-divider" />
              {user && (
                <Tooltip content={user.name ?? user.full_name ?? "Profile"}>
                  <a href="/profile" className="mb-2 flex justify-center">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="size-8 rounded-full object-cover ring-2 ring-primary/25"
                      />
                    ) : (
                      <div className="drawer-avatar flex size-8 items-center justify-center rounded-full text-xs font-bold text-primary">
                        {(user.name ?? user.full_name ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                  </a>
                </Tooltip>
              )}
              <Tooltip content={t("SIDEBAR.Logout")}>
                <button
                  type="button"
                  onClick={clearAuth}
                  className="drawer-logout group flex w-full items-center justify-center rounded-xl px-3 py-2.5 transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {activeGroup
                  ? t(`SIDEBAR.${activeGroup.groupKey}`, { defaultValue: activeGroup.groupLabelStr })
                  : t("SIDEBAR.Menu", { defaultValue: "Menu" })}
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                {activeGroup?.groupLabelStr}
              </p>
            </div>
            <div className="mx-3 mb-2 h-px drawer-divider" />
            <nav className="drawer-nav-scroll relative z-10 flex-1 overflow-x-hidden overflow-y-auto px-2 pb-3">
              {activeGroup?.items.map((link, i) => (
                <div key={link.href}>{renderItem(link, i, false, true, false, false)}</div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {!isHorizontal && !isTwoColumn && (
        <div
          className={`drawer-shell fixed inset-y-0 start-0 z-50 hidden flex-col overflow-hidden transition-all duration-300 lg:flex ${
            collapsed ? "w-[4.5rem]" : "w-64"
          }`}
        >
          {sidebarContent(false)}
        </div>
      )}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background-70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`drawer-shell fixed inset-y-0 start-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : locale === "ar" ? "translate-x-full" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        {sidebarContent(true)}
      </div>
      {searchModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-background-70 backdrop-blur-sm" onClick={() => setSearchModalOpen(false)} aria-hidden="true" />
          <div className="relative w-full max-w-2xl bg-card border rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4">
              <div className="relative">
                <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none"><MagnifyingGlassIcon className="w-4 h-4 text-foreground-50" /></span>
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
                  <div>
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-70">{t("SIDEBAR.GoTo")}</p>
                    <div className="mt-2 grid grid-cols-1 gap-1">
                      {goToWithIdx.map((item) => {
                        const idx = item.idx;
                        const selected = selectedIndex === idx;
                        const cls = `flex items-center gap-3 px-3 py-2 rounded-md ${selected ? 'bg-primary-soft' : 'hover:bg-primary-soft'}`;
                        return (
                          <Link
                            key={`goto-${item.href}-${idx}`}
                            to={item.href}
                            onClick={() => { setSearchModalOpen(false); if (mobileOpen) setSidebarOpen(false); }}
                            ref={(el) => (itemRefs.current[idx] = el)}
                            className={cls}
                          >
                            <item.icon className="w-4 h-4 text-foreground-70" />
                            <div className="truncate">
                              <div className="text-sm font-medium text-foreground truncate">{item.label}</div>
                              {item.labelStr && <div className="text-xs text-foreground-50 truncate">{item.labelStr}</div>}
                            </div>
                            <div className="ml-auto text-xs text-foreground-60 px-2">{makeKeyHint(item.labelStr || item.label)}</div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-70">{t("SIDEBAR.System")}</p>
                    <div className="mt-2 divide-y divide-border rounded-md overflow-hidden">
                      {systemWithIdx.map((cmd) => {
                        const idx = cmd.idx;
                        const selected = selectedIndex === idx;
                        const cls = `w-full flex items-center justify-between gap-3 px-3 py-3 ${selected ? 'bg-primary-soft' : 'hover:bg-primary-soft'}`;
                        return (
                          <button key={cmd.id} onClick={() => { cmd.action(); setSearchModalOpen(false); }} ref={(el) => (itemRefs.current[idx] = el)} className={cls}>
                            <div className="flex items-center gap-3">
                              <cmd.icon className="w-4 h-4 text-foreground-70" />
                              <div className="truncate text-left">
                                <div className="text-sm font-medium text-foreground truncate">{cmd.label}</div>
                                {cmd.subtitle && <div className="text-xs text-foreground-50 truncate">{cmd.subtitle}</div>}
                              </div>
                            </div>
                            <div className="text-xs text-foreground-60">{cmd.shortcut}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-70">{t("SIDEBAR.Preferences")}</p>
                    <div className="mt-2 divide-y divide-border rounded-md overflow-hidden">
                      {prefsWithIdx.map((pref) => {
                        const idx = pref.idx;
                        const selected = selectedIndex === idx;
                        const cls = `w-full flex items-center gap-3 px-3 py-3 ${selected ? 'bg-primary-soft' : 'hover:bg-primary-soft'}`;
                        return (
                          <button key={pref.id} onClick={() => { pref.action(); setSearchModalOpen(false); }} ref={(el) => (itemRefs.current[idx] = el)} className={cls}>
                            <pref.icon className="w-4 h-4 text-foreground-70" />
                            <div className="truncate text-left">
                              <div className="text-sm font-medium text-foreground truncate">{pref.label}</div>
                              {pref.subtitle && <div className="text-xs text-foreground-50 truncate">{pref.subtitle}</div>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {searchResults.map((item, idx) => {
                    const selected = selectedIndex === idx;
                    const cls = `flex items-center gap-3 px-4 py-3 ${selected ? 'bg-primary-soft' : 'hover:bg-primary-soft'}`;
                    return (
                      <Link
                        key={`${item.href}-${idx}`}
                        to={item.href}
                        onClick={() => { setSearchModalOpen(false); setSearchQuery(""); if (mobileOpen) setSidebarOpen(false); }}
                        ref={(el) => (itemRefs.current[idx] = el)}
                        className={cls}
                      >
                        <span className="text-foreground-70"><item.icon className="w-4 h-4" /></span>
                        <div className="truncate">
                          <div className="text-sm font-medium text-foreground truncate">{item.label}</div>
                          {item.labelStr && <div className="text-xs text-foreground-50 truncate">{item.labelStr}</div>}
                        </div>
                        <div className="ml-auto text-xs text-foreground-60 px-2">{makeKeyHint(item.labelStr || item.label)}</div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
