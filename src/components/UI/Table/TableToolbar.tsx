import {
  TrashIcon as Trash2,
  Squares2X2Icon as LayoutGrid,
  Square3Stack3DIcon as Grid3X3,
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card border border-border px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {title && (
          <h2 className="text-base font-bold text-foreground tracking-tight">
            {t(`TITLES.${title}`)}
          </h2>
        )}
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold tabular-nums text-primary-foreground shadow-sm">
          {total}
        </span>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2.5 rounded-full bg-destructive/10 border border-destructive/20 px-4 py-1.5">
            <span className="text-sm font-bold text-destructive tabular-nums">{selectedCount}</span>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors"
            >
              <Trash2 width={13} height={13} />
              {t("ACTIONS.delete")}
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2.5 ms-auto">
        {filters}
        <ColumnVisibilityMenu table={table} />
        {view === "grid" && (
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-1.5 py-1.5">
            {[1, 2, 3, 4].map((cols) => (
              <button
                key={cols}
                type="button"
                onClick={() => onGridColsChange(cols as GridColumns)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  gridCols === cols
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                aria-label={`${cols} columns`}
              >
                {romanMap[cols as 1 | 2 | 3 | 4]}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-1.5 py-1.5">
          {(["table", "grid"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`rounded-lg p-2 transition-all duration-200 ${
                view === v
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              aria-label={`${v} view`}
            >
              {v === "table" ? <LayoutGrid width={16} height={16} /> : <Grid3X3 width={16} height={16} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
