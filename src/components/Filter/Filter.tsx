import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { ComponentType } from "react";
import { BaseSelectInput } from "../Inputs/BaseSelectInput";

export interface FilterCheckboxOption {
  id: string | number;
  label: string;
  checked?: boolean;
}

export interface FilterItem {
  key: string;
  label?: string;
  type?: "checkbox" | "radio" | "select" | "text";
  options?: FilterCheckboxOption[];
  placeholder?: string;
  prependInputIcon?: ComponentType<{
    size?: number | string;
    width?: number | string;
    height?: number | string;
    className?: string;
    [key: string]: any;
  }>;
}

export interface FilterSection {
  key: string;
  label: string;
  icon?: ComponentType<{
    size?: number | string;
    width?: number | string;
    height?: number | string;
    className?: string;
    [key: string]: any;
  }>;
  type: "checkbox" | "radio" | "select" | "text";
  options?: FilterCheckboxOption[];
  defaultOpen?: boolean;
  placeholder?: string;
  items?: Array<{ id: string | number; name?: string; title?: string }>;
  url?: string;
}

interface FilterProps {
  sections?: FilterSection[];
  items?: FilterItem[];
  onApply?: () => void;
  onClear?: () => void;
  triggerButton?: React.ReactNode;
}

const fieldControlClasses =
  "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-all hover:border-primary/50 hover:bg-muted focus:border-primary focus:ring-2 focus:ring-primary/20";

const actionButtonClasses =
  "flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95";

function valuesFromParams(
  sections: FilterSection[],
  params: URLSearchParams
): Record<string, string> {
  const values: Record<string, string> = {};
  sections.forEach((section) => {
    const value = params.get(section.key);
    if (value) values[section.key] = value;
  });
  return values;
}

