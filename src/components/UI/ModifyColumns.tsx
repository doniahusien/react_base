import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { SlidersVertical, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface TableColumn {
  index: number; field: string;
  header: string | ReactNode;
  sortable?: boolean;
}

interface ModifyColumnsProps {
  columns: TableColumn[]; selected: TableColumn[];
  onChange: (cols: TableColumn[]) => void;
}

export function ModifyColumns({ columns, selected, onChange }: ModifyColumnsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const checked = (col: TableColumn) => selected.some((s) => s.field === col.field);
  const toggle = (col: TableColumn) => {
    const next = checked(col) ? selected.filter((s) => s.field !== col.field) : [...selected, col].sort((a, b) => a.index - b.index);
    onChange(next);
  };
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }} className="flex items-center gap-2 rounded-full border border-border   px-3 py-2 text-sm text-text hover:border-accent transition-all duration-200">
        <SlidersVertical size={15} />
        <span className="hidden sm:inline">{t("TITLES.columns")}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 end-0 w-60 overflow-hidden rounded-2xl border border-border bg-body shadow-xl shadow-slate-950/10 z-[100]" onClick={(e) => e.stopPropagation()}>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text">{t("LABELS.columns")}</p>
            <p className="text-xs text-muted mt-0.5">{t("LABELS.columnsDesc")}</p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {columns.map((col, i) => (
              <button
                key={col.field}
                type="button"
                onClick={() => toggle(col)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-border/20 ${i % 2 === 0 ? "bg-panel/5" : ""}`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${checked(col) ? "bg-primary border-primary" : "border-border"}`}>
                  {checked(col) && <Check size={11} className="text-text" />}
                </span>
                <span className="flex-1 text-start text-text">{col.header}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
            <button onClick={() => onChange([...columns])} className="text-xs font-medium text-accent hover:text-accent-hover transition-colors">{t("ACTIONS.selectAll")}</button>
            <button onClick={() => onChange([])} className="text-xs font-medium text-muted hover:text-text transition-colors">{t("ACTIONS.deselectAll")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
