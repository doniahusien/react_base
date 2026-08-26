import { useCallback, useEffect, useState } from "react";
import {
  Squares2X2Icon as LayoutDashboard,
  ShieldCheckIcon as Shield,
  ChevronDownIcon as ChevronDown,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type {
  CatalogPermission,
  PermissionsCatalog,
} from "../../types/permissions";

export default function PermissionsPage() {
  const { t, i18n } = useTranslation();
  const [catalog, setCatalog] = useState<PermissionsCatalog>({
    permissions: [],
    available_routes: [],
  });
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("permissions");
      const data = res.data?.data ?? {};
      setCatalog({
        permissions: Array.isArray(data.permissions) ? data.permissions : [],
        available_routes: Array.isArray(data.available_routes)
          ? data.available_routes
          : [],
      });
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadPermissions"),
        e?.response?.data?.message
      );
      setCatalog({ permissions: [], available_routes: [] });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const permLabel = (p: CatalogPermission) => {
    if (i18n.language?.startsWith("ar")) return p.name_ar || p.name || p.code;
    return p.name_en || p.name_ar || p.name || p.code;
  };

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="permissions"
        subtitle="permissionsDesc"
        icon={Shield}
        total={catalog.permissions.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "permissions", icon: Shield },
        ]}
      />

      {loading ? (
        <Skeleton sections={[{ fields: [{}, {}, {}] }]} />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-sm font-bold text-foreground">
                {t("TITLES.permissions")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("LABELS.permissionsListHint")}
              </p>
            </div>

            {!catalog.permissions.length ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                {t("LABELS.noPermissions")}
              </p>
            ) : (
              <div className="divide-y divide-border">
                {catalog.permissions.map((p) => {
                  const routes = p.target_routes ?? [];
                  const open = openId === p.id;

                  return (
                    <div key={p.id} className="px-5 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {permLabel(p)}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                            {p.code}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {p.module ? (
                              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {p.module}
                              </span>
                            ) : null}
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              #{p.id}
                            </span>
                          </div>
                        </div>

                        {routes.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setOpenId(open ? null : p.id)}
                            className="inline-flex items-center gap-1 self-start rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
                          >
                            {t("LABELS.routesCount", { count: routes.length })}
                            <ChevronDown
                              width={12}
                              height={12}
                              className={`transition ${open ? "rotate-180" : ""}`}
                            />
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            {t("LABELS.noTargetRoutes")}
                          </span>
                        )}
                      </div>

                      {open && routes.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {routes.map((route) => (
                            <span
                              key={route}
                              className="rounded-md bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground"
                            >
                              {route}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {(catalog.available_routes?.length ?? 0) > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <button
                type="button"
                onClick={() => setShowRoutes((v) => !v)}
                className="flex w-full items-center justify-between gap-3 border-b border-border px-5 py-4 text-start"
              >
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {t("TITLES.availableRoutes")}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("LABELS.availableRoutesHint")}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground">
                  {catalog.available_routes?.length ?? 0}
                  <ChevronDown
                    width={12}
                    height={12}
                    className={`transition ${showRoutes ? "rotate-180" : ""}`}
                  />
                </span>
              </button>
              {showRoutes ? (
                <div className="flex flex-wrap gap-1.5 p-4">
                  {(catalog.available_routes ?? []).map((route) => (
                    <span
                      key={route}
                      className="rounded-md bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground"
                    >
                      {route}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
