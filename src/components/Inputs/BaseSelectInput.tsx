import { useState, useEffect, useRef, useId, useCallback } from "react";
import type { ComponentType } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import api from "../../lib/axios";

export interface SelectOption { id: string | number; name: string; slug?: string; }

interface BaseSelectInputProps {
  name: string; label?: string; placeholder?: string;
  items?: Array<{ id: string | number; name?: string; title?: string; slug?: string }>;
  url?: string; itemValue?: string;
  itemLabel?: string | ((item: any) => string);
  optionMapper?: (item: any) => SelectOption;
  value?: SelectOption | SelectOption[] | null;
  onChange?: (value: SelectOption | SelectOption[] | null) => void;
  multiple?: boolean; disabled?: boolean; error?: string; touched?: boolean;
  prependInputIcon?: ComponentType<any>;
}

export function BaseSelectInput({ name, label, items = [], url, itemValue = "id", itemLabel, optionMapper, value, onChange, multiple = false, disabled = false, error, touched = false, prependInputIcon: PrependIcon }: BaseSelectInputProps) {
  const uid = useId();
  const id = `${uid}-${name}`;
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const hasError = touched && !!error;

  const mapOption = useCallback((item: any): SelectOption => {
    if (optionMapper) return optionMapper(item);
    const oid = item[itemValue] ?? item.id;
    let oname = item.name || item.title;
    if (!oname && itemLabel) oname = typeof itemLabel === "function" ? itemLabel(item) : item[itemLabel];
    if (!oname && (item.full_name || item.first_name || item.last_name)) oname = item.full_name || `${item.first_name || ""} ${item.last_name || ""}`.trim();
    return { id: oid, name: oname as string, slug: item.slug || undefined };
  }, [itemValue, itemLabel, optionMapper]);

  useEffect(() => { if (items.length > 0) setOptions(items.map(mapOption)); }, [items, mapOption]);

  const fetchOptions = useCallback(async () => {
    if (!url || url.includes("undefined") || options.length > 0) return;
    try { setLoading(true); const res = await api.get(url); setOptions((res.data?.data ?? []).map(mapOption)); }
    catch { setOptions([]); } finally { setLoading(false); }
  }, [url, options.length, mapOption]);

  useEffect(() => { if (url) setOptions([]); }, [url]);
  useEffect(() => { if (!url || url.includes("undefined") || options.length > 0) return; fetchOptions(); }, [url, options.length, fetchOptions]);

  const handleOpen = () => { if (disabled) return; if (!isOpen) fetchOptions(); setIsOpen((v) => !v); };

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const isSelected = (opt: SelectOption) => multiple ? (value as SelectOption[] | null)?.some((v) => v.id === opt.id) ?? false : (value as SelectOption | null)?.id === opt.id;
  const handleSelect = (opt: SelectOption) => {
    if (multiple) { const cur = (value as SelectOption[]) ?? []; onChange?.(cur.some((v) => v.id === opt.id) ? cur.filter((v) => v.id !== opt.id) : [...cur, opt]); }
    else { onChange?.(opt); setIsOpen(false); }
  };
  const handleClear = (e: React.MouseEvent) => { e.stopPropagation(); onChange?.(multiple ? [] : null); };
  const displayText = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    if (multiple) { const arr = value as SelectOption[]; return arr.length < 4 ? arr.map((v) => v.name).join(", ") : `${arr.length} selected`; }
    return (value as SelectOption).name;
  };
  const display = displayText();

  const wrapperCls = ["relative rounded-xl border overflow-hidden transition-all duration-200",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    hasError ? "bg-red-50/40 dark:bg-red-950/10 border-red-400"
      : isOpen ? "bg-white dark:bg-slate-800/60 border-app-accent shadow-[0_0_0_3px_rgba(107,56,248,0.12)]"
      : "bg-white dark:bg-slate-800/40 border-border hover:border-app-accent/40"].filter(Boolean).join(" ");

  return (
    <div className="space-y-1">
      <div className="relative" ref={ref}>
        {label && <label htmlFor={id} className={["block mb-1.5 text-sm font-medium select-none", hasError ? "text-red-500" : "text-text"].join(" ")}>{label}</label>}
        <div className={wrapperCls}>
          {PrependIcon && <span className="pointer-events-none absolute inset-y-0 inset-s-0 flex w-11 items-center justify-center z-10"><PrependIcon size={15} className={hasError ? "text-red-400" : isOpen ? "text-app-accent" : "text-app-muted/50"} /></span>}
          <button id={id} type="button" disabled={disabled} onClick={handleOpen} className={["flex w-full items-center gap-2 h-11 outline-none transition-all duration-200 py-0 px-4", PrependIcon ? "ps-11" : "", disabled ? "cursor-not-allowed" : "cursor-pointer"].filter(Boolean).join(" ")}>
            <span className="flex-1 truncate text-start text-sm">{display ? <span className="text-text">{display}</span> : <span className="text-transparent select-none">·</span>}</span>
            {display && !disabled && <span role="button" tabIndex={0} onClick={handleClear} className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X size={11} className="text-app-muted" /></span>}
            <ChevronDown size={15} className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${hasError ? "text-red-400" : "text-app-muted/60"}`} />
          </button>
        </div>
        {isOpen && (
          <div className="absolute top-full z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-border bg-white dark:bg-slate-900 shadow-xl shadow-slate-950/10">
            <div className="max-h-56 overflow-y-auto py-1.5">
              {loading ? <p className="px-4 py-2.5 text-sm text-app-muted">Loading…</p>
                : options.length === 0 ? <p className="px-4 py-2.5 text-sm text-app-muted">No options</p>
                : options.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => handleSelect(opt)} className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isSelected(opt) ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 font-medium" : "text-text hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${isSelected(opt) ? "bg-purple-600 border-purple-600" : "border-border"}`}>{isSelected(opt) && <Check size={10} className="text-white" />}</span>
                    <span className="flex-1 truncate">{opt.name}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
      {hasError && <p className="flex items-center gap-1.5 px-1 text-xs text-red-500"><span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" />{error}</p>}
    </div>
  );
}
