import { useState, useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";

export interface FilterTextItem {
  key: string; placeholder?: string;
  prependInputIcon?: ComponentType<{ size?: number | string; className?: string; [key: string]: any }>;
  appendInputIcon?: ComponentType<{ size?: number | string; className?: string; [key: string]: any }>;
}

function getParam(key: string) { return new URLSearchParams(window.location.search).get(key) ?? ""; }
function pushParam(key: string, value: string) {
  const p = new URLSearchParams(window.location.search);
  value ? p.set(key, value) : p.delete(key); p.delete("page");
  window.history.pushState({}, "", `${window.location.pathname}?${p.toString()}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function FilterInputText({ item }: { item: FilterTextItem }) {
  const { t } = useTranslation();
  const [val, setVal] = useState(getParam(item.key));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const PrependIcon = item.prependInputIcon;
  const AppendIcon = item.appendInputIcon;

  useEffect(() => {
    const sync = () => setVal(getParam(item.key));
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [item.key]);

  const placeholder = item.placeholder ? t("TITLES.search", { count: t(`TITLES.${item.placeholder}`) as any }) : "";

  const onInput = (v: string) => {
    setVal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => pushParam(item.key, v), 600);
  };

  return (
    <div className="relative">
      {PrependIcon && (
        <span className="pointer-events-none absolute inset-y-0 start-0 flex w-10 items-center justify-center">
          <PrependIcon size={16} className="text-muted" />
        </span>
      )}
      <input 
        type="text" 
        placeholder={placeholder} 
        value={val} 
        onChange={(e) => onInput(e.target.value)} 
        autoComplete="off"
        className={[
          "w-full rounded-xl   border border-border text-sm text-text placeholder:text-muted outline-none transition-all duration-200",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          PrependIcon ? "ps-10 pe-4 py-2.5" : "px-4 py-2.5",
          AppendIcon ? "pe-10" : ""
        ].filter(Boolean).join(" ")}
      />
      {AppendIcon && (
        <span className="pointer-events-none absolute inset-y-0 end-0 flex w-10 items-center justify-center">
          <AppendIcon size={16} className="text-muted" />
        </span>
      )}
    </div>
  );
}
