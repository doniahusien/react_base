import { useState, useEffect, useRef, useCallback } from "react";
import { Phone, ChevronDown, Search, X } from "lucide-react";
import api from "../../lib/axios";
import { useTranslation } from "react-i18next";

interface Country { id: number; name: string; phone_code: string; flag: string; }

interface BasePhoneInputProps {
  phoneCode?: string; phone?: string;
  onPhoneCode: (code: string) => void; onPhone: (number: string) => void;
  label?: string; errorCode?: string; errorPhone?: string;
  touched?: boolean; disabled?: boolean;
}

export function BasePhoneInput({ phoneCode = "", phone = "", onPhoneCode, onPhone, label, errorCode, errorPhone, touched = false, disabled = false }: BasePhoneInputProps) {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const hasError = touched && !!(errorCode || errorPhone);

  const fetchCountries = useCallback(async () => {
    if (countries.length > 0) return;
    try { setLoadingCountries(true); const res = await api.get("countries?paginate=0"); setCountries((res.data?.data ?? []).map((c: any) => ({ id: c.id, name: c.name, phone_code: c.phone_code, flag: c.flag }))); }
    catch { setCountries([]); } finally { setLoadingCountries(false); }
  }, [countries.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!dropdownRef.current?.contains(e.target as Node)) { setOpen(false); setSearch(""); } };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => { if (open) { fetchCountries(); setTimeout(() => searchRef.current?.focus(), 50); } }, [open, fetchCountries]);

  const selected = countries.find((c) => c.phone_code === phoneCode);
  const filtered = search ? countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone_code.includes(search.replace(/\D/g, ""))) : countries;
  const selectCountry = (c: Country) => { onPhoneCode(c.phone_code); setOpen(false); setSearch(""); };

  const borderCls = hasError ? "border-red-400" : focused || open ? "border-app-accent shadow-[0_0_0_3px_rgba(107,56,248,0.12)]" : "border-border hover:border-app-accent/40";
  const labelCls = ["block mb-1.5 text-sm font-medium select-none", hasError ? "text-red-500" : "text-text"].join(" ");

  return (
    <div className="space-y-1">
      {label && <label className={labelCls}>{label}</label>}
      <div className="relative" ref={dropdownRef}>
        <div className={`relative flex items-stretch rounded-xl border bg-white dark:bg-slate-800/40 transition-all duration-200 overflow-hidden ${borderCls} ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
          <button type="button" onClick={() => setOpen((v) => !v)} className="flex h-11 shrink-0 items-center gap-1.5 border-e border-border px-3 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30">
            {selected ? (<><img src={selected.flag} alt={selected.name} className="h-4 w-6 rounded-sm object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /><span className="font-semibold text-text text-sm leading-none"><bdo dir="ltr">+{selected.phone_code}</bdo></span></>) : (<><Phone size={14} className="text-app-muted/60 shrink-0" /><span className="text-app-muted text-sm">+{phoneCode || "—"}</span></>)}
            <ChevronDown size={13} className={`shrink-0 text-app-muted/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
          <div className="relative flex-1">
            <input type="tel" value={phone} onChange={(e) => onPhone(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="e.g. 501234567" disabled={disabled} className="block h-11 w-full bg-transparent py-0 px-3 text-sm text-text outline-none placeholder:text-app-muted/50" />
          </div>
        </div>
        {open && (
          <div className="absolute inset-s-0 top-full z-[200] mt-1.5 w-64 overflow-hidden rounded-2xl border border-border bg-white dark:bg-slate-900 shadow-xl shadow-slate-950/10">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <Search size={13} className="shrink-0 text-app-muted/60" />
              <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("LABELS.phoneCode")} className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-app-muted/50" />
              {search && <button type="button" onClick={() => setSearch("")}><X size={12} className="text-app-muted/60 hover:text-text" /></button>}
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {loadingCountries ? <p className="px-4 py-3 text-sm text-app-muted">{t("TITLES.loading")}</p>
                : filtered.length === 0 ? <p className="px-4 py-3 text-sm text-app-muted">{t("TITLES.noResults")}</p>
                : filtered.map((c) => (
                  <button key={c.id} type="button" onClick={() => selectCountry(c)} className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors ${c.phone_code === phoneCode ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 font-medium" : "text-text hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>
                    <img src={c.flag} alt={c.name} className="h-4 w-6 rounded-sm object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="flex-1 truncate text-start">{c.name}</span>
                    <span className="shrink-0 tabular-nums text-xs text-app-muted">+{c.phone_code}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
      {hasError && <p className="flex items-center gap-1.5 px-1 text-xs text-red-500"><span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" />{errorCode || errorPhone}</p>}
    </div>
  );
}
