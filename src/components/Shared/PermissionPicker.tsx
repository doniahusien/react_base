import { useMemo, useState } from "react";
import {
  CheckIcon as Check,
  ChevronDownIcon as ChevronDown,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { CatalogPermission } from "../../types/permissions";

function permissionLabel(
  p: CatalogPermission,
  lang: string | undefined
): string {
  if (lang?.startsWith("ar")) return p.name_ar || p.name || p.code;
  return p.name_en || p.name_ar || p.name || p.code;
}

interface PermissionPickerProps {
  options: CatalogPermission[];
  value: string[];
  onChange: (codes: string[]) => void;
  error?: string;
}

export function PermissionPicker({
  options,
  value,
  onChange,
  error,
}: PermissionPickerProps) {
  const { t, i18n } = useTranslation();
  const selected = useMemo(() => new Set(value), [value]);
  const [openRoutes, setOpenRoutes] = useState<Record<string, boolean>>({});

  const allCodes = options.map((p) => p.code);
  const allSelected =
    allCodes.length > 0 && allCodes.every((c) => selected.has(c));

  const toggle = (code: string) => {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    onChange(Array.from(next));
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : [...allCodes]);
  };

  if (!options.length) {
    return (
      <p className="text-sm text-muted-foreground">{t("LABELS.noPermissions")}</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {t("LABELS.permissionsOfTotal", {
            selected: value.length,
            total: options.length,
          })}
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {allSelected ? t("ACTIONS.deselectAll") : t("ACTIONS.selectAll")}
        </button>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <div className="space-y-2  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((p) => {
          const checked = selected.has(p.code);
          const routes = p.target_routes ?? [];
          const routesOpen = !!openRoutes[p.code];

          return (
            <div
              key={p.id ?? p.code}
              className={`rounded-xl border transition ${
                checked
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex items-start gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggle(p.code)}
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-transparent"
                  }`}
                  aria-pressed={checked}
                >
                  <Check width={12} height={12} strokeWidth={3} />
                </button>

                <button
                  type="button"
                  onClick={() => toggle(p.code)}
                  className="min-w-0 flex-1 text-start"
                >
                  <span className="block text-sm font-medium text-foreground">
                    {permissionLabel(p, i18n.language)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                    {p.code}
                  </span>
                  {p.module ? (
                    <span className="mt-1 inline-flex rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {p.module}
                    </span>
                  ) : null}
                </button>

                {routes.length > 0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenRoutes((prev) => ({
                        ...prev,
                        [p.code]: !prev[p.code],
                      }))
                    }
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-muted"
                  >
                    {t("LABELS.routesCount", { count: routes.length })}
                    <ChevronDown
                      width={12}
                      height={12}
                      className={`transition ${routesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                ) : null}
              </div>

              {routesOpen && routes.length > 0 ? (
                <div className="border-t border-border px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    {routes.map((route) => (
                      <span
                        key={route}
                        className="rounded-md bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground"
                      >
                        {route}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
