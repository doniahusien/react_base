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
      <div className=" shrink-0">
        <img
          src="/logo.svg"
          alt="Logo"
          width={28}
          height={28}
          className="h-7 w-7"
        />
      </div>
      {showLabel && (
        <div className="min-w-0 flex flex-col">
          <span className="text-sm font-bold leading-snug text-foreground">
            {t("TITLES.dashName")}
          </span>
          <span className="text-xs text-gray-300">
            {t("TITLES.dashDescription")}
          </span>
        </div>
      )}
      {!showLabel && (
        <Tooltip content={`${t("SIDEBAR.Search")} (${shortcutLabel})`} centered>
          <button
            type="button"
            onClick={onSearchClick}
            className="relative flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-primary-soft transition-all duration-300 hover:scale-110"
            aria-label={t("SIDEBAR.Search")}
          >
            <MagnifyingGlassIcon className="w-4 h-4 text-foreground-70 transition-colors duration-300" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
