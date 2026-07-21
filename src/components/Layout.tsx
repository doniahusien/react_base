import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Menu, Moon, Sun, SlidersHorizontal } from "lucide-react";
import { Drawer } from "./Drawer";
import { useAppStore } from "../store";
import { useAuthStore } from "../stores/auth";

interface LayoutProps { children: ReactNode; }

export function Layout({ children }: LayoutProps) {
  const { lang, theme, sidebarCollapsed, sidebarMode, setSidebarCollapsed, setSidebarOpen, sidebarOpen, setTheme, setLang } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const mode = sidebarMode;
  const collapsed = sidebarCollapsed;

  const desktopMargin = mode === "horizontal" ? "lg:pt-14" : collapsed ? "lg:ms-[4.5rem]" : "lg:ms-64";

  return (
    <div className="flex h-screen bg-app-shell">
      <Drawer />
      <div className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${desktopMargin}`}>
        <header className="header-bar sticky top-0 z-40">
          <div className="flex items-center justify-between px-5 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              {mode !== "horizontal" && (
                <button onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(!sidebarOpen); else setSidebarCollapsed(!collapsed); }} className="header-icon-btn shrink-0" aria-label="Toggle sidebar">
                  <Menu size={17} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="header-pill">
                <button onClick={() => useAppStore.getState().setSidebarMode(mode === "horizontal" ? "vertical" : "horizontal")} className="header-icon-btn" aria-label="Toggle layout" title={mode === "horizontal" ? "Vertical layout" : "Horizontal layout"}><SlidersHorizontal size={15} /></button>
                <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="header-icon-btn" aria-label="Toggle theme">{theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}</button>
              </div>
              <div className="header-pill px-1">
                <button onClick={() => setLang("en")} className={`header-lang-btn ${lang === "en" ? "header-lang-active" : "header-lang-idle"}`}>EN</button>
                <button onClick={() => setLang("ar")} className={`header-lang-btn ${lang === "ar" ? "header-lang-active" : "header-lang-idle"}`}>AR</button>
              </div>
              <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-0.5" />
              <Link to="/profile" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-glass/50 transition-all duration-200 border border-transparent hover:border-black/6 dark:hover:border-white/8" title={user?.name ?? user?.full_name ?? "Profile"}>
                {user?.image ? <img src={user.image?.media ?? user.image} alt={user.name} className="size-7 rounded-full object-cover ring-2 ring-violet-500/20" /> : <div className="size-7 rounded-full header-avatar flex items-center justify-center text-[11px] font-bold">{(user?.name ?? user?.full_name ?? "?")[0]?.toUpperCase()}</div>}
                <span className="hidden md:block text-sm font-medium text-text max-w-[110px] truncate">{user?.name ?? user?.full_name}</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
