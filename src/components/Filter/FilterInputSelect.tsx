import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ComponentType } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import api from "../../lib/axios";

export interface SelectOption { id: string | number; name: string; }
export interface FilterSelectItem {
  key: string; placeholder?: string; multiple?: boolean;
  items?: Array<{ id: string | number; name?: string; title?: string }>;
  url?: string;
  prependInputIcon?: ComponentType<{ size?: number | string; className?: string; [key: string]: any }>;
}

function getParam(key: string) { return new URLSearchParams(window.location.search).get(key) ?? ""; }
function pushParam(key: string, value: string) {
  const p = new URLSearchParams(window.location.search);
  if (value) { p.set(key, value); p.set("page", "1"); } else { p.delete(key); }
  window.history.pushState({}, "", `${window.location.pathname}?${p.toString()}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function FilterInputSelect({ item }: { item: FilterSelectItem }) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const PrependIcon = item.prependInputIcon;
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SelectOption | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  useEffect(() => { if (item.items?.length) setOptions(item.items.map((i) => ({ id: i.id, name: (i.name ?? i.title ?? "") as string }))); }, [item.items]);

  const fetchOptions = async () => {
    if (!item.url || options.length > 0) return;
    try { setLoading(true); const res = await api.get(item.url); setOptions((res.data?.data ?? []).map((i: any) => ({ id: i.id, name: i.name ?? i.title }))); }
    catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => {
    const sync = () => { const v = getParam(item.key); setSelected(v ? (options.find((o) => String(o.id) === v) ?? null) : null); };
    sync(); window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [item.key, options]);

  useEffect(() => {
    if (!isOpen) return;
    const update = () => { const rect = triggerRef.current?.getBoundingClientRect(); if (!rect) return; setDropdownStyle({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width }); };
    update(); window.addEventListener("scroll", update, true); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [isOpen]);

  useEffect(() => {
    const h = (e: MouseEvent) => { const target = e.target as Node; if (!triggerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) setIsOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const open = (e: React.MouseEvent) => { e.stopPropagation(); if (!isOpen) fetchOptions(); setIsOpen((v) => !v); };
  const pick = (opt: SelectOption | null) => { setSelected(opt); pushParam(item.key, opt ? String(opt.id) : ""); setIsOpen(false); };

  return (
    <div className="relative" ref={triggerRef}>
      {PrependIcon && (
        <span className="pointer-events-none absolute inset-y-0 start-0 flex w-10 items-center justify-center z-10">
          <PrependIcon size={16} className="text-muted" />
        </span>
      )}
      <button 
        type="button" 
        onClick={open} 
        className={[
          "relative flex w-full items-center gap-2 rounded-xl bg-panel-soft border text-sm text-start transition-all duration-200 cursor-pointer focus:outline-none py-2.5",
          isOpen ? "border-primary ring-2 ring-primary/20" : "border-border",
          PrependIcon ? "ps-10 pe-4" : "px-4"
        ].filter(Boolean).join(" ")}
      >
        <span className="flex-1 truncate">
          {selected ? (
            <span className="text-text">{selected.name}</span>
          ) : (
            <span className="text-muted">{item.placeholder}</span>
          )}
        </span>
        {selected && (
          <span 
            role="button" 
            tabIndex={0} 
            onClick={(e) => { e.stopPropagation(); pick(null); }} 
            className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-panel-alt transition-colors"
          >
            <X size={12} className="text-muted" />
          </span>
        )}
        <ChevronDown 
          size={16} 
          className="shrink-0 text-muted transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        />
      </button>
      {isOpen && createPortal(
        <div 
          ref={dropdownRef} 
          style={{ 
            position: "absolute", 
            top: dropdownStyle.top, 
            left: dropdownStyle.left, 
            width: dropdownStyle.width, 
            zIndex: 9999
          }} 
          className="overflow-hidden rounded-xl bg-panel border border-border shadow-lg"
        >
          <div className="max-h-52 overflow-y-auto py-1">
            {loading ? (
              <p className="px-3 py-2 text-sm text-muted">Loading…</p>
            ) : options.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted">No data</p>
            ) : (
              options.map((opt) => (
                <button 
                  key={opt.id} 
                  type="button" 
                  onClick={() => pick(opt)} 
                  className={[
                    "relative flex w-full items-center px-3 py-2 text-sm transition-colors text-start",
                    selected?.id === opt.id 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-text hover:bg-panel-alt"
                  ].join(" ")}
                >
                  <span className="flex-1 truncate">{opt.name}</span>
                  {selected?.id === opt.id && (
                    <Check size={14} className="shrink-0 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
