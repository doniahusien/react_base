import { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Trash2, LayoutGrid, Grid3X3, Eye, ChevronUp, ChevronDown, ChevronsUpDown, X, ArrowLeft, ArrowRight } from "lucide-react";
import { ModifyColumns, type TableColumn } from "./ModifyColumns";
import { EmptyState } from "./EmptyState";
import { useTranslation } from "react-i18next";

export interface TableMeta { total: number; current_page: number; last_page: number; per_page: number; from?: number; to?: number; }
export interface TableData<T = any> { data: T[]; meta?: TableMeta; }

interface UITableProps<T = any> {
  data: TableData<T>; columns: TableColumn[]; title?: string; loading?: boolean;
  renderCell?: (field: string, item: T, index: number) => ReactNode;
  renderQuickView?: (item: T) => ReactNode;
}

function dig(obj: any, path: string): any { return path.split(".").reduce((c, k) => c?.[k], obj); }
function pageFromUrl() { return parseInt(new URLSearchParams(window.location.search).get("page") ?? "1", 10); }
function setPageUrl(p: number) { const params = new URLSearchParams(window.location.search); params.set("page", String(p)); window.history.pushState({}, "", `${window.location.pathname}?${params}`); window.dispatchEvent(new PopStateEvent("popstate")); }

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-5 py-4">
      <div className="skeleton-item h-4 w-4 shrink-0 rounded-md" />
      {Array.from({ length: cols }).map((_, i) => <div key={i} className="skeleton-item h-3.5 rounded-full" style={{ width: `${40 + (i % 4) * 14}%`, flex: 1 }} />)}
    </div>
  );
}

