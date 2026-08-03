import { useState, useEffect, useRef } from "react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { ComponentType } from "react";

// Filter section types
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
  prependInputIcon?: ComponentType<{ size?: number | string; width?: number | string; height?: number | string; className?: string; [key: string]: any }>;
}

export interface FilterSection {
  key: string;
  label: string;
  icon?: ComponentType<{ size?: number | string; width?: number | string; height?: number | string; className?: string; [key: string]: any }>;
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

function FilterSectionComponent({ 
  section, 
  tempValues, 
  onTempChange 
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
      if (!values.includes(String(optionId))) {
        values.push(String(optionId));
      }
    } else {
      const index = values.indexOf(String(optionId));
      if (index > -1) {
        values.splice(index, 1);
      }
    }
    
    onTempChange(section.key, values.join(","));
  };

  const isRadioSelected = (optionId: string | number) => {
    return tempValues[section.key] === String(optionId);
  };

  const isCheckboxChecked = (optionId: string | number) => {
    const currentValue = tempValues[section.key] || "";
    return currentValue.split(",").includes(String(optionId));
  };

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-all hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent group"
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="relative">
              <Icon width={18} height={18} className="text-primary transition-transform group-hover:scale-110" />
              {/* Indicator dot if section has value */}
              {tempValues[section.key] && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </div>
          )}
          <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            {section.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {tempValues[section.key] && (
            <span className="px-2 py-0.5 text-xs font-bold text-primary bg-primary/10 rounded-full">
              {section.type === "radio" ? "1" : tempValues[section.key].split(",").filter(Boolean).length}
            </span>
          )}
          {isOpen ? (
            <ChevronUpIcon className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-primary" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-primary" />
          )}
        </div>
      </button>

      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {section.type === "radio" && section.options && (
            <div className="px-5 pb-4 space-y-2.5">
              {section.options.map((option, index) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-primary/5 transition-all"
                  style={{ 
                    animation: isOpen ? `filterOptionSlide 0.3s ease-out ${index * 0.05}s both` : 'none'
                  }}
                >
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      name={section.key}
                      checked={isRadioSelected(option.id)}
                      onChange={() => handleRadioChange(option.id)}
                      className="peer h-5 w-5 rounded-full border-2 border-border bg-card appearance-none cursor-pointer transition-all checked:border-primary checked:shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary pointer-events-none opacity-0 peer-checked:opacity-100 transition-all peer-checked:scale-100 scale-0" 
                      style={{ 
                        boxShadow: isRadioSelected(option.id) ? '0 0 8px color-mix(in srgb, var(--color-primary) 60%, transparent)' : 'none'
                      }}
                    />
                  </div>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors font-medium">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {section.type === "checkbox" && section.options && (
            <div className="px-5 pb-4 space-y-2.5">
              {section.options.map((option, index) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-primary/5 transition-all"
                  style={{ 
                    animation: isOpen ? `filterOptionSlide 0.3s ease-out ${index * 0.05}s both` : 'none'
                  }}
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={isCheckboxChecked(option.id)}
                      onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                      className="peer h-5 w-5 rounded border-2 border-border bg-card appearance-none cursor-pointer transition-all checked:bg-primary checked:border-primary checked:shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] focus:ring-2 focus:ring-primary/20"
                    />
                    <CheckIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-foreground pointer-events-none opacity-0 peer-checked:opacity-100 transition-all peer-checked:scale-100 scale-0" />
                  </div>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors font-medium">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {section.type === "select" && (
            <div className="px-5 pb-4">
              <select
                value={tempValues[section.key] || ""}
                onChange={(e) => onTempChange(section.key, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl  border border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">{section.placeholder || "Select..."}</option>
                {section.items?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {section.type === "text" && (
            <div className="px-5 pb-4">
              <input
                type="text"
                placeholder={section.placeholder}
                value={tempValues[section.key] || ""}
                onChange={(e) => onTempChange(section.key, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl  border border-border text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Filter({ sections, items, onApply, onClear, triggerButton }: FilterProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [tempValues, setTempValues] = useState<Record<string, string>>({});
  const normalizedSections: FilterSection[] = (sections ?? items?.map((item: FilterItem) => ({
    key: item.key,
    label: item.label ?? item.key,
    type: item.type ?? "text",
    placeholder: item.placeholder,
    options: item.options,
    icon: item.prependInputIcon,
  })) ?? []);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Count active filters
  const activeFilterCount = Object.values(tempValues).filter(v => v).length;

  // Calculate position based on trigger button
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right - window.scrollX
      });
    }
  }, [isOpen]);

  // Initialize temp values from URL on mount
  useEffect(() => {
    if (normalizedSections.length === 0) return;
    
    const params = new URLSearchParams(window.location.search);
    const values: Record<string, string> = {};
    normalizedSections.forEach((section) => {
      const value = params.get(section.key);
      if (value) {
        values[section.key] = value;
      }
    });
    setTempValues(values);
  }, [normalizedSections]);

  const handleTempChange = (key: string, value: string) => {
    setTempValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClear = () => {
    // Clear temp values
    setTempValues({});
    
    // Clear URL params
    if (normalizedSections.length > 0) {
      const p = new URLSearchParams(window.location.search);
      normalizedSections.forEach((section) => {
        p.delete(section.key);
      });
      window.history.pushState({}, "", `${window.location.pathname}?${p.toString()}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    
    onClear?.();
  };

  const handleApply = () => {
    if (normalizedSections.length === 0) {
      onApply?.();
      setIsOpen(false);
      return;
    }
    
    // Apply temp values to URL
    const p = new URLSearchParams(window.location.search);
    
    normalizedSections.forEach((section: FilterSection) => {
      const value = tempValues[section.key];
      if (value) {
        p.set(section.key, value);
        p.set("page", "1");
      } else {
        p.delete(section.key);
      }
    });
    
    window.history.pushState({}, "", `${window.location.pathname}?${p.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    
    onApply?.();
    setIsOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger Button with badge */}
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="relative">
        {triggerButton}
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-5 h-5 px-1.5 bg-primary text-foreground text-xs font-bold rounded-full shadow-lg animate-bounce">
            {activeFilterCount}
          </span>
        )}
      </div>

      {/* Floating Filter Panel - Positioned relative to trigger button */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed w-[340px] max-h-[calc(100vh-100px)] overflow-hidden bg-card rounded-2xl z-50 flex flex-col border border-border backdrop-blur-sm"
          style={{ 
            top: `${position.top}px`,
            right: `${position.right}px`,
            animation: "slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 20px 60px color-mix(in srgb, var(--color-foreground) 15%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-foreground) 5%, transparent), 0 0 0 3px color-mix(in srgb, var(--color-primary) 10%, transparent)"
          }}
        >
          {/* Decorative gradient top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary animate-gradient" />
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{t("TITLES.filters")}</h3>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold text-primary bg-primary/10 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-full hover: hover:rotate-90 transition-all duration-300 text-muted-foreground hover:text-foreground"
            >
              <XMarkIcon className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* Scrollable Filter Sections */}
          <div className="flex-1 overflow-y-auto">
            {normalizedSections.length > 0 ? (
              normalizedSections.map((section: FilterSection) => (
                <FilterSectionComponent 
                  key={section.key} 
                  section={section} 
                  tempValues={tempValues}
                  onTempChange={handleTempChange}
                />
              ))
            ) : (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">
                No filter sections configured
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-border shrink-0 bg-gradient-to-r from-transparent to-primary/5">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-foreground text-sm font-semibold hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm relative overflow-hidden group"
            >
              <span className="relative z-10">{t("TITLES.apply") || "Apply"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 px-4 py-2.5 rounded-xl  text-foreground text-sm font-semibold hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-200 border border-border"
            >
              {t("TITLES.clearAll") || "Clear all"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes filterOptionSlide {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
}
