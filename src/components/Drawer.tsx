import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Users, Earth, Library, LogOut, ChevronRight, ChevronDown, BadgePlus, Pin, PinOff, GripVertical } from "lucide-react";
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
          <GripVertical size={14} className="text-white/30" />
        </div>
      )}
      {children}
    </div>
  );
}

export function Drawer() {
  const { t } = useTranslation();
  const { lang, sidebarCollapsed, sidebarMode, sidebarOpen, setSidebarOpen, clearAuth, pinnedItemsV2, togglePinItem, togglePinGroup, reorderPinnedItems } = {
    ...useAppStore(), clearAuth: useAuthStore((s) => s.clearAuth),
  };
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

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

  if (isHorizontal) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 h-14 drawer-shell-h shadow-xl">
        <div className="flex h-full items-center gap-5 px-5">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="drawer-logo-badge"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" fillOpacity=".95" /></svg></div>
          </div>
          <div className="w-px h-5 bg-white/12 shrink-0" />
          <nav className="flex items-center gap-0.5 overflow-x-auto flex-1">
            {groups.flatMap((g) => g.items).map((link) => {
              const active = isItemActive(link.href, pathname);
              return <Link key={link.href} to={link.href} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${active ? "drawer-nav-active" : "text-white/55 hover:text-white hover:bg-white/7"}`}><link.icon size={14} />{link.label}</Link>;
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
            className="shrink-0 p-1 rounded-md hover:bg-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
            title={isPinned ? "Unpin" : "Pin"}
          >
            {isPinned ? <Pin size={12} className="text-violet-300" fill="currentColor" /> : <PinOff size={12} className="text-white/40" />}
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
              className="shrink-0 p-1 rounded-md hover:bg-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100 mr-2"
              title={allPinned ? "Unpin All" : "Pin All"}
            >
              {allPinned ? <Pin size={11} className="text-violet-300" fill="currentColor" /> : somePinned ? <Pin size={11} className="text-violet-300/50" fill="currentColor" /> : <PinOff size={11} className="text-white/40" />}
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
          {(isMobileDrawer || !collapsed) && <div className="flex flex-col leading-tight overflow-hidden min-w-0"><span className="text-white font-bold text-sm tracking-wide truncate">{t("SIDEBAR.Dashboard")}</span></div>}
        </div>
        <div className="mx-3.5 drawer-divider h-px mb-2" />
        <nav className="relative z-10 flex-1 px-2 pt-1 overflow-y-auto overflow-x-hidden drawer-nav-scroll">
          {/* PINNED SECTION */}
          {pinnedNavItems.length > 0 && (
            <div className="mb-3">
              {showLabel && <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 select-none">{t("SIDEBAR.Pinned")}</p>}
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
        </nav>
        <div className="relative z-10 p-3 shrink-0">
          <div className="drawer-divider h-px mb-3" />
          {showLabel && user && <a href="/profile" onClick={() => { if (isMobileDrawer) setSidebarOpen(false); }} className="drawer-user-card flex items-center gap-2.5 px-2.5 py-2 mb-2 rounded-xl transition-all duration-200">
            {user.image ? <img src={user.image} alt={user.name} className="size-8 rounded-full object-cover ring-2 ring-violet-500/25 shrink-0" /> : <div className="size-8 rounded-full drawer-avatar shrink-0 flex items-center justify-center text-xs font-bold text-violet-300">{(user.name ?? user.full_name ?? "?")[0].toUpperCase()}</div>}
            <div className="flex-1 overflow-hidden leading-tight min-w-0"><p className="text-xs font-semibold text-white/80 truncate">{user.name ?? user.full_name}</p><p className="text-[10px] text-white/40 truncate">{user.email ?? "Admin"}</p></div>
            <ChevronRight size={11} className="text-white/20 shrink-0" />
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
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <div className={`fixed inset-y-0 start-0 z-50 w-72 flex flex-col drawer-shell transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : locale === "ar" ? "translate-x-full" : "-translate-x-full"}`} aria-label="Mobile navigation">{sidebarContent(true)}</div>
    </div>
  );
}
