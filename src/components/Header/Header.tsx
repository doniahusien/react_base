import { Link } from "react-router-dom";
import { Bars3Icon as Menu, Cog6ToothIcon as Settings2 } from "@heroicons/react/24/outline";
import { useAppStore } from "../../store";
import { useAuthStore } from "../../stores/auth";
import { ThemeSwitcher, LanguageSwitcher } from "../Shared";
import { NotificationsBell } from "./NotificationsBell";

interface HeaderProps {
  mode: "vertical" | "horizontal" | "two-column";
}

export function Header({ mode }: HeaderProps) {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    setSidebarOpen,
    sidebarOpen,
    setCustomizerOpen,
  } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const collapsed = sidebarCollapsed;

  return (
    <header
      className={`header-bar sticky top-0 z-20 transition-all duration-500 ease-in-out ${
        mode === "horizontal" ? "" : " mx-0 md:mx-5 my-2 md:rounded-4xl"
      }`}
    >
      <div className="relative z-10 flex items-center justify-between px-2 md:px-5 py-2.5 transition-all duration-500 ease-in-out">
        <div className="flex min-w-0 items-center gap-3">
          {mode === "vertical" && (
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) setSidebarOpen(!sidebarOpen);
                else setSidebarCollapsed(!collapsed);
              }}
              className="header-icon-btn relative z-10 shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu width={17} height={17} />
            </button>
          )}
          {(mode === "two-column" || mode === "horizontal") && (
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) setSidebarOpen(!sidebarOpen);
              }}
              className="header-icon-btn shrink-0 lg:hidden"
              aria-label="Open menu"
            >
              <Menu width={17} height={17} />
            </button>
          )}
        </div>
        <div className="relative z-10 flex shrink-0 items-center gap-0.5 md:gap-1.5">
          <div className="header-pill overflow-visible">
            <button
              type="button"
              onClick={() => setCustomizerOpen(true)}
              className="header-icon-btn"
              aria-label="Open theme customizer"
              title="Theme Customizer"
            >
              <Settings2 width={12} height={12} />
            </button>
            <div className="h-3 w-px bg-border/70" />
            <ThemeSwitcher variant="icon" iconSize={12} />
            <div className="h-3 w-px bg-border/70" />
            <NotificationsBell />
          </div>
          <LanguageSwitcher variant="pills" />
          <div className="mx-0.5 h-6 w-px" />
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 transition-all duration-300 ease-in-out hover:border-border/80 hover:bg-background/80 hover:scale-105"
            title={user?.full_name ?? "Profile"}
          >
            <div className="header-avatar flex size-7 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 hover:scale-105">
              {(user?.full_name ?? "?")[0]?.toUpperCase()}
            </div>
            <span className="hidden max-w-27.5 truncate text-sm font-medium text-foreground md:block">
              {user?.full_name}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
