import { EyeIcon as Eye } from "@heroicons/react/24/outline";
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
  if (loading) {
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(gridCols + 1, 4)}, minmax(0, 1fr))` }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <div className="skeleton-item h-3.5 rounded-full w-1/3" />
            <div className="skeleton-item h-3 rounded-full w-4/5" />
            <div className="skeleton-item h-3 rounded-full w-2/3" />
            <div className="skeleton-item h-3 rounded-full w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
      {table.getRowModel().rows.map((row) => {
        const selected = row.getIsSelected();
        const item = row.original;
        return (
          <div
            key={row.id}
            className={`group flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              selected
                ? "bg-primary/10 ring-1 ring-primary/30"
                : "bg-card shadow-sm border border-border"
            }`}
          >
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
              <input
                type="checkbox"
                checked={selected}
                onChange={row.getToggleSelectedHandler()}
                className="size-3.5 rounded accent-primary cursor-pointer"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                # {(item as any).id}
              </span>
            </div>
            <div className="flex-1 space-y-0">
              {selectedColumns
                .filter((c) => c.field !== "quick_view" && c.field !== "actions")
                .map((col) => (
                  <div key={col.field} className="px-4 py-2.5">
                    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
                      {col.header}
                    </p>
                    <div className="text-sm text-foreground">
                      {renderCell
                        ? renderCell(col.field, item, row.index)
                        : <span className="line-clamp-2">{String(dig(item, col.field) ?? "—")}</span>}
                    </div>
                  </div>
                ))}
            </div>
            {selectedColumns.some((c) => c.field === "actions" || c.field === "quick_view") && (
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
                {selectedColumns.some((c) => c.field === "actions") &&
                  renderCell && renderCell("actions", item, row.index)}
                {selectedColumns.some((c) => c.field === "quick_view") && (
                  <button
                    type="button"
                    onClick={() => onQuickView(item)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border transition-all"
                  >
                    <Eye width={12} height={12} />
                    View
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
