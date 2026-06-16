import { useState } from "react";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Earth, Library, LogOut, ChevronRight, ChevronDown, BadgePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store";
import { useAuthStore } from "../stores/auth";
import type { NavGroup, NavItem } from "../types/sidebar";

function isItemActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.endsWith(href);
}

export function Drawer() {
  const { t } = useTranslation();
  const { lang, sidebarCollapsed, sidebarMode, sidebarOpen, setSidebarOpen, clearAuth } = {
    ...useAppStore(), clearAuth: useAuthStore((s) => s.clearAuth),
  };
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const groups: NavGroup[] = [
    { groupKey: "groupMain", groupLabelStr: "Main", items: [{ href: "/", label: t("SIDEBAR.Dashboard"), labelStr: "Dashboard", icon: LayoutDashboard }] },
    {
      groupKey: "groupManagement", groupLabelStr: "Management",
      items: [
        { href: "/users", label: t("SIDEBAR.Users"), labelStr: "Users", icon: Users, children: [{ href: "/users", label: t("TITLES.viewAll"), labelStr: "Users", icon: Users }, { href: "/users/form", label: t("TITLES.add"), labelStr: "Add User", icon: BadgePlus }] },
        { href: "/categories", label: t("SIDEBAR.Categories"), labelStr: "Categories", icon: Library, children: [{ href: "/categories", label: t("TITLES.viewAll"), labelStr: "Category", icon: Library }, { href: "/categories/form", label: t("TITLES.add"), labelStr: "Add Category", icon: BadgePlus }] },
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
              return <a key={link.href} href={link.href} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${active ? "drawer-nav-active" : "text-white/55 hover:text-white hover:bg-white/7"}`}><link.icon size={14} />{link.label}</a>;
            })}
          </nav>
        </div>
      </div>
    );
  }

  const renderItem = (link: NavItem, i: number, isChild = false, isMobileDrawer = false) => {
    const active = isItemActive(link.href, pathname);
    const hasChildren = (link.children?.length ?? 0) > 0;
    const subOpen = openSubMenu === link.href;
    const showLabel = isMobileDrawer || !collapsed;

    return (
      <div key={link.href}>
        <a href={hasChildren ? undefined : link.href} onClick={(e) => { if (hasChildren) { e.preventDefault(); setOpenSubMenu(subOpen ? null : link.href); } else if (isMobileDrawer) setSidebarOpen(false); }}
          style={{ animationDelay: `${i * 40}ms` }}
          className={`drawer-nav-item drawer-nav-entry group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer ${isChild ? showLabel ? "gap-2.5 ms-9 px-3 py-2" : "justify-center py-2.5 mx-0.5" : showLabel ? "gap-3 px-3 py-2.5" : "justify-center py-3 mx-0.5"} ${active ? "drawer-nav-active" : "drawer-nav-idle"}`}>
          {active && showLabel && !isChild && <span className="drawer-active-pill" />}
          <span className={`relative shrink-0 flex items-center justify-center transition-all duration-200 ${!showLabel ? "size-9 rounded-xl" : ""} ${active ? !showLabel ? "drawer-icon-badge-active" : "drawer-icon-active" : !showLabel ? "drawer-icon-badge-idle" : "drawer-icon-idle"}`}>
            <link.icon size={isChild ? 14 : 17} />
            {active && !showLabel && <span className="drawer-active-pulse" />}
          </span>
          {showLabel && (<><span className={`flex-1 truncate font-medium ${isChild ? "text-xs" : "text-sm"}`}>{link.label}</span>{hasChildren ? <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 opacity-40 ${subOpen ? "rotate-180" : ""}`} /> : <ChevronRight size={12} className={`shrink-0 transition-all duration-200 ${active ? "opacity-40" : "opacity-0 group-hover:opacity-25"}`} />}</>)}
          {!showLabel && <span className="drawer-tooltip" role="tooltip">{link.labelStr}</span>}
        </a>
        {hasChildren && showLabel && subOpen && <div className="mt-0.5 space-y-0.5 overflow-hidden">{link.children!.map((child: NavItem, ci: number) => renderItem(child, ci, true, isMobileDrawer))}</div>}
      </div>
    );
  };

  const sidebarContent = (isMobileDrawer = false) => {
    const showLabel = isMobileDrawer || !collapsed;
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
          {groups.map((group, gi) => (
            <div key={group.groupKey} className={gi > 0 ? "mt-3" : ""}>
              {showLabel && <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white select-none">{t(`SIDEBAR.${group.groupKey}`)}</p>}
              {!showLabel && gi > 0 && <div className="mx-2 drawer-divider h-px my-2" />}
              <div className="space-y-0.5">{group.items.map((item, ii) => renderItem(item, ii, false, isMobileDrawer))}</div>
            </div>
          ))}
        </nav>
        <div className="relative z-10 p-3 shrink-0">
          <div className="drawer-divider h-px mb-3" />
          {showLabel && user && <a href="/profile" onClick={() => { if (isMobileDrawer) setSidebarOpen(false); }} className="drawer-user-card flex items-center gap-2.5 px-2.5 py-2 mb-2 rounded-xl transition-all duration-200">
            {user.image ? <img src={user.image} alt={user.name} className="size-8 rounded-full object-cover ring-2 ring-violet-500/25 shrink-0" /> : <div className="size-8 rounded-full drawer-avatar shrink-0 flex items-center justify-center text-xs font-bold text-violet-300">{(user.name ?? user.full_name ?? "?")[0].toUpperCase()}</div>}
            <div className="flex-1 overflow-hidden leading-tight min-w-0"><p className="text-xs font-semibold text-white/80 truncate">{user.name ?? user.full_name}</p><p className="text-[10px] text-white/40 truncate">{user.email ?? "Admin"}</p></div>
            <ChevronRight size={11} className="text-white/20 shrink-0" />
          </a>}
          {!isMobileDrawer && collapsed && user && <a href="/profile" className="flex justify-center mb-2" title={user.name ?? user.full_name ?? "Profile"}>{user.image ? <img src={user.image} alt={user.name} className="size-8 rounded-full object-cover ring-2 ring-violet-500/25" /> : <div className="size-8 rounded-full drawer-avatar flex items-center justify-center text-xs font-bold text-violet-300">{(user.name ?? user.full_name ?? "?")[0].toUpperCase()}</div>}</a>}
          <button onClick={clearAuth} className={`drawer-logout group flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 transition-all duration-200 ${!isMobileDrawer && collapsed ? "justify-center" : ""}`}>
            <LogOut size={15} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
            {showLabel && <span className="text-sm font-medium">{t("SIDEBAR.Logout")}</span>}
            {!isMobileDrawer && collapsed && <span className="drawer-tooltip" role="tooltip">{t("SIDEBAR.Logout")}</span>}
          </button>
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
