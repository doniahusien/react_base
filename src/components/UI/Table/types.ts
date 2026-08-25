import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";

export interface TableMeta {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
  from?: number;
  to?: number;
  filters?: Record<string, Array<{ value: string; label: string }>>;
  available_statuses?: string[];
}

export interface TableData<T = any> {
  data: T[];
  meta?: TableMeta;
}

export interface TableColumn {
  index?: number;
  field: string;
  header: string | ReactNode;
  sortable?: boolean;
}

export interface UITableProps<T = any> {
  data: TableData<T>;
  columns: TableColumn[];
  title?: string;
  loading?: boolean;
  renderCell?: (field: string, item: T, index: number) => ReactNode;
  renderQuickView?: (item: T) => ReactNode;
  filters?: ReactNode;
}

export type ViewMode = "table" | "grid" | "compact";
export type GridColumns = 1 | 2 | 3 | 4;

export interface TableToolbarProps<T = any> {
  title?: string;
  total: number;
  selectedCount: number;
  table: Table<T>;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  gridCols: GridColumns;
  onGridColsChange: (cols: GridColumns) => void;
  filters?: ReactNode;
  onDelete?: () => void;
}

export interface PaginationProps {
  meta: TableMeta;
  page: number;
  onPage: (page: number) => void;
}

export interface QuickViewModalProps<T = any> {
  item: T | null;
  onClose: () => void;
  renderQuickView?: (item: T) => ReactNode;
}

export interface TableViewProps<T = any> {
  table: Table<T>;
  selectedColumns: TableColumn[];
  loading: boolean;
  rows: T[];
  onQuickView: (item: T) => void;
}

export interface GridViewProps<T = any> {
  table: Table<T>;
  selectedColumns: TableColumn[];
  loading: boolean;
  rows: T[];
  gridCols: GridColumns;
  renderCell?: (field: string, item: T, index: number) => ReactNode;
  onQuickView: (item: T) => void;
}

export interface CompactViewProps<T = any> {
  table: Table<T>;
  selectedColumns: TableColumn[];
  loading: boolean;
  rows: T[];
  renderCell?: (field: string, item: T, index: number) => ReactNode;
  onQuickView: (item: T) => void;
}