function Pagination({ meta, page, onPage }: { meta: TableMeta; page: number; onPage: (p: number) => void; }) {
  if (meta.last_page <= 1) return null;
  const all = Array.from({ length: meta.last_page }, (_, i) => i + 1);
  let pages: (number | "…")[] = all;
  if (all.length > 7) {
    const l = Math.max(1, page - 2), r = Math.min(meta.last_page, page + 2);
    pages = [...(l > 1 ? [1, ...(l > 2 ? (["…"] as const) : [])] : []), ...all.slice(l - 1, r), ...(r < meta.last_page ? [...(r < meta.last_page - 1 ? (["…"] as const) : []), meta.last_page] : [])] as (number | "…")[];
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-app-muted"><span className="font-semibold text-text">{meta.from ?? (page - 1) * meta.per_page + 1}</span><span className="mx-1">–</span><span className="font-semibold text-text">{meta.to ?? Math.min(page * meta.per_page, meta.total)}</span><span className="mx-1 opacity-50">of</span><span className="font-semibold text-text">{meta.total}</span></p>
      <div className="flex items-center gap-1 overflow-x-auto">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-app-muted transition-all hover:bg-purple-50 hover:text-purple-600 disabled:opacity-25 disabled:cursor-not-allowed dark:hover:bg-purple-950/30"><ArrowLeft size={14} /></button>
        {pages.map((p, i) => p === "…" ? <span key={`d${i}`} className="flex h-8 w-8 shrink-0 items-center justify-center text-xs text-app-muted">···</span> : <button key={p} onClick={() => onPage(p as number)} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition-all ${page === p ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30" : "text-app-muted hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/30"}`}>{p}</button>)}
        <button onClick={() => onPage(page + 1)} disabled={page >= meta.last_page} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-app-muted transition-all hover:bg-purple-50 hover:text-purple-600 disabled:opacity-25 disabled:cursor-not-allowed dark:hover:bg-purple-950/30"><ArrowRight size={14} /></button>
      </div>
    </div>
  );
}

export function UITable<T extends { id?: any }>({ data, columns, title = "", loading = false, renderCell, renderQuickView }: UITableProps<T>) {
  const { t } = useTranslation();
  const [selectedCols, setSelectedCols] = useState<TableColumn[]>(columns);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [view, setView] = useState<"table" | "grid">("table");
  const [sort, setSort] = useState<{ field: string; dir: "asc" | "desc" | null }>({ field: "", dir: null });
  const [page, setPage] = useState(pageFromUrl());
  const [quickItem, setQuickItem] = useState<T | null>(null);

  useEffect(() => setSelectedCols(columns), [columns]);
  useEffect(() => {
    const check = () => setView(window.innerWidth < 1024 ? "grid" : "table");
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => { const s = () => setPage(pageFromUrl()); window.addEventListener("popstate", s); return () => window.removeEventListener("popstate", s); }, []);

  const handlePage = (p: number) => { setPage(p); setPageUrl(p); };
  const handleSort = (field: string) => { setSort((prev) => ({ field, dir: prev.field === field ? prev.dir === "asc" ? "desc" : prev.dir === "desc" ? null : "asc" : "asc" })); };

  const rows = useMemo(() => {
    const list = Array.isArray(data.data) ? data.data : [];
    if (!sort.field || !sort.dir) return list;
    return [...list].sort((a, b) => { const av = dig(a, sort.field), bv = dig(b, sort.field); if (av == null) return 1; if (bv == null) return -1; const c = String(av).localeCompare(String(bv), undefined, { numeric: true }); return sort.dir === "asc" ? c : -c; });
  }, [data.data, sort]);

  const allSelected = rows.length > 0 && selectedRows.length === rows.length;
  const toggleAll = () => setSelectedRows(allSelected ? [] : rows.map((r: any) => r.id));
  const toggleRow = (id: any) => setSelectedRows((p) => (p.includes(id) ? p.filter((r) => r !== id) : [...p, id]));

  const SortIcon = ({ field }: { field: string }) => {
    if (sort.field !== field || !sort.dir) return <ChevronsUpDown size={11} className="opacity-20" />;
    return sort.dir === "asc" ? <ChevronUp size={11} className="text-purple-500" /> : <ChevronDown size={11} className="text-purple-500" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {title && <span className="text-sm font-bold text-text tracking-tight">{t(`TITLES.${title}`)}</span>}
          <span className="rounded-lg bg-purple-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">{data.meta?.total ?? rows.length}</span>
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 px-3 py-1.5">
              <span className="text-xs font-semibold text-red-500">{selectedRows.length}</span>
              <button type="button" className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"><Trash2 size={11} />{t("ACTIONS.delete")}</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ms-auto">
          <ModifyColumns columns={columns} selected={selectedCols} onChange={setSelectedCols} />
          <div className="flex items-center gap-0.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 p-1">
            {(["table", "grid"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`rounded-lg p-1.5 transition-all duration-200 ${view === v ? "bg-white dark:bg-slate-700 text-purple-600 shadow-sm" : "text-app-muted hover:text-text"}`} aria-label={`${v} view`}>
                {v === "table" ? <LayoutGrid size={14} /> : <Grid3X3 size={14} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "table" && (
        <div className="w-full overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[560px] border-separate border-spacing-y-1 text-sm">
            <thead>
              <tr>
                <th className="w-10 px-3 pb-2 text-start"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-3.5 w-3.5 rounded accent-purple-600 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" /></th>
                {selectedCols.map((col) => (
                  <th key={col.field} onClick={() => col.sortable && handleSort(col.field)} className={`px-3 pb-2 text-start text-[10px] font-extrabold uppercase tracking-widest text-app-muted whitespace-nowrap ${col.sortable ? "cursor-pointer select-none hover:text-purple-500 transition-colors" : ""}`}>
                    <span className="inline-flex items-center gap-1">{col.header}{col.sortable && <SortIcon field={col.field} />}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => <tr key={i}><td colSpan={selectedCols.length + 1} className="px-0 py-0"><div className="rounded-2xl bg-white/60 dark:bg-slate-800/30"><SkeletonRow cols={selectedCols.length} /></div></td></tr>)
              ) : rows.length === 0 ? (
                <tr><td colSpan={selectedCols.length + 1}><EmptyState /></td></tr>
              ) : rows.map((item: any, idx) => {
                const selected = selectedRows.includes(item.id);
                return (
                  <tr key={item.id ?? idx} className="group">
                    <td className="w-10 rounded-s-2xl bg-white/70 dark:bg-slate-800/40 px-3 py-0 align-middle group-hover:bg-white dark:group-hover:bg-slate-800/70 transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ ...(selected ? { background: "rgba(139,92,246,0.07)" } : {}) }}>
                      <div className="flex h-full items-center py-3.5">
                        <div className={`me-3 h-6 w-0.5 rounded-full transition-all duration-200 ${selected ? "bg-purple-500 opacity-100" : "bg-purple-400 opacity-0 group-hover:opacity-40"}`} />
                        <input type="checkbox" checked={selected} onChange={() => toggleRow(item.id)} className="size-3.5 rounded accent-purple-600 cursor-pointer" />
                      </div>
                    </td>
                    {selectedCols.map((col, ci) => {
                      const isLast = ci === selectedCols.length - 1;
                      return (
                        <td key={col.field} className={`bg-white/70 dark:bg-slate-800/40 px-3 py-3.5 text-text align-middle group-hover:bg-white dark:group-hover:bg-slate-800/70 transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${isLast ? "rounded-e-2xl" : ""}`} style={{ ...(selected ? { background: "rgba(139,92,246,0.07)" } : {}) }}>
                          {col.field === "quick_view" ? <button type="button" onClick={() => setQuickItem(item)} className="flex size-7 items-center justify-center rounded-xl bg-slate-100/80 text-app-muted hover:bg-purple-100 hover:text-purple-600 dark:bg-slate-700/60 dark:hover:bg-purple-950/40 transition-all" aria-label="Quick view"><Eye size={13} /></button>
                            : renderCell ? renderCell(col.field, item, idx)
                            : <span className="text-sm">{String(dig(item, col.field) ?? "—")}</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === "grid" && !loading && (
        <div>
          {rows.length === 0 ? <EmptyState /> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((item: any, idx) => {
                const selected = selectedRows.includes(item.id);
                return (
                  <div key={item.id ?? idx} className={`group flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${selected ? "bg-purple-50/80 dark:bg-purple-950/20 ring-1 ring-purple-300/60 dark:ring-purple-700/50" : "bg-white/80 dark:bg-slate-800/40 shadow-sm"}`}>
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100/80 dark:border-slate-700/30">
                      <input type="checkbox" checked={selected} onChange={() => toggleRow(item.id)} className="size-3.5 rounded accent-purple-600 cursor-pointer" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-app-muted"># {item.id}</span>
                    </div>
                    <div className="flex-1 space-y-0">
                      {selectedCols.filter((c) => c.field !== "quick_view" && c.field !== "actions").map((col) => (
                        <div key={col.field} className="px-4 py-2.5">
                          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-app-muted/60">{col.header}</p>
                          <div className="text-sm text-text">{renderCell ? renderCell(col.field, item, idx) : <span className="line-clamp-2">{String(dig(item, col.field) ?? "—")}</span>}</div>
                        </div>
                      ))}
                    </div>
                    {selectedCols.some((c) => c.field === "actions" || c.field === "quick_view") && (
                      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-100/80 dark:border-slate-700/30">
                        {selectedCols.some((c) => c.field === "actions") && renderCell && renderCell("actions", item, idx)}
                        {selectedCols.some((c) => c.field === "quick_view") && <button type="button" onClick={() => setQuickItem(item)} className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-app-muted hover:bg-purple-100 hover:text-purple-600 dark:bg-slate-700/50 dark:hover:bg-purple-950/40 transition-all"><Eye size={12} />View</button>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === "grid" && loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="rounded-2xl bg-white/60 dark:bg-slate-800/30 p-4 space-y-3"><div className="skeleton-item h-3.5 rounded-full w-1/3" /><div className="skeleton-item h-3 rounded-full w-4/5" /><div className="skeleton-item h-3 rounded-full w-2/3" /><div className="skeleton-item h-3 rounded-full w-3/4" /></div>)}
        </div>
      )}

      {!loading && data.meta && rows.length > 0 && <div className="px-1 pt-2"><Pagination meta={data.meta} page={page} onPage={handlePage} /></div>}

      {quickItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-md" onClick={() => setQuickItem(null)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between px-6 py-4"><div><h2 className="text-sm font-bold text-text">Quick View</h2><p className="text-xs text-app-muted mt-0.5">Record details</p></div><button onClick={() => setQuickItem(null)} className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-100 text-app-muted hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all" aria-label="Close"><X size={14} /></button></div>
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-6" />
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {renderQuickView ? renderQuickView(quickItem) : (
                <div className="space-y-3">
                  {Object.entries(quickItem as Record<string, any>).map(([k, v]) => (
                    <div key={k} className="flex gap-4 text-sm"><span className="w-28 shrink-0 font-semibold text-text">{k}</span><span className="text-app-muted break-all">{typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "—")}</span></div>
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
