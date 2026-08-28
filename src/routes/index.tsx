import { useCallback, useEffect, useMemo, useState } from "react";
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
  SparklesIcon as Sparkles,
  CalendarDaysIcon as Calendar,
  FunnelIcon as Funnel,
  XMarkIcon as X,
  ChartBarIcon as ChartBar,
} from "@heroicons/react/24/outline";
import type { ApexOptions } from "apexcharts";
import { PageHeader } from "../components/UI/PageHeader";
import { Button } from "../components/UI/Button";
import { ApexChart } from "../components/UI/ApexChart";
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
  premium_lawyers_count: 0,
  orders_chart: [],
  period: { from_date: null, to_date: null },
};

function fmt(v: number | undefined) {
  return Math.round(v ?? 0).toLocaleString();
}

function fmtMoney(v: number | undefined) {
  return (v ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
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
  const { t, i18n } = useTranslation();
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
        const data = res.data?.data ?? EMPTY;
        setStats({
          ...EMPTY,
          ...data,
          orders_chart: Array.isArray(data?.orders_chart)
            ? data.orders_chart
            : [],
        });
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

  const chartCategories = useMemo(
    () =>
      (stats.orders_chart ?? []).map((p) => {
        const d = new Date(p.date);
        if (Number.isNaN(d.getTime())) return p.date;
        return d.toLocaleDateString(i18n.language === "ar" ? "ar" : "en", {
          month: "short",
          day: "numeric",
        });
      }),
    [stats.orders_chart, i18n.language]
  );

  const chartSeries = useMemo(
    () => [
      {
        name: t("ANALYTICS.orders"),
        data: (stats.orders_chart ?? []).map((p) => p.count),
      },
    ],
    [stats.orders_chart, t]
  );

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
      },
      stroke: { curve: "smooth", width: 3 },
      dataLabels: { enabled: false },
      markers: { size: 4, hover: { size: 6 } },
      xaxis: {
        categories: chartCategories,
        labels: { style: { colors: "var(--color-muted-foreground)" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "var(--color-muted-foreground)" },
          formatter: (v) => String(Math.round(v)),
        },
        min: 0,
        forceNiceScale: true,
      },
      grid: {
        borderColor: "var(--color-border)",
        strokeDashArray: 4,
      },
      tooltip: {
        theme: "light",
        y: { formatter: (v) => String(Math.round(v ?? 0)) },
      },
    }),
    [chartCategories]
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="dashboard"
        subtitle={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span>{t("ANALYTICS.description")}</span>
            <div className="flex items-center gap-2 text-xs">
              <Funnel className="size-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                {t("ANALYTICS.filterByDate")}
              </span>
            </div>
          </div>
        }
        translateSubtitle={false}
        icon={LayoutDashboard}
        path={[{ label: "dashboard", icon: LayoutDashboard }]}
        rightActions={
          <div className="flex flex-col w-full gap-2 sm:flex-row sm:w-auto sm:items-end">
            <label className="flex min-w-0 flex-col gap-1.5 sm:max-w-40">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("ANALYTICS.fromDate")}
              </span>
              <div className="relative">
                <Calendar className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background/80 pe-2 ps-9 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            <label className="flex min-w-0 flex-col gap-1.5 sm:max-w-40">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("ANALYTICS.toDate")}
              </span>
              <div className="relative">
                <Calendar className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background/80 pe-2 ps-9 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={applyFilter}
                loading={loading}
                className="h-9 px-3 text-xs"
              >
                <Funnel width={12} height={12} />
                {t("BUTTONS.apply")}
              </Button>
              {hasFilter && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearFilter}
                  className="h-9 px-3 text-xs"
                >
                  <X width={12} height={12} />
                  {t("BUTTONS.clear")}
                </Button>
              )}
            </div>
          </div>
        }
      />

      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="h-80 rounded-2xl border border-border bg-card p-5">
            <div className="skeleton-item mb-4 h-4 w-40 rounded-full" />
            <div className="skeleton-item h-64 w-full rounded-xl" />
          </div>
        </>
      ) : (
        <>
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
              value={fmtMoney(stats.total_subscription_revenue)}
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
            <StatCard
              icon={Sparkles}
              label={t("ANALYTICS.premiumLawyers")}
              value={fmt(stats.premium_lawyers_count)}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ChartBar width={14} height={14} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t("ANALYTICS.ordersChart")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("ANALYTICS.ordersChartDesc")}
                </p>
              </div>
            </div>

            {chartSeries[0].data.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                {t("ANALYTICS.noOrdersChart")}
              </p>
            ) : (
              <ApexChart
                type="area"
                height={320}
                options={chartOptions}
                series={chartSeries}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
