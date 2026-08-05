import {
  TrashIcon as Trash2,
  Squares2X2Icon as LayoutGrid,
  Square3Stack3DIcon as Grid3X3,
  ListBulletIcon as CompactList,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { ColumnVisibilityMenu } from "./ColumnVisibilityMenu";
import type { TableToolbarProps, ViewMode, GridColumns } from "./types";

export function TableToolbar({
  title,
  total,
  selectedCount,
  table,
  view,
  onViewChange,
  gridCols,
  onGridColsChange,
  filters,
  onDelete,
}: TableToolbarProps) {
  const { t } = useTranslation();
  const romanMap = { 1: "I", 2: "II", 3: "III", 4: "IV" } as const;
  const viewOptions = [
    { id: "grid" as const, label: t("TITLES.gridView"), icon: Grid3X3 },
    { id: "compact" as const, label: t("TITLES.compactView"), icon: CompactList },
    { id: "table" as const, label: t("TITLES.tableView"), icon: LayoutGrid },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl bg-card border border-border px-3 sm:px-5 py-3 sm:py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {title && (
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            {t(`TITLES.${title}`)}
          </h2>
        )}
        <span className="rounded-full bg-primary px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-bold tabular-nums text-primary-foreground shadow-sm">
          {total}
        </span>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 sm:gap-2.5 rounded-full bg-destructive/10 border border-destructive/20 px-3 sm:px-4 py-1 sm:py-1.5">
            <span className="text-xs sm:text-sm font-bold text-destructive tabular-nums">{selectedCount}</span>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors"
            >
              <Trash2 width={12} height={12} className="sm:size-3.25" />
              {t("ACTIONS.delete")}
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 sm:gap-2.5 w-full sm:w-auto ms-auto">
        {filters}
        <ColumnVisibilityMenu table={table} />
        {/* Hide grid column selector on small screens */}
        {view === "grid" && (
          <div className="hidden md:flex items-center gap-1 rounded-lg sm:rounded-xl border border-border bg-background p-1">
            {[1, 2, 3, 4].map((cols) => (
              <button
                key={cols}
                type="button"
                onClick={() => onGridColsChange(cols as GridColumns)}
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg text-xs font-bold transition-all ${
                  gridCols === cols
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-primary hover:bg-primary-foreground"
                }`}
                aria-label={`${cols} columns`}
              >
                {romanMap[cols as 1 | 2 | 3 | 4]}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1 rounded-lg sm:rounded-xl border border-border bg-background p-1">
          {viewOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange(id)}
              className={`flex items-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-semibold transition-all duration-200 sm:rounded-lg sm:px-2 ${
                view === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              aria-label={`${label} view`}
            >
              <Icon width={14} height={14} className="sm:size-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
