import { ArrowUpRightIcon as ArrowUpRight, EyeIcon as Eye } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { EmptyState } from "../EmptyState";
import { dig } from "./utils";
import type { GridViewProps } from "./types";

export function GridView<T extends { id?: any }>({
  table,
  selectedColumns,
  loading,
  rows,
  gridCols,
  renderCell,
  onQuickView,
}: GridViewProps<T>) {
  const { t } = useTranslation();

  // Responsive grid columns: 1 on mobile, 2 on sm, then use gridCols for md+
  const getGridClass = () => {
    if (gridCols === 1) return "grid-cols-1";
    if (gridCols === 2) return "grid-cols-1 sm:grid-cols-2";
    if (gridCols === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  };

  if (loading) {
    return (
      <div className={`grid gap-3 sm:gap-4 ${getGridClass()}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="skeleton-item h-4 w-14 rounded-md" />
              <div className="skeleton-item h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="skeleton-item size-11 rounded-full" />
                <div className="space-y-2"><div className="skeleton-item h-3.5 w-24 rounded-full" /><div className="skeleton-item h-3 w-16 rounded-full" /></div>
              </div>
              <div className="space-y-3 rounded-xl border border-border p-3">
                <div className="skeleton-item h-3 w-full rounded-full" />
                <div className="skeleton-item h-3 w-4/5 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`grid gap-3 sm:gap-4 ${getGridClass()}`}>
      {table.getRowModel().rows.map((row) => {
        const selected = row.getIsSelected();
        const item = row.original;
        const record = item as Record<string, unknown>;
        const contentColumns = selectedColumns.filter(
          (column) => !["quick_view", "actions", "select"].includes(column.field)
        );
        const mediaColumn = contentColumns.find((column) => /image|avatar|photo|flag|logo/i.test(column.field));
        const identityColumn =
          contentColumns.find((column) => /^(name|title|full_name)$/i.test(column.field)) ??
          contentColumns.find((column) => column.field !== mediaColumn?.field) ??
          contentColumns[0];
        const identityColumns = [mediaColumn, identityColumn].reduce((columns, column) => {
          if (column && !columns.some((candidate) => candidate.field === column.field)) {
            columns.push(column);
          }
          return columns;
        }, [] as typeof contentColumns);
        const detailColumns = contentColumns
          .filter((column) => !identityColumns.some((identity) => identity.field === column.field))
          .slice(0, 4);
        const isActive =
          typeof record.is_active === "boolean"
            ? record.is_active
            : typeof record.status === "string"
              ? record.status.toLowerCase() === "active"
                ? true
                : record.status.toLowerCase() === "inactive"
                  ? false
                  : undefined
              : undefined;
        const hasActions = selectedColumns.some((column) => column.field === "actions");
        const canQuickView = selectedColumns.some((column) => column.field === "quick_view");
        
        return (
          <div
            key={row.id}
            className={`group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
              selected
                ? "border-primary/40 bg-card ring-2 ring-primary/20 shadow-md"
                : "border-border bg-card shadow-sm hover:border-primary/40 hover:shadow-lg"
            }`}
            style={{
              animation: `fadeSlideIn 0.4s ease-out ${row.index * 0.05}s both`,
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                  #{row.index + 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
               {/*  {typeof isActive === "boolean" && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    isActive
                      ? "border-success/30 bg-success-soft text-success-foreground"
                      : "border-border bg-muted text-muted-foreground"
                  }`}>
                    <span className={`size-1.5 rounded-full ${isActive ? "bg-success" : "bg-muted-foreground"}`} />
                    {isActive ? t("TITLES.active") : t("TITLES.inactive")}
                  </span>
                )} */}
                {hasActions && renderCell && <div className="shrink-0">{renderCell("actions", item, row.index)}</div>}
              </div>
            </div>

            <div className="flex-1 space-y-4 p-4 sm:p-5">
              {identityColumns.length > 0 && (
                <div className="flex min-h-11 items-center gap-3">
                  {identityColumns.map((column) => (
                    <div key={column.field} className={column.field === mediaColumn?.field ? "shrink-0" : "min-w-0 flex-1"}>
                      {renderCell
                        ? renderCell(column.field, item, row.index)
                        : <span className="line-clamp-2 text-base font-semibold text-foreground">{String(dig(item, column.field) ?? "—")}</span>}
                    </div>
                  ))}
                </div>
              )}

              {detailColumns.length > 0 && (
                <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background/50 px-2.5">
                  {detailColumns.map((column) => (
                    <div key={column.field} className="flex items-center gap-3 py-2.5 first:pt-3 last:pb-3">
                      <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        <span className="size-1 rounded-full bg-primary" />
                        {column.header}
                      </span>
                      <div className="min-w-0 flex-1 text-end text-sm text-foreground">
                        {renderCell
                          ? renderCell(column.field, item, row.index)
                          : <span className="line-clamp-1">{String(dig(item, column.field) ?? "—")}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canQuickView && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={`size-1.5 rounded-full ${isActive === false ? "bg-muted-foreground" : "bg-success"}`} />
                  {typeof isActive === "boolean" ? (isActive ? t("TITLES.active") : t("TITLES.inactive")) : `#${(item as any).id}`}
                </span>
                <button
                  type="button"
                  onClick={() => onQuickView(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-secondary"
                >
                  <Eye width={13} height={13} />
                  {t("ACTIONS.show")}
                  <ArrowUpRight width={13} height={13} />
                </button>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Add animation keyframes */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
