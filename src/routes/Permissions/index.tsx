import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Squares2X2Icon as LayoutDashboard,
  ShieldCheckIcon as Shield,
  MagnifyingGlassIcon as Search,
  UserGroupIcon as Users,
  DocumentTextIcon as Document,
  BanknotesIcon as Banknotes,
  WrenchScrewdriverIcon as Operations,
  Cog6ToothIcon as Settings,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { SectionCard } from "../../components/Shared/SectionCard";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type { CatalogPermission } from "../../types/permissions";

const MODULE_ORDER = [
  "User Management",
  "Content Management",
  "Financial & Subscriptions",
  "Operations & Support",
  "System Settings",
] as const;

const MODULE_META: Record<
  string,
  {
    icon: typeof Shield;
    color: "primary" | "emerald" | "blue" | "orange" | "rose" | "sky";
    labelKey?: string;
  }
> = {
  "User Management": { icon: Users, color: "primary", labelKey: "userManagement" },
  "Content Management": { icon: Document, color: "blue", labelKey: "contentManagement" },
  "Financial & Subscriptions": {
    icon: Banknotes,
    color: "emerald",
    labelKey: "financialSubscriptions",
  },
  "Operations & Support": {
    icon: Operations,
    color: "orange",
    labelKey: "operationsSupport",
  },
  "System Settings": { icon: Settings, color: "sky", labelKey: "systemSettings" },
};

function permLabel(
  p: CatalogPermission,
  lang: string | undefined
): string {
  if (lang?.startsWith("ar")) return p.name_ar || p.name || p.code;
  return p.name_en || p.name_ar || p.name || p.code;
}

function groupByModule(permissions: CatalogPermission[]) {
  const groups = new Map<string, CatalogPermission[]>();

  for (const p of permissions) {
    const key = p.module?.trim() || "Other";
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }

  for (const list of groups.values()) {
    list.sort((a, b) => permLabel(a, "en").localeCompare(permLabel(b, "en")));
  }

  const ordered: { module: string; items: CatalogPermission[] }[] = [];

  for (const name of MODULE_ORDER) {
    const items = groups.get(name);
    if (items?.length) {
      ordered.push({ module: name, items });
      groups.delete(name);
    }
  }

  const rest = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  for (const [module, items] of rest) {
    ordered.push({ module, items });
  }

  return ordered;
}

interface StatProps {
  label: string;
  value: number;
}

function StatTile({ label, value }: StatProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface PermissionCardProps {
  permission: CatalogPermission;
  lang: string | undefined;
}

function PermissionCard({ permission: p, lang }: PermissionCardProps) {
  return (
    <article className="rounded-xl border border-border bg-background p-4 transition hover:border-primary/25 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Shield width={16} height={16} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold leading-snug text-foreground">
            {permLabel(p, lang)}
          </h4>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{p.code}</p>
        </div>
      </div>
    </article>
  );
}

export default function PermissionsPage() {
  const { t, i18n } = useTranslation();
  const [permissions, setPermissions] = useState<CatalogPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("permissions");
      const data = res.data?.data ?? {};
      setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadPermissions"),
        e?.response?.data?.message
      );
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return permissions;

    return permissions.filter((p) => {
      const haystack = [p.code, p.name, p.name_ar, p.name_en, p.module]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [permissions, search]);

  const grouped = useMemo(() => groupByModule(filtered), [filtered]);

  const stats = useMemo(() => {
    const modules = new Set(permissions.map((p) => p.module).filter(Boolean));
    return {
      modules: modules.size,
      permissions: permissions.length,
    };
  }, [permissions]);

  const moduleTitle = (module: string) => {
    const meta = MODULE_META[module];
    if (meta?.labelKey) {
      return t(`PERMISSIONS.modules.${meta.labelKey}`, { defaultValue: module });
    }
    return module;
  };

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="permissions"
        subtitle="permissionsDesc"
        icon={Shield}
        total={permissions.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "permissions", icon: Shield },
        ]}
      />

      {loading ? (
        <Skeleton sections={[{ fields: [{}, {}, {}] }]} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatTile label={t("PERMISSIONS.statsModules")} value={stats.modules} />
            <StatTile label={t("PERMISSIONS.statsPermissions")} value={stats.permissions} />
          </div>

          <div className="relative">
            <Search
              width={16}
              height={16}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("PERMISSIONS.searchPlaceholder")}
              className="h-11 w-full rounded-xl border border-border bg-card ps-10 pe-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/15"
            />
          </div>

          {!filtered.length ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm">
              <Shield width={32} height={32} className="mx-auto text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                {search.trim()
                  ? t("PERMISSIONS.noSearchResults")
                  : t("LABELS.noPermissions")}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {grouped.map(({ module, items }) => {
                const meta = MODULE_META[module] ?? {
                  icon: Shield,
                  color: "primary" as const,
                };

                return (
                  <SectionCard
                    key={module}
                    icon={meta.icon}
                    color={meta.color}
                    title={moduleTitle(module)}
                    subtitle={t("LABELS.permissionsInModule", { count: items.length })}
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {items.map((p) => (
                        <PermissionCard
                          key={p.id}
                          permission={p}
                          lang={i18n.language}
                        />
                      ))}
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
