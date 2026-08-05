import { Link } from "react-router-dom";
import { Bars3Icon as Menu, MoonIcon as Moon, SunIcon as Sun, Cog6ToothIcon as Settings2 } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store";
import { useAuthStore } from "../../stores/auth";

interface HeaderProps {
  mode: "vertical" | "horizontal" | "two-column";
}

export function Header({ mode }: HeaderProps) {
  const { t } = useTranslation();
  const {
    lang,
    theme,
    sidebarCollapsed,
    setSidebarCollapsed,
    setSidebarOpen,
    sidebarOpen,
    setTheme,
    setLang,
    setCustomizerOpen,
  } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const collapsed = sidebarCollapsed;

  return (
    <header
      className={`header-bar sticky top-0 z-40 transition-all duration-500 ease-in-out ${
        mode === "horizontal" ? "" : "mx-5 my-0.5 rounded-b-4xl"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-2.5 transition-all duration-500 ease-in-out">
        <div className="flex min-w-0 items-center gap-3">
          {mode === "vertical" && (
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) setSidebarOpen(!sidebarOpen);
                else setSidebarCollapsed(!collapsed);
              }}
              className="header-icon-btn shrink-0"
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
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="header-pill">
            <button
              type="button"
              onClick={() => setCustomizerOpen(true)}
              className="header-icon-btn"
              aria-label="Open theme customizer"
              title="Theme Customizer"
            >
              <Settings2 width={15} height={15} />
            </button>
            <div className="h-4 w-px bg-border/70" />
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="header-icon-btn"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Moon width={15} height={15} /> : <Sun width={15} height={15} />}
            </button>
          </div>
          <div className="header-pill px-1">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`header-lang-btn ${lang === "en" ? "header-lang-active" : "header-lang-idle"}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`header-lang-btn ${lang === "ar" ? "header-lang-active" : "header-lang-idle"}`}
            >
              AR
            </button>
          </div>
          <div className="mx-0.5 h-6 w-px" />
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 transition-all duration-300 ease-in-out hover:border-border/80 hover:bg-background/80 hover:scale-105"
            title={user?.name ?? user?.full_name ?? "Profile"}
          >
            {user?.image ? (
              <img
                src={user.image?.media ?? user.image}
                alt={user.name}
                className="size-7 rounded-full object-cover ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40 hover:scale-110"
              />
            ) : (
              <div className="header-avatar flex size-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 hover:scale-110">
                {(user?.name ?? user?.full_name ?? "?")[0]?.toUpperCase()}
              </div>
            )}
            <span className="hidden max-w-[110px] truncate text-sm font-medium text-foreground md:block">
              {user?.name ?? user?.full_name}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