function FilterSectionComponent({
  section,
  tempValues,
  onTempChange,
}: {
  section: FilterSection;
  tempValues: Record<string, string>;
  onTempChange: (key: string, value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? true);
  const Icon = section.icon;

  const handleRadioChange = (optionId: string | number) => {
    onTempChange(section.key, String(optionId));
  };

  const handleCheckboxChange = (optionId: string | number, checked: boolean) => {
    const currentValue = tempValues[section.key] || "";
    const values = currentValue ? currentValue.split(",") : [];

    if (checked) {
      if (!values.includes(String(optionId))) values.push(String(optionId));
    } else {
      const index = values.indexOf(String(optionId));
      if (index > -1) values.splice(index, 1);
    }

    onTempChange(section.key, values.join(","));
  };

  const isRadioSelected = (optionId: string | number) =>
    tempValues[section.key] === String(optionId);

  const isCheckboxChecked = (optionId: string | number) => {
    const currentValue = tempValues[section.key] || "";
    return currentValue.split(",").includes(String(optionId));
  };

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="group flex w-full items-center justify-between rounded-xl border border-transparent px-4 py-2.5 text-left text-sm transition-all hover:border-primary/50 hover:bg-muted"
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="relative">
              <Icon
                width={18}
                height={18}
                className="text-primary transition-transform group-hover:scale-110"
              />
              {tempValues[section.key] && (
                <span className="absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-primary" />
              )}
            </div>
          )}
          <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-foreground">
            {section.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {tempValues[section.key] && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {section.type === "radio"
                ? "1"
                : tempValues[section.key].split(",").filter(Boolean).length}
            </span>
          )}
          {isOpen ? (
            <ChevronUpIcon className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
          )}
        </div>
      </button>

      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {section.type === "radio" && section.options && (
            <div className="space-y-2.5 px-5 pb-4">
              {section.options.map((option, index) => (
                <label
                  key={option.id}
                  className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-all hover:bg-muted"
                  style={{
                    animation: isOpen
                      ? `filterOptionSlide 0.3s ease-out ${index * 0.05}s both`
                      : "none",
                  }}
                >
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      name={section.key}
                      checked={isRadioSelected(option.id)}
                      onChange={() => handleRadioChange(option.id)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-border bg-card transition-all checked:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="pointer-events-none absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-primary opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {section.type === "checkbox" && section.options && (
            <div className="space-y-2.5 px-5 pb-4">
              {section.options.map((option, index) => (
                <label
                  key={option.id}
                  className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-all hover:bg-muted"
                  style={{
                    animation: isOpen
                      ? `filterOptionSlide 0.3s ease-out ${index * 0.05}s both`
                      : "none",
                  }}
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={isCheckboxChecked(option.id)}
                      onChange={(e) =>
                        handleCheckboxChange(option.id, e.target.checked)
                      }
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-border bg-card transition-all checked:border-primary checked:bg-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <CheckIcon className="pointer-events-none absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 scale-0 text-primary-foreground opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {section.type === "select" && (
            <div className="px-5 pb-4">
              <BaseSelectInput
                name={section.key}
                items={section.items?.map((item) => ({
                  id: item.id,
                  name: item.name || item.title || String(item.id),
                })) || []}
                value={tempValues[section.key] ? { id: tempValues[section.key], name: section.items?.find(i => String(i.id) === tempValues[section.key])?.name || section.items?.find(i => String(i.id) === tempValues[section.key])?.title || tempValues[section.key] } : null}
                onChange={(val) => {
                  if (val && !Array.isArray(val)) {
                    onTempChange(section.key, String(val.id));
                  } else {
                    onTempChange(section.key, "");
                  }
                }}
                placeholder={section.placeholder || "Select..."}
              />
            </div>
          )}

          {section.type === "text" && (
            <div className="px-5 pb-4">
              <input
                type="text"
                placeholder={section.placeholder}
                value={tempValues[section.key] || ""}
                onChange={(e) => onTempChange(section.key, e.target.value)}
                className={`${fieldControlClasses} placeholder:text-muted-foreground`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Filter({
  sections,
  items,
  onApply,
  onClear,
  triggerButton,
}: FilterProps) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [tempValues, setTempValues] = useState<Record<string, string>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const sectionKeys = (sections ?? items ?? []).map((s) => s.key).join("|");
  const isRTL = (i18n.language || "ar").startsWith("ar");

  const normalizedSections: FilterSection[] = useMemo(
    () =>
      sections ??
      items?.map((item) => ({
        key: item.key,
        label: item.label ?? item.key,
        type: item.type ?? "text",
        placeholder: item.placeholder,
        options: item.options,
        icon: item.prependInputIcon,
        defaultOpen: true,
      })) ??
      [],
    // Recompute only when keys change — labels/options refresh via parent remount is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sectionKeys, sections, items]
  );

  const activeFilterCount = Object.values(tempValues).filter(Boolean).length;

  // Sync draft values from the real URL (mount + external URL changes)
  useEffect(() => {
    if (normalizedSections.length === 0) return;
    setTempValues(valuesFromParams(normalizedSections, searchParams));
  }, [searchParams, sectionKeys]);

  const handleTempChange = (key: string, value: string) => {
    setTempValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setTempValues({});
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      normalizedSections.forEach((section) => p.delete(section.key));
      p.set("page", "1");
      return p;
    });
    onClear?.();
    setIsOpen(false);
  };

  const handleApply = () => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      normalizedSections.forEach((section) => {
        const value = tempValues[section.key]?.trim();
        if (value) p.set(section.key, value);
        else p.delete(section.key);
      });
      p.set("page", "1");
      return p;
    });
    onApply?.();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Select dropdowns render in a portal on <body>, so they are outside the
      // panel in the DOM even though they belong to it.
      if ((target as Element)?.closest?.("[data-portal-dropdown]")) return;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      <div className="relative">
        <div
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className="relative inline-flex"
        >
          {triggerButton ?? (
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary hover:text-primary"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              <span>{t("TITLES.filters")}</span>
            </button>
          )}
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground shadow-lg">
              {activeFilterCount}
            </span>
          )}
        </div>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] sm:hidden"
              onClick={() => setIsOpen(false)}
            />
            <div
              ref={panelRef}
              className={`fixed inset-x-3 bottom-3 z-50 flex max-h-[min(82vh,calc(100vh-1.5rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl sm:absolute sm:inset-x-auto sm:top-full sm:bottom-auto sm:mt-3 sm:max-h-[calc(100vh-120px)] sm:w-[340px] sm:rounded-2xl ${isRTL ? 'sm:left-0' : 'sm:right-0'}`}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border bg-primary/5 px-5 py-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {t("TITLES.filters")}
                  </h3>
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                >
                  <XMarkIcon className="h-[18px] w-[18px]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {normalizedSections.length > 0 ? (
                  normalizedSections.map((section) => (
                    <FilterSectionComponent
                      key={section.key}
                      section={section}
                      tempValues={tempValues}
                      onTempChange={handleTempChange}
                    />
                  ))
                ) : (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No filter sections configured
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-3 border-t border-border px-5 py-4">
                <button
                  type="button"
                  onClick={handleApply}
                  className={`${actionButtonClasses} border-primary bg-primary text-primary-foreground shadow-sm hover:bg-secondary`}
                >
                  {t("TITLES.apply") || "Apply"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className={`${actionButtonClasses} border-border bg-card text-foreground hover:bg-muted`}
                >
                  {t("TITLES.clearAll") || "Clear all"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes filterOptionSlide {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
