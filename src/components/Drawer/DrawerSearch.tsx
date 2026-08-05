import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { DrawerSearchProps } from "./types";

export function DrawerSearch({
  searchQuery,
  setSearchQuery,
  searchResults,
  shortcutLabel,
  onModalClick,
}: DrawerSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="px-3.5 mb-2 transition-all duration-300">
      <div className="relative">
        <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none transition-all duration-300">
          <MagnifyingGlassIcon className="w-3.5 h-3.5 text-foreground-50 transition-colors duration-300" />
        </span>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("SIDEBAR.SearchPlaceholder", { defaultValue: "Search " })}
          className="w-full rounded-md px-9 py-2 text-sm focus:outline-none ring-2 ring-primary/30 transition-all duration-300 focus:ring-primary/50"
          aria-label={t("SIDEBAR.Search")}
        />
        <button
          type="button"
          onClick={onModalClick}
          className="absolute inset-y-0 end-3 flex items-center px-2 rounded-md text-[11px] text-foreground-60 hover:text-foreground transition-all duration-300 hover:scale-105"
          aria-hidden="true"
        >
          <span className="px-2 py-0.5 rounded-md">{shortcutLabel}</span>
        </button>
      </div>
      {searchQuery && searchResults.length === 0 && (
        <p className="text-xs text-foreground-50 mt-2 animate-in fade-in duration-300">{t("SIDEBAR.SearchNoResults")}</p>
      )}
    </div>
  );
}
