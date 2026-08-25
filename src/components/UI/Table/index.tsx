import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type ColumnSizingState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { TableToolbar } from "./TableToolbar";
import { TableView } from "./TableView";
import { GridView } from "./GridView";
import { CompactView } from "./CompactView";
import { Pagination } from "./Pagination";
import { QuickViewModal } from "./QuickViewModal";
import { getDefaultColumnSize } from "./utils";
import type { UITableProps, TableColumn, ViewMode, GridColumns } from "./types";

export * from "./types";

export function UITable<T extends { id?: any }>({
  data,
  columns,
  title = "",
  loading = false,
  renderCell,
  renderQuickView,
  filters,
}: UITableProps<T>) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const [view, setView] = useState<ViewMode>("table");
  const [gridCols, setGridCols] = useState<GridColumns>(3);
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
        header: () => (
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest opacity-80">
            #
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-[11px] font-semibold tabular-nums text-muted-foreground/80">
            {row.index + 1}
          </span>
        ),
        size: 48,
        enableSorting: false,
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
  }, [columns, renderCell, t]);

  const rows = useMemo(() => Array.isArray(data.data) ? data.data : [], [data.data]);

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnSizing,
    },
    enableRowSelection: false,
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
    manualPagination: true,
    getRowId: (row: any) => String(row._rowKey ?? row.id ?? row.index),
  });

  // Initialize column visibility
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

  // Initialize column sizing
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

  // Handle responsive view switching - force grid on mobile
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 640) {
        setView("grid");
        setGridCols(1);
      } else if (window.innerWidth < 768) {
        setView("grid");
        setGridCols(2);
      } else if (window.innerWidth < 1024) {
        setView("grid");
        setGridCols(2);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Ensure list URLs always include ?page=1 (or current page)
  useEffect(() => {
    if (searchParams.has("page")) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", "1");
        return next;
      },
      { replace: true }
    );
  }, [searchParams, setSearchParams]);

  const handlePage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(p));
      return next;
    });
  };

  const selectedRowIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
  const selectedCount = selectedRowIds.length;

  // Get visible columns for rendering
  const visibleColumns = useMemo(
    () => columns.filter((col) => columnVisibility[col.field] !== false),
    [columns, columnVisibility]
  );

  return (
    <div className="space-y-3">
      <TableToolbar
        title={title}
        total={data.meta?.total ?? rows.length}
        selectedCount={selectedCount}
        table={table}
        view={view}
        onViewChange={setView}
        gridCols={gridCols}
        onGridColsChange={setGridCols}
        filters={filters}
      />

      {view === "table" ? (
        <TableView
          table={table}
          selectedColumns={visibleColumns}
          loading={loading}
          rows={rows}
          onQuickView={setQuickItem}
        />
      ) : view === "grid" ? (
        <GridView
          table={table}
          selectedColumns={visibleColumns}
          loading={loading}
          rows={rows}
          gridCols={gridCols}
          renderCell={renderCell}
          onQuickView={setQuickItem}
        />
      ) : (
        <CompactView
          table={table}
          selectedColumns={visibleColumns}
          loading={loading}
          rows={rows}
          renderCell={renderCell}
          onQuickView={setQuickItem}
        />
      )}

      {!loading && data.meta && rows.length > 0 && (
        <div className="px-1 pt-2">
          <Pagination meta={data.meta} page={page} onPage={handlePage} />
        </div>
      )}

      <QuickViewModal
        item={quickItem}
        onClose={() => setQuickItem(null)}
        renderQuickView={renderQuickView}
      />
    </div>
  );
}
