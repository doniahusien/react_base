import type { ReactNode } from "react";
import { Drawer } from "./Drawer";
import { Header } from "./Header";
import { ThemeCustomizer } from "./ThemeCustomizer";
import { LanguageRefreshManager } from "./LanguageRefreshManager";
import { useAppStore } from "../store";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const {
    sidebarCollapsed,
    sidebarMode,
  } = useAppStore();

  const mode = sidebarMode;
  const collapsed = sidebarCollapsed;

  const desktopMargin =
    mode === "horizontal"
      ? "lg:pt-14"
      : mode === "two-column"
        ? "lg:ms-[18.5rem]"
        : collapsed
          ? "lg:ms-[4.5rem]"
          : "lg:ms-64";

  return (
    <div className="flex h-screen bg-background">
      <LanguageRefreshManager />
      <Drawer />
      <ThemeCustomizer />
      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-500 ease-in-out ${desktopMargin}`}>
        <Header mode={mode} />
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 transition-all duration-500 ease-in-out">{children}</main>
      </div>
    </div>
  );
}
