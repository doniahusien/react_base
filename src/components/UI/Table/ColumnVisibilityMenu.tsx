import { useState, useEffect, useRef } from "react";
import { AdjustmentsHorizontalIcon as SlidersVertical, ChevronDownIcon as ChevronDown, CheckIcon as Check } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { Table } from "@tanstack/react-table";

interface ColumnVisibilityMenuProps<T = any> {
  table: Table<T>;
}

/**
 * TanStack Table v8 native column visibility control
 * 
 * Uses TanStack Table v8 API:
 * - table.getAllColumns() - Get all column instances
 * - table.getIsAllColumnsVisible() - Check if all columns are visible
 * - table.getToggleAllColumnsVisibilityHandler() - Toggle all columns
 * - column.getIsVisible() - Check if individual column is visible
 * - column.getToggleVisibilityHandler() - Toggle individual column
 * 
 * Based on official TanStack Table v8 Column Visibility example:
 * https://tanstack.com/table/v8/docs/examples/react/column-visibility
 */
export function ColumnVisibilityMenu<T>({ table }: ColumnVisibilityMenuProps<T>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Get all columns except the select column
  const columns = table.getAllColumns().filter((col) => col.id !== "select");

  // Check if all columns are visible (v8 API)
  const allVisible = table.getIsAllColumnsVisible();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelectAll = () => {
    // v8 API: Toggle all columns visibility
    table.toggleAllColumnsVisible(true);
  };

  const handleDeselectAll = () => {
    // v8 API: Toggle all columns visibility
    table.toggleAllColumnsVisible(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-foreground hover:border-accent transition-all duration-200"
      >
        <SlidersVertical width={15} height={15} />
        <span className="hidden sm:inline">{t("TITLES.columns")}</span>
        <ChevronDown
          width={12}
          height={12}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="absolute top-full mt-2 end-0 w-60 overflow-hidden rounded-2xl border border-border bg-background shadow-xl shadow-slate-950/10 z-[100]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{t("LABELS.columns")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("LABELS.columnsDesc")}</p>
          </div>
          <div className="px-4 py-2.5 border-b border-border bg-muted/20">
            <button
              type="button"
              onClick={table.getToggleAllColumnsVisibilityHandler()}
              className="flex w-full items-center gap-3 text-sm transition-colors"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  allVisible ? "bg-primary border-primary" : "border-border"
                }`}
              >
                {allVisible && <Check width={11} height={11} className="text-foreground" />}
              </span>
              <span className="flex-1 text-start font-semibold text-foreground">
                {t("ACTIONS.toggleAll")}
              </span>
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {columns.map((column, i) => (
              <button
                key={column.id}
                type="button"
                onClick={column.getToggleVisibilityHandler()}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-border/20 ${
                  i % 2 === 0 ? "bg-panel/5" : ""
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                    column.getIsVisible() ? "bg-primary border-primary" : "border-border"
                  }`}
                >
                  {column.getIsVisible() && <Check width={11} height={11} className="text-foreground" />}
                </span>
                <span className="flex-1 text-start text-foreground">
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
            <button
              onClick={handleSelectAll}
              className="text-xs font-medium text-primary hover:text-accent-hover transition-colors"
            >
              {t("ACTIONS.selectAll")}
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("ACTIONS.deselectAll")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
