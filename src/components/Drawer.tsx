import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Earth, Library, LogOut, ChevronRight, ChevronDown, BadgePlus, Pin, PinOff, GripVertical, Search, Lock, Settings, Bell, Zap, Moon, Globe } from "lucide-react";
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
    <div ref={setNodeRef} style={style} {...attributes}>
      {!disabled && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10" {...listeners}>
          <GripVertical size={14} className="text-foreground-30" />
        </div>
      )}
      {children}
    </div>
  );
}

export function Drawer() {
  const { t, i18n } = useTranslation();
  const { lang, sidebarCollapsed, sidebarMode, sidebarOpen, setSidebarOpen, clearAuth, pinnedItemsV2, togglePinItem, togglePinGroup, reorderPinnedItems } = {
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
    { groupKey: "groupMain", groupLabelStr: "Main", items: [{ href: "/", label: t("SIDEBAR.Dashboard"), labelStr: "Dashboard", icon: LayoutDashboard }] },
    {
      groupKey: "groupManagement", groupLabelStr: "Management",
      items: [
        { href: "/users", label: t("SIDEBAR.Users"), labelStr: "Users", icon: Users, children: [{ href: "/users", label: t("TITLES.viewAll"), labelStr: "Users", icon: Users }, { href: "/users/form", label: t("TITLES.add", { count: t("TITLES.user") as any }), labelStr: "Add User", icon: BadgePlus }] },
        { href: "/categories", label: t("SIDEBAR.Categories"), labelStr: "Categories", icon: Library, children: [{ href: "/categories", label: t("TITLES.viewAll"), labelStr: "Category", icon: Library }, { href: "/categories/form", label: t("TITLES.add", { count: t("TITLES.category") as any }), labelStr: "Add Category", icon: BadgePlus }] },
      ],
    },
    { groupKey: "groupPlaces", groupLabelStr: "Places", items: [{ href: "/countries", label: t("SIDEBAR.Countries"), labelStr: "Countries", icon: Earth }, { href: "/cities", label: t("SIDEBAR.Cities"), labelStr: "Cities", icon: Earth }] },
  ];

  const collapsed = sidebarCollapsed;
  const mode = sidebarMode;
  const locale = lang;
  const isHorizontal = mode === "horizontal";
  const mobileOpen = sidebarOpen;

  // flattened list for search/modal (include children)
  const allItemsFlat: NavItem[] = groups.flatMap(g => g.items.flatMap(item => [item, ...(item.children ?? [])]));
  const searchResults: NavItem[] = searchQuery.trim() === "" ? [] : allItemsFlat.filter(i => ((i.labelStr || i.label || "").toLowerCase().includes(searchQuery.toLowerCase())));

  // default command sections when search is empty
  const goToItems = groups.flatMap(g => g.items);
  const systemCommands = [
    { id: "lock", label: "Lock Terminal", subtitle: "Require PIN to unlock", icon: Lock, shortcut: isMac ? "⌘L" : "Ctrl+L", action: () => console.log("Lock") },
    { id: "settings", label: "Terminal Settings", subtitle: "Printer, cash drawer, taxes", icon: Settings, shortcut: isMac ? "⌘," : "Ctrl+,", action: () => console.log("Settings") },
    { id: "notifications", label: "Notifications", subtitle: "System alerts and messages", icon: Bell, shortcut: "", action: () => console.log("Notifications") },
    { id: "sidekick", label: "Sidekick AI", subtitle: "Ask the terminal assistant", icon: Zap, shortcut: isMac ? "⌘." : "Ctrl+.", action: () => console.log("Sidekick") },
  ];
  const preferences = [
    { id: "dark", label: "Toggle Dark Mode", subtitle: "Switch between light and dark", icon: Moon, shortcut: "", action: () => document.documentElement.classList.toggle("dark") },
    { id: "lang", label: "Change Language", subtitle: "Toggle English / Arabic", icon: Globe, shortcut: "", action: () => i18n.changeLanguage(i18n.language === "en" ? "ar" : "en") },
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

  if (isHorizontal) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 h-14">
        <div className="flex h-full items-center gap-5 px-5">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="drawer-logo-badge"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" fillOpacity=".95" /></svg></div>
          </div>
          <nav className="flex items-center gap-0.5 overflow-x-auto flex-1">
            {groups.flatMap((g) => g.items).map((link) => {
              const active = isItemActive(link.href, pathname);
              return <Link key={link.href} to={link.href} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${active ? "drawer-nav-active" : "text-foreground-70 hover:text-foreground hover:bg-primary-soft"}`}><link.icon size={14} />{link.label}</Link>;
            })}
          </nav>
        </div>
      </div>
    );
  }

  const renderItem = (link: NavItem, i: number, isChild = false, isMobileDrawer = false, showPin = false, inPinnedSection = false) => {
    const active = isItemActive(link.href, pathname);
    const hasChildren = (link.children?.length ?? 0) > 0;
    const subOpen = openSubMenu === link.href;
    const showLabel = isMobileDrawer || !collapsed;
    const itemId = `item-${link.href}`;
    const isPinned = pinnedItemsV2.some(p => p.id === itemId);

    const sharedClassName = `drawer-nav-item group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer ${isChild ? showLabel ? "gap-2.5 ms-9 px-3 py-2" : "justify-center py-2.5 mx-0.5" : showLabel ? "gap-3 px-3 py-2.5" : "justify-center py-3 mx-0.5"} ${active ? "drawer-nav-active" : "drawer-nav-idle"} ${inPinnedSection && showLabel ? "ps-8" : ""}`;

    const innerContent = (
      <>
        {active && showLabel && !isChild && <span className="drawer-active-pill" />}
        <span className={`relative shrink-0 flex items-center justify-center transition-all duration-200 ${!showLabel ? "size-9 rounded-xl" : ""} ${active ? !showLabel ? "drawer-icon-badge-active" : "drawer-icon-active" : !showLabel ? "drawer-icon-badge-idle" : "drawer-icon-idle"}`}>
          <link.icon size={isChild ? 14 : 17} />
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
            className="shrink-0 p-1 rounded-md hover:bg-primary-soft transition-all duration-200 opacity-0 group-hover:opacity-100"
            title={isPinned ? "Unpin" : "Pin"}
          >
              {isPinned ? <Pin size={12} className="text-primary" fill="currentColor" /> : <PinOff size={12} className="text-foreground-40" />}
          </button>
        )}
        {hasChildren ? <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 opacity-40 ${subOpen ? "rotate-180" : ""}`} /> : !showPin && !inPinnedSection && !isChild && <ChevronRight size={12} className={`shrink-0 transition-all duration-200 ${active ? "opacity-40" : "opacity-0 group-hover:opacity-25"}`} />}</>)}
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
    // Check if all items from this group are pinned
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
              {allPinned ? <Pin size={11} className="text-primary" fill="currentColor" /> : somePinned ? <Pin size={11} className="text-primary/60" fill="currentColor" /> : <PinOff size={11} className="text-foreground-40" />}
            </button>
          )}
        </div>
        {!showLabel && gi > 0 && <div className="mx-2 drawer-divider h-px my-2" />}
        <div className="space-y-0.5">{group.items.map((item, ii) => renderItem(item, ii, false, isMobileDrawer, showPin, false))}</div>
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
        <div className={`relative z-10 flex items-center px-3.5 py-4 ${!isMobileDrawer && collapsed ? "justify-center" : "gap-3"}`}>
          <div className="drawer-logo-badge shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" fillOpacity=".95" /></svg></div>
          {(isMobileDrawer || !collapsed) && <div className="flex flex-col leading-tight overflow-hidden min-w-0"><span className="text-text font-bold text-sm tracking-wide truncate">{t("SIDEBAR.Dashboard")}</span></div>}
          {/* Compact search icon with shortcut badge for collapsed sidebar */}
          {!showLabel && (
            <div className="ms-2">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="relative size-9 rounded-md flex items-center justify-center hover:bg-primary-soft"
                aria-label={t("SIDEBAR.Search")}
              >
                <Search size={16} className="text-foreground-70" />
                <span className="absolute -top-1 -end-1 text-[10px] px-1 rounded bg-background border border-border text-foreground-60">{shortcutLabel}</span>
              </button>
            </div>
          )}
        </div>
        <div className="mx-3.5 drawer-divider h-px mb-2" />

        {/* Search area */}
        {showLabel && (
          <div className="px-3.5 mb-2">
            <div className="relative">
              <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none"><Search size={14} className="text-foreground-50" /></span>
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
            {searchQuery && searchResults.length === 0 && <p className="text-xs text-foreground-50 mt-2">{t("SIDEBAR.SearchNoResults", { defaultValue: "No results" })}</p>}
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
                        {pinnedNavItems.map((item, idx) => renderItem(item, idx, false, isMobileDrawer, false, true))}
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
            {user.image ? <img src={user.image} alt={user.name} className="size-8 rounded-full object-cover ring-2 ring-violet-500/25 shrink-0" /> : <div className="size-8 rounded-full drawer-avatar shrink-0 flex items-center justify-center text-xs font-bold text-violet-300">{(user.name ?? user.full_name ?? "?")[0].toUpperCase()}</div>}
            <div className="flex-1 overflow-hidden leading-tight min-w-0"><p className="text-xs font-semibold text-foreground-80 truncate">{user.name ?? user.full_name}</p><p className="text-[10px] text-foreground-50 truncate">{user.email ?? "Admin"}</p></div>
            <ChevronRight size={11} className="text-foreground-20 shrink-0" />
          </a>}
          {!isMobileDrawer && collapsed && user && <Tooltip content={user.name ?? user.full_name ?? "Profile"}><a href="/profile" className="flex justify-center mb-2">{user.image ? <img src={user.image} alt={user.name} className="size-8 rounded-full object-cover ring-2 ring-violet-500/25" /> : <div className="size-8 rounded-full drawer-avatar flex items-center justify-center text-xs font-bold text-violet-300">{(user.name ?? user.full_name ?? "?")[0].toUpperCase()}</div>}</a></Tooltip>}
          {!showLabel ? (
            <Tooltip content={t("SIDEBAR.Logout")} disabled={isMobileDrawer}>
              <button onClick={clearAuth} className={`drawer-logout group flex items-center justify-center gap-2.5 w-full rounded-xl px-3 py-2.5 transition-all duration-200`}>
                <LogOut size={15} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
              </button>
            </Tooltip>
          ) : (
            <button onClick={clearAuth} className={`drawer-logout group flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 transition-all duration-200`}>
              <LogOut size={15} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
              <span className="text-sm font-medium">{t("SIDEBAR.Logout")}</span>
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "text-right" : "text-left"}>
      <div className={`hidden lg:flex fixed inset-y-0 start-0 z-50 transition-all duration-300 overflow-hidden flex-col drawer-shell ${collapsed ? "w-[4.5rem]" : "w-64"}`}>{sidebarContent(false)}</div>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-background-70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <div className={`fixed inset-y-0 start-0 z-50 w-72 flex flex-col drawer-shell transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : locale === "ar" ? "translate-x-full" : "-translate-x-full"}`} aria-label="Mobile navigation">{sidebarContent(true)}</div>
      {searchModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-background-70 backdrop-blur-sm" onClick={() => setSearchModalOpen(false)} aria-hidden="true" />
          <div className="relative w-full max-w-2xl bg-panel border rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4">
              <div className="relative">
                <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none"><Search size={16} className="text-foreground-50" /></span>
                <input
                  ref={modalSearchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("SIDEBAR.SearchPlaceholder", { defaultValue: "Search (Ctrl/Cmd+K)" })}
                  className="w-full rounded-md px-10 py-3 text-sm placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label={t("SIDEBAR.Search")}
                />
              </div>
            </div>
            <div className="max-h-80 overflow-auto">
              {searchQuery.trim() === "" ? (
                <div className="space-y-4 p-3">
                  <div>
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-70">{t("SIDEBAR.GoTo", { defaultValue: "Go To" })}</p>
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
                            <item.icon size={16} className="text-foreground-70" />
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
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-70">{t("SIDEBAR.System", { defaultValue: "System" })}</p>
                    <div className="mt-2 divide-y divide-border rounded-md overflow-hidden">
                      {systemWithIdx.map((cmd) => {
                        const idx = cmd.idx;
                        const selected = selectedIndex === idx;
                        const cls = `w-full flex items-center justify-between gap-3 px-3 py-3 ${selected ? 'bg-primary-soft' : 'hover:bg-primary-soft'}`;
                        return (
                          <button key={cmd.id} onClick={() => { cmd.action(); setSearchModalOpen(false); }} ref={(el) => (itemRefs.current[idx] = el)} className={cls}>
                            <div className="flex items-center gap-3">
                              <cmd.icon size={16} className="text-foreground-70" />
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
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-70">{t("SIDEBAR.Preferences", { defaultValue: "Preferences" })}</p>
                    <div className="mt-2 divide-y divide-border rounded-md overflow-hidden">
                      {prefsWithIdx.map((pref) => {
                        const idx = pref.idx;
                        const selected = selectedIndex === idx;
                        const cls = `w-full flex items-center gap-3 px-3 py-3 ${selected ? 'bg-primary-soft' : 'hover:bg-primary-soft'}`;
                        return (
                          <button key={pref.id} onClick={() => { pref.action(); setSearchModalOpen(false); }} ref={(el) => (itemRefs.current[idx] = el)} className={cls}>
                            <pref.icon size={16} className="text-foreground-70" />
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
                        <span className="text-foreground-70"><item.icon size={16} /></span>
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
