import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../Tooltip";
import type { DrawerHeaderProps } from "./types";

export function DrawerHeader({
  collapsed,
  isMobileDrawer,
  shortcutLabel,
  onSearchClick,
}: DrawerHeaderProps) {
  const { t } = useTranslation();
  const showLabel = isMobileDrawer || !collapsed;

  return (
    <div
      className={`relative z-10 flex px-2 py-3 transition-all duration-500 ${
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
      {showLabel && (
        <div className="min-w-0 flex-1 overflow-hidden leading-tight transition-all duration-300">
          <span className="truncate text-sm font-bold tracking-wide text-foreground transition-colors duration-300">
            {t("SIDEBAR.Dashboard")}
          </span>
        </div>
      )}
      {!showLabel && (
        <Tooltip content={`${t("SIDEBAR.Search")} (${shortcutLabel})`}>
          <button
            type="button"
            onClick={onSearchClick}
            className="relative flex size-9 shrink-0 items-center justify-center rounded-xl hover:bg-primary-soft transition-all duration-300 hover:scale-110"
            aria-label={t("SIDEBAR.Search")}
          >
            <MagnifyingGlassIcon className="w-4 h-4 text-foreground-70 transition-colors duration-300" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
