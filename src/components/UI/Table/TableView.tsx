import {
  EyeIcon as Eye,
  ChevronUpIcon as ChevronUp,
  ChevronDownIcon as ChevronDown,
  ArrowsUpDownIcon as ChevronsUpDown,
} from "@heroicons/react/24/outline";
import { flexRender } from "@tanstack/react-table";
import { EmptyState } from "../EmptyState";
import { SkeletonRow } from "./SkeletonRow";
import { getColumnWidthStyle, isCompactTableColumn } from "./utils";
import type { TableViewProps } from "./types";

export function TableView<T extends { id?: any }>({
  table,
  selectedColumns,
  loading,
  rows,
  onQuickView,
}: TableViewProps<T>) {
  const SortIcon = ({ column }: { column: any }) => {
    const sorted = column.getIsSorted();
    if (!sorted) return <ChevronsUpDown width={11} height={11} className="opacity-40" />;
    return sorted === "asc"
      ? <ChevronUp width={11} height={11} className="text-primary-foreground" />
      : <ChevronDown width={11} height={11} className="text-primary-foreground" />;
  };

  const cellBase =
    "bg-card px-2 sm:px-3 py-2.5 sm:py-3.5 text-foreground align-middle transition-all duration-150 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-foreground)_4%,transparent)]";
  const cellHover = "group-hover:bg-card/20";
  const cellSelected = "bg-primary/10";

  return (
    <div className="w-full overflow-x-auto rounded-xl sm:rounded-2xl -mx-1 px-1">
      <table className="w-full min-w-140 border-separate border-spacing-y-1 text-sm" style={{ width: "100%", tableLayout: "fixed" }}>
        <colgroup>
          {table.getVisibleLeafColumns().map((column) => (
            <col key={column.id} style={getColumnWidthStyle(column.id, column.getSize())} />
          ))}
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSelect = header.id === "select";
                const isFirst = header.index === 0;
                const isLast = header.index === headerGroup.headers.length - 1;
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      ...getColumnWidthStyle(header.column.id, header.getSize()),
                      boxSizing: "border-box",
                      ...(header.column.id === "actions" ? { position: "sticky", right: 0, zIndex: 20 } : {}),
                    }}
                    className={`relative bg-primary/80 text-primary-foreground px-2 sm:px-3 py-2.5 sm:py-3.5 text-start text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap shadow-[0_1px_3px_color-mix(in_srgb,var(--color-foreground)_4%,transparent)] ${
                      isSelect ? "w-11 !px-1 text-center" : ""
                    } ${
                      isCompactTableColumn(header.column.id) && !isSelect ? "!px-1.5 sm:!px-2" : ""
                    } ${
                      isFirst ? "rounded-s-xl sm:rounded-s-2xl" : ""
                    } ${
                      isLast ? "rounded-e-xl sm:rounded-e-2xl" : ""
                    } ${
                      header.column.getCanSort() ? "cursor-pointer select-none hover:bg-primary/90 transition-colors" : ""
                    }`}
                  >
                    {header.isPlaceholder ? null : (
                      <div className={`flex items-center gap-2 ${isSelect ? "justify-center" : "justify-between"}`}>
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && !isSelect && <SortIcon column={header.column} />}
                        </span>
                      </div>
                    )}
                    {header.column.getCanResize() && (
                      <div
                        role="presentation"
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onClick={(event) => event.stopPropagation()}
                        className={`absolute end-0 top-0 h-full w-3 touch-none ${header.column.getIsResizing() ? "bg-primary-foreground/20" : "cursor-col-resize hover:bg-primary-foreground/10"}`}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={selectedColumns.length + 1} className="px-0 py-0">
                  <div className="rounded-2xl">
                    <SkeletonRow cols={selectedColumns.length} />
                  </div>
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={selectedColumns.length + 1}>
                <EmptyState />
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => {
              const selected = row.getIsSelected();
              return (
                <tr key={row.id} className="group">
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isFirst = cellIndex === 0;
                    const isLast = cellIndex === row.getVisibleCells().length - 1;
                    const isCompact = isCompactTableColumn(cell.column.id);
                    return (
                      <td
                        key={cell.id}
                        style={{
                          ...getColumnWidthStyle(cell.column.id, cell.column.getSize()),
                          boxSizing: "border-box",
                          ...(cell.column.id === "actions"
                            ? { position: "sticky", right: 0, zIndex: 10, overflow: "visible" }
                            : { overflow: "hidden" }),
                        }}
                        className={`relative ${cellBase} ${cellHover} ${selected ? cellSelected : "bg-panel"} ${
                          isFirst ? "rounded-s-xl sm:rounded-s-2xl" : ""
                        } ${isLast ? "rounded-e-xl sm:rounded-e-2xl" : ""} ${
                          cell.column.id === "actions" ? "bg-panel" : ""
                        } ${
                          cell.column.id === "select" ? "!px-1" : isCompact ? "!px-1.5 sm:!px-2" : ""
                        }`}
                      >
                        {cellIndex === 1 && (
                          <div
                            className={`absolute start-1.5 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-all duration-200 ${
                              selected ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                            }`}
                          />
                        )}
                        {cell.column.id === "quick_view" ? (
                          <button
                            type="button"
                            onClick={() => onQuickView(row.original)}
                            className="flex size-7 items-center justify-center rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                            aria-label="Quick view"
                          >
                            <Eye width={13} height={13} />
                          </button>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
