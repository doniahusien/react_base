import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Squares2X2Icon as LayoutDashboard,
  UsersIcon as Users,
  ScaleIcon as Scale,
  BuildingOffice2Icon as Building,
  ShieldCheckIcon as ShieldCheck,
  CurrencyDollarIcon as Dollar,
  ClipboardDocumentListIcon as ClipboardList,
  CheckBadgeIcon as CheckBadge,
  CalendarDaysIcon as Calendar,
  FunnelIcon as Funnel,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../components/UI/PageHeader";
import { Button } from "../components/UI/Button";
import api from "../lib/axios";
import { toast } from "../stores/toast";
import type { DashboardStatistics } from "../types/statistics";

const EMPTY: DashboardStatistics = {
  total_clients: 0,
  total_lawyers: 0,
  total_law_firms: 0,
  pending_verifications: 0,
  total_subscription_revenue: 0,
  active_orders: 0,
  completed_orders: 0,
  period: { from_date: null, to_date: null },
};

function fmt(v: number | undefined) {
  return Math.round(v ?? 0).toLocaleString();
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-primary opacity-80" />
      <div className="pointer-events-none absolute -bottom-4 -inset-e-4 opacity-[0.06] dark:opacity-[0.08]">
        <Icon width={110} height={110} strokeWidth={1} />
      </div>
      <div className="pointer-events-none absolute -top-8 -inset-e-8 h-28 w-28 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Icon width={16} height={16} strokeWidth={2.5} />
        </div>
      </div>
      <div className="relative mt-5">
        <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
        <div className="mt-2 h-0.5 w-10 rounded-full bg-primary opacity-60" />
      </div>
    </div>
  );
}

const SkeletonCard = () => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="flex items-center gap-4">
      <div className="skeleton-item size-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-item h-3 w-1/3 rounded-full" />
        <div className="skeleton-item h-6 w-1/2 rounded-full" />
      </div>
    </div>
  </div>
);

export default function Home() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStatistics>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchStats = useCallback(
    async (from?: string, to?: string) => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (from) params.from_date = from;
        if (to) params.to_date = to;
        const res = await api.get("statistics", { params });
        setStats(res.data?.data ?? EMPTY);
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadStats"),
          e?.response?.data?.message
        );
        setStats(EMPTY);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const applyFilter = () => {
    fetchStats(fromDate || undefined, toDate || undefined);
  };

  const clearFilter = () => {
    setFromDate("");
    setToDate("");
    fetchStats();
  };

  const hasFilter = !!(fromDate || toDate);
  const periodFrom = stats.period?.from_date;
  const periodTo = stats.period?.to_date;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="dashboard"
        subtitle={t("ANALYTICS.description")}
        translateSubtitle={false}
        icon={LayoutDashboard}
        path={[{ label: "dashboard", icon: LayoutDashboard }]}
      />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Funnel width={14} height={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t("ANALYTICS.filterByDate")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("ANALYTICS.filterByDateDesc")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-55">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("ANALYTICS.fromDate")}
            </span>
            <div className="relative">
              <Calendar className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background pe-3 ps-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>

          <label className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-55">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("ANALYTICS.toDate")}
            </span>
            <div className="relative">
              <Calendar className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background pe-3 ps-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={applyFilter} loading={loading}>
              <Funnel width={14} height={14} />
              {t("BUTTONS.apply")}
            </Button>
            {hasFilter && (
              <Button type="button" variant="secondary" onClick={clearFilter}>
                <X width={14} height={14} />
                {t("BUTTONS.clear")}
              </Button>
            )}
          </div>
        </div>

     {/*    {(periodFrom || periodTo) && (
          <p className="mt-3 text-xs text-muted-foreground">
            {t("ANALYTICS.showingPeriod")}:{" "}
            <span className="font-medium text-foreground">
              {periodFrom || "—"} → {periodTo || "—"}
            </span>
          </p>
        )} */}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label={t("ANALYTICS.totalClients")}
            value={fmt(stats.total_clients)}
          />
          <StatCard
            icon={Scale}
            label={t("ANALYTICS.totalLawyers")}
            value={fmt(stats.total_lawyers)}
          />
          <StatCard
            icon={Building}
            label={t("ANALYTICS.totalLawFirms")}
            value={fmt(stats.total_law_firms)}
          />
          <StatCard
            icon={ShieldCheck}
            label={t("ANALYTICS.pendingVerifications")}
            value={fmt(stats.pending_verifications)}
          />
          <StatCard
            icon={Dollar}
            label={t("ANALYTICS.subscriptionRevenue")}
            value={fmt(stats.total_subscription_revenue)}
          />
          <StatCard
            icon={ClipboardList}
            label={t("ANALYTICS.activeOrders")}
            value={fmt(stats.active_orders)}
          />
          <StatCard
            icon={CheckBadge}
            label={t("ANALYTICS.completedOrders")}
            value={fmt(stats.completed_orders)}
          />
        </div>
      )}
    </div>
  );
}
