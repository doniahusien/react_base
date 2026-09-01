import { Link } from "react-router-dom";
import { Logo } from "../Shared/Logo";
import type { NavGroup } from "../../types/sidebar";
import { isItemActive } from "./utils";

interface DrawerHorizontalLayoutProps {
  groups: NavGroup[];
  pathname: string;
  locale: string;
}

export function DrawerHorizontalLayout({
  groups,
  pathname,
  locale,
}: DrawerHorizontalLayoutProps) {
  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={locale === "ar" ? "text-right" : "text-left"}
    >
      <div className="fixed inset-x-0 top-0 z-30 hidden h-14 lg:block">
        <div className="flex h-full items-center gap-5 px-5">
          <div className="flex shrink-0 items-center gap-2.5">
            <Logo className="h-7 w-7" />
          </div>
          <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto">
            {groups
              .flatMap((g) => g.items)
              .map((link) => {
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
    </div>
  );
}
