import { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import {
  TrashIcon as Trash2,
  Squares2X2Icon as LayoutGrid,
  Square3Stack3DIcon as Grid3X3,
  EyeIcon as Eye,
  ChevronUpIcon as ChevronUp,
  ChevronDownIcon as ChevronDown,
  ArrowsUpDownIcon as ChevronsUpDown,
  XMarkIcon as X,
  ArrowLeftIcon as ArrowLeft,
  ArrowRightIcon as ArrowRight,
} from "@heroicons/react/24/outline";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type ColumnSizingState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ModifyColumns, type TableColumn } from "./ModifyColumns";
import { EmptyState } from "./EmptyState";
import { useTranslation } from "react-i18next";

export interface TableMeta {
  total: number; current_page: number; last_page: number;
  per_page: number; from?: number; to?: number;
}
export interface TableData<T = any> { data: T[]; meta?: TableMeta; }

interface UITableProps<T = any> {
  data: TableData<T>;
  columns: TableColumn[];
  title?: string;
  loading?: boolean;
  renderCell?: (field: string, item: T, index: number) => ReactNode;
  renderQuickView?: (item: T) => ReactNode;
  filters?: ReactNode;
}

function dig(obj: any, path: string): any {
  return path.split(".").reduce((c, k) => c?.[k], obj);
}
function pageFromUrl() {
  return parseInt(new URLSearchParams(window.location.search).get("page") ?? "1", 10);
}
function setPageUrl(p: number) {
  const params = new URLSearchParams(window.location.search);
  params.set("page", String(p));
  window.history.pushState({}, "", `${window.location.pathname}?${params}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
function getDefaultColumnSize(header: string | ReactNode, index: number) {
  const label = typeof header === "string" ? header : String(header ?? "");
  const base = Math.max(120, Math.min(240, label.length * 10));
  return index === 0 ? Math.max(base, 60) : base;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-5 py-4">
      <div className="skeleton-item h-4 w-4 shrink-0 rounded-md" />
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="skeleton-item h-3.5 rounded-full"
          style={{ width: `${40 + (i % 4) * 14}%`, flex: 1 }}
        />
      ))}
    </div>
  );
}

function Pagination({
  meta, page, onPage,
}: {
  meta: TableMeta; page: number; onPage: (p: number) => void;
}) {
  if (meta.last_page <= 1) return null;

  const all = Array.from({ length: meta.last_page }, (_, i) => i + 1);
  let pages: (number | "…")[] = all;
  if (all.length > 7) {
    const l = Math.max(1, page - 2);
    const r = Math.min(meta.last_page, page + 2);
    pages = [
      ...(l > 1 ? [1, ...(l > 2 ? (["…"] as const) : [])] : []),
      ...all.slice(l - 1, r),
      ...(r < meta.last_page
        ? [...(r < meta.last_page - 1 ? (["…"] as const) : []), meta.last_page]
        : []),
    ] as (number | "…")[];
  }

  const navBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background border border-border text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:border-border disabled:hover:text-muted-foreground";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card border border-border px-5 py-4 shadow-sm">
      <p className="text-sm text-muted-foreground">
        <span className="font-bold text-foreground">
          {meta.from ?? (page - 1) * meta.per_page + 1}
        </span>
        <span className="mx-1.5">–</span>
        <span className="font-bold text-foreground">
          {meta.to ?? Math.min(page * meta.per_page, meta.total)}
        </span>
        <span className="mx-1.5 opacity-60">of</span>
        <span className="font-bold text-foreground">{meta.total}</span>
      </p>
      <div className="flex items-center gap-1.5 overflow-x-auto">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className={navBtn}>
          <ArrowLeft width={16} height={16} />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`d${i}`} className="flex h-9 w-9 shrink-0 items-center justify-center text-sm text-muted-foreground">
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums transition-all ${
                page === p
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-background border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button onClick={() => onPage(page + 1)} disabled={page >= meta.last_page} className={navBtn}>
          <ArrowRight width={16} height={16} />
        </button>
      </div>
    </div>
  );
}

export function UITable<T extends { id?: any }>({
  data, columns, title = "", loading = false, renderCell, renderQuickView, filters,
}: UITableProps<T>) {
  const { t } = useTranslation();
  const [view, setView] = useState<"table" | "grid">("table");
  const [gridCols, setGridCols] = useState<1 | 2 | 3 | 4>(3);
  const romanMap = { 1: "I", 2: "II", 3: "III", 4: "IV" } as const;
  const [page, setPage] = useState(pageFromUrl());
  const [quickItem, setQuickItem] = useState<T | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ select: true });
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
    const initial: ColumnSizingState = {};
    columns.forEach((col, index) => {
      initial[col.field] = getDefaultColumnSize(col.header, index);
    });
    return initial;
  });

  // Convert custom columns to TanStack columns
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [
      {
        id: "select",
        header: ({ table }) => {
          const checkbox = (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={table.getIsAllRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
                className="size-3.5 rounded accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
              />
              <span className="text-[11px] font-semibold text-muted/80">#</span>
            </div>
          );
          if (table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
            setTimeout(() => {
              const input = document.querySelector('thead input[type="checkbox"]') as HTMLInputElement;
              if (input) input.indeterminate = true;
            }, 0);
          }
          return checkbox;
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className="size-3.5 rounded accent-primary cursor-pointer"
            />
            <span className="text-[11px] font-semibold text-muted/80">{row.index + 1}</span>
          </div>
        ),
        size: 84,
      },
    ];

    columns.forEach((col, index) => {
      cols.push({
        id: col.field,
        accessorKey: col.field,
        header: col.header as string,
        enableSorting: col.sortable ?? false,
        size: getDefaultColumnSize(col.header, index),
        cell: ({ row, cell }) => {
          const index = row.index;
          const item = row.original;
          return renderCell ? renderCell(col.field, item, index) : String(cell.getValue() ?? "—");
        },
      });
    });

    return cols;
  }, [columns, renderCell]);

  const rows = useMemo(() => Array.isArray(data.data) ? data.data : [], [data.data]);
  const selectedCols = useMemo(
    () => columns.filter((col) => columnVisibility[col.field] !== false),
    [columns, columnVisibility],
  );

  const handleColumnSelectionChange = (nextSelected: TableColumn[]) => {
    setColumnVisibility((prev) => {
      const next: VisibilityState = { ...prev, select: true };
      columns.forEach((col) => {
        next[col.field] = nextSelected.some((selectedCol) => selectedCol.field === col.field);
      });
      return next;
    });
  };

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnSizing,
    },
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    defaultColumn: {
      minSize: 80,
      maxSize: 320,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true, // We handle pagination via URL/API
    getRowId: (row: any) => String(row.id ?? row.index),
  });

  useEffect(() => {
    setColumnVisibility((prev) => {
      const next: VisibilityState = { ...prev, select: true };
      columns.forEach((col) => {
        if (typeof next[col.field] !== "boolean") {
          next[col.field] = true;
        }
      });
      return next;
    });
  }, [columns]);
  useEffect(() => {
    setColumnSizing((prev) => {
      const next = { ...prev };
      let changed = false;
      columns.forEach((col, index) => {
        const defaultSize = getDefaultColumnSize(col.header, index);
        if (typeof next[col.field] !== "number") {
          next[col.field] = defaultSize;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [columns]);
  useEffect(() => {
    const check = () => setView(window.innerWidth < 1024 ? "grid" : "table");
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => {
    const s = () => setPage(pageFromUrl());
    window.addEventListener("popstate", s);
    return () => window.removeEventListener("popstate", s);
  }, []);

  const handlePage = (p: number) => { setPage(p); setPageUrl(p); };

  const selectedRowIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
  const selectedCount = selectedRowIds.length;

  const SortIcon = ({ column }: { column: any }) => {
    const sorted = column.getIsSorted();
    if (!sorted) return <ChevronsUpDown width={11} height={11} className="opacity-40" />;
    return sorted === "asc"
      ? <ChevronUp width={11} height={11} className="text-primary-foreground" />
      : <ChevronDown width={11} height={11} className="text-primary-foreground" />;
  };

  /* ── shared cell surface ── */
  const cellBase =
    "bg-card px-3 py-3.5 text-foreground align-middle transition-all duration-150 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-foreground)_4%,transparent)]";
  const cellHover = "group-hover:bg-card/20";
  const cellSelected = "bg-primary/10";

  return (
    <div className="space-y-3">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card border border-border px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {title && (
            <h2 className="text-base font-bold text-foreground tracking-tight">
              {t(`TITLES.${title}`)}
            </h2>
          )}
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold tabular-nums text-primary-foreground shadow-sm">
            {data.meta?.total ?? rows.length}
          </span>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2.5 rounded-full bg-destructive/10 border border-destructive/20 px-4 py-1.5">
              <span className="text-sm font-bold text-destructive tabular-nums">{selectedCount}</span>
              <button
                type="button"
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
          <ModifyColumns columns={columns} selected={selectedCols} onChange={handleColumnSelectionChange} />
          {view === "grid" && (
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-1.5 py-1.5">
              {[1, 2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => setGridCols(cols as 1 | 2 | 3 | 4)}
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
                onClick={() => setView(v)}
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

      {/* ── Table view ── */}
      {view === "table" && (
        <div className="w-full overflow-x-auto rounded-2xl">
          <table className="w-full min-w-140 border-separate border-spacing-y-1 text-sm" style={{ width: "100%", tableLayout: "fixed" }}>
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
                          width: header.getSize(),
                          minWidth: header.getSize(),
                          boxSizing: "border-box",
                          ...(header.column.id === "actions" ? { position: "sticky", right: 0, zIndex: 20 } : {}),
                        }}
                        className={`relative bg-primary/80 text-primary-foreground px-3 py-3.5 text-start text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap shadow-[0_1px_3px_color-mix(in_srgb,var(--color-foreground)_4%,transparent)] ${
                          isSelect ? "w-[84px]" : ""
                        } ${
                          isFirst ? "rounded-s-2xl" : ""
                        } ${
                          isLast ? "rounded-e-2xl" : ""
                        } ${
                          header.column.getCanSort() ? "cursor-pointer select-none hover:bg-primary/90 transition-colors" : ""
                        }`}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1">
                              {isSelect ? t("ACTIONS.select") : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <td colSpan={selectedCols.length + 1} className="px-0 py-0">
                      <div className="rounded-2xl  ">
                        <SkeletonRow cols={selectedCols.length} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={selectedCols.length + 1}>
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
                        return (
                          <td
                            key={cell.id}
                            style={{
                              width: cell.column.getSize(),
                              minWidth: cell.column.getSize(),
                              boxSizing: "border-box",
                              ...(cell.column.id === "actions" ? { position: "sticky", right: 0, zIndex: 10, overflow: "visible" } : {}),
                            }}
                            className={`${cellBase} ${cellHover} ${selected ? cellSelected : "bg-panel"} ${
                              isFirst ? "rounded-s-2xl" : ""
                            } ${isLast ? "rounded-e-2xl" : ""} ${
                              cell.column.id === "actions" ? "bg-panel" : ""
                            }`}
                          >
                            {isFirst ? (
                              <div className="flex h-full items-center">
                                <div
                                  className={`me-3 h-6 w-0.5 rounded-full bg-primary transition-all duration-200 ${
                                    selected ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                                  }`}
                                />
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            ) : cell.column.id === "quick_view" ? (
                              <button
                                type="button"
                                onClick={() => setQuickItem(row.original)}
                                className="flex size-7 items-center justify-center rounded-xl   text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
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
      )}

      {/* ── Grid view ── */}
      {view === "grid" && !loading && (
        <div>
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
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
                      {selectedCols
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
                    {selectedCols.some((c) => c.field === "actions" || c.field === "quick_view") && (
                      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
                        {selectedCols.some((c) => c.field === "actions") &&
                          renderCell && renderCell("actions", item, row.index)}
                        {selectedCols.some((c) => c.field === "quick_view") && (
                          <button
                            type="button"
                            onClick={() => setQuickItem(item)}
                            className="flex items-center gap-1.5 rounded-xl   px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border transition-all"
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
          )}
        </div>
      )}

      {/* ── Grid skeleton ── */}
      {view === "grid" && loading && (
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
      )}

      {/* ── Pagination ── */}
      {!loading && data.meta && rows.length > 0 && (
        <div className="px-1 pt-2">
          <Pagination meta={data.meta} page={page} onPage={handlePage} />
        </div>
      )}

      {/* ── Quick view modal ── */}
      {quickItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-background/70! backdrop-blur-sm"
            onClick={() => setQuickItem(null)}
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-card border border-border shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">Quick View</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Record details</p>
              </div>
              <button
                onClick={() => setQuickItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-2xl   text-muted-foreground hover:bg-muted border border-border transition-all"
                aria-label="Close"
              >
                <X width={14} height={14} />
              </button>
            </div>
            <div className="h-px bg-border mx-6" />
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {renderQuickView ? renderQuickView(quickItem) : (
                <div className="space-y-3">
                  {Object.entries(quickItem as Record<string, any>).map(([k, v]) => (
                    <div key={k} className="flex gap-4 text-sm">
                      <span className="w-28 shrink-0 font-semibold text-foreground">{k}</span>
                      <span className="text-muted-foreground break-all">
                        {typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "—")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
