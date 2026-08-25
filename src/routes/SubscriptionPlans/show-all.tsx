import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  RectangleStackIcon as Plans,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { Switcher } from "../../components/Shared/Switcher";
import { PageHeader } from "../../components/UI/PageHeader";
import { formatDate } from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { buildPlanUpdatePayload } from "../../lib/subscriptionPlanPayload";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { SubscriptionPlan } from "../../types/subscriptionPlans";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

function formatAmount(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function SubscriptionPlansShowAll() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<SubscriptionPlan>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "name", header: t("TITLES.name") },
      { index: 1, field: "price", header: t("TITLES.price") },
      { index: 2, field: "duration_in_days", header: t("TITLES.durationInDays") },
      { index: 3, field: "target_role", header: t("TITLES.targetRole") },
      { index:4, field: "is_active", header: t("TITLES.status") },
      { index: 5, field: "updated_at", header: t("TITLES.updatedAt") },
      { index:6, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchSubscriptionPlans"),
        prependInputIcon: Search as any,
      },
      {
        type: "radio",
        key: "is_active",
        label: t("TITLES.status"),
        options: [
          { id: "1", label: t("STATUS.active") },
          { id: "0", label: t("STATUS.inactive") },
        ],
      },
      {
        type: "radio",
        key: "target_role",
        label: t("TITLES.targetRole"),
        options: [
          { id: "client", label: t("TITLES.client") },
          { id: "lawyer", label: t("TITLES.lawyer") },
        ],
      },
    ],
    [t]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const isActive = searchParams.get("is_active") ?? "";
  const targetRole = searchParams.get("target_role") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("subscription-plans", {
        params: {
          page,
          search: search || undefined,
          is_active: isActive !== "" ? isActive : undefined,
          target_role: targetRole || undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<SubscriptionPlan>(res.data));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadSubscriptionPlans"),
        e?.response?.data?.message
      );
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, isActive, targetRole, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const planName = (item: SubscriptionPlan) => {
    if (lang === "ar") return item.name_ar || item.name_en || item.name || "—";
    return item.name_en || item.name_ar || item.name || "—";
  };

  const featureLabel = (f: {
    name?: string | null;
    name_ar?: string | null;
    name_en?: string | null;
  }) => {
    if (lang === "ar") return f.name_ar || f.name_en || f.name || "—";
    return f.name_en || f.name_ar || f.name || "—";
  };

  const renderCell = (field: string, item: SubscriptionPlan) => {
    switch (field) {
      case "name":
        return (
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{planName(item)}</p>
          </div>
        );
      case "price":
        return (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatAmount(item.price)}
          </span>
        );
      case "duration_in_days":
        return (
          <span className="text-sm tabular-nums text-foreground">
            {item.duration_in_days != null
              ? t("LABELS.daysCount", { count: item.duration_in_days })
              : "—"}
          </span>
        );
      case "target_role":
        return (
          <span className="text-sm text-foreground">
            {item.target_role
              ? t(`TITLES.${item.target_role}`, {
                  defaultValue: item.target_role,
                })
              : "—"}
          </span>
        );
      case "features": {
        const features = item.features ?? [];
        if (!features.length) {
          return (
            <span className="text-sm text-muted-foreground">
              {t("LABELS.noFeatures")}
            </span>
          );
        }
        const preview = features.slice(0, 2).map(featureLabel).join(" · ");
        const extra = features.length > 2 ? ` +${features.length - 2}` : "";
        return (
          <span
            className="text-sm text-muted-foreground"
            title={features.map(featureLabel).join(", ")}
          >
            {preview}
            {extra}
          </span>
        );
      }
      case "is_active":
        return (
          <Switcher
            value={!!item.is_active}
            url={`subscription-plans/${item.id}`}
            method="PUT"
            body={buildPlanUpdatePayload(item, { is_active: !item.is_active })}
            onReload={fetchData}
          />
        );
      case "updated_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.updated_at)}
          </span>
        );
      case "actions":
        return (
          <div className="relative w-9 overflow-visible">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (openMenu?.id === item.id) {
                  setOpenMenu(null);
                  return;
                }
                setOpenMenu({ id: item.id, anchor: e.currentTarget });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
            >
              <MoreHorizontal width={16} height={16} />
            </button>
            {openMenu?.id === item.id && (
              <ActionsMenu
                anchorEl={openMenu.anchor}
                data={item}
                showUrl={`/subscription-plans/${item.id}`}
                editUrl={`/subscription-plans/${item.id}/edit`}
                onClose={() => setOpenMenu(null)}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="subscriptionPlans"
        subtitle="subscriptionPlansDesc"
        icon={Plans}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "subscriptionPlans", icon: Plans },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="subscriptionPlans"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
