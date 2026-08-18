import { useState, useEffect, useMemo } from "react";
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
import { pageFromUrl, setPageUrl, getDefaultColumnSize } from "./utils";
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
  const [view, setView] = useState<ViewMode>("table");
  const [gridCols, setGridCols] = useState<GridColumns>(3);
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
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="size-3.5 cursor-pointer rounded accent-primary opacity-60 transition-opacity hover:opacity-100"
              aria-label={t("ACTIONS.selectAll")}
            />
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
            <span className="text-[11px] font-semibold text-muted-foreground/80">{row.index + 1}</span>
          </div>
        ),
        size: 60,
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
    manualPagination: true,
    getRowId: (row: any) => String(row.id ?? row.index),
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
        // Force grid view on mobile (sm breakpoint)
        setView("grid");
        setGridCols(1); // Single column on mobile
      } else if (window.innerWidth < 768) {
        // Grid view on small tablets
        setView("grid");
        setGridCols(2); // Two columns on small tablets
      } else if (window.innerWidth < 1024) {
        // Grid view on tablets
        setView("grid");
        setGridCols(2); // Two columns on tablets
      }
      // Allow user choice on desktop (lg+)
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Handle URL-based pagination
  useEffect(() => {
    const handlePopState = () => setPage(pageFromUrl());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handlePage = (p: number) => {
    setPage(p);
    setPageUrl(p);
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
