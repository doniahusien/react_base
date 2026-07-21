import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FilterInputText, type FilterTextItem } from "./FilterInputText";
import { FilterInputSelect, type FilterSelectItem } from "./FilterInputSelect";

export type FilterItem =
  | ({ type: "text" } & FilterTextItem)
  | ({ type: "select" } & FilterSelectItem);

interface FilterProps { items: FilterItem[]; defaultOpen?: boolean; }

export function Filter({ items, defaultOpen = true }: FilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-body overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5">
        <div className="flex items-center gap-2 text-sm font-medium text-text"><SlidersHorizontal size={15} className="text-accent" /><span>{t("TITLES.filters")}</span></div>
        <ChevronDown size={16} className={`text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="border-t border-border px-4 py-3">
            <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2">
              {items.map((item) => (
                <div key={item.key}>
                  {item.type === "text"   && <FilterInputText   item={item} />}
                  {item.type === "select" && <FilterInputSelect item={item} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
