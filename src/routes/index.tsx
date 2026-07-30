import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, ShoppingBag, Users, BarChart3 } from "lucide-react";
import { ApexChart } from "../components/UI/ApexChart";
import { useAppStore } from "../store";
import api from "../lib/axios";
import type { ApexOptions } from "apexcharts";
import type { DashboardStats, TopProduct, StatCardProps } from "../types/home";

const EMPTY: DashboardStats = { total_new_orders: 0, weekly_revenue: 0, monthly_revenue: 0, yearly_revenue: 0, total_users: 0, total_products: 0, top_selling_products: [] };

function fmt(v: number | undefined) { return Math.round(v ?? 0).toLocaleString(); }
function productName(p: TopProduct, locale: string): string {
  const t = p.translations?.find((t) => t.locale === locale);
  if (t?.name) return t.name;
  const en = p.translations?.find((t) => t.locale === "en");
  if (en?.name) return en.name;
  return p.name ?? "—";
}
function isDark() { return document.documentElement.classList.contains("dark"); }

const ACCENT = {
  violet:  { bar: "bg-accent-violet",  glow: "bg-accent-violet-soft",  text: "text-accent-violet",  icon: "icon-accent-violet",  ring: "ring-accent-violet"  },
  blue:    { bar: "bg-accent-blue",    glow: "bg-accent-blue-soft",    text: "text-accent-blue",    icon: "icon-accent-blue",      ring: "ring-accent-blue"    },
  emerald: { bar: "bg-accent-emerald", glow: "bg-accent-emerald-soft", text: "text-accent-emerald", icon: "icon-accent-emerald", ring: "ring-accent-emerald" },
  amber:   { bar: "bg-accent-amber",   glow: "bg-accent-amber-soft",   text: "text-accent-amber",   icon: "icon-accent-amber",    ring: "ring-accent-amber"   },
};

function StatCard({ icon: Icon, label, value, accent }: StatCardProps) {
  const c = ACCENT[accent];
  return (
    <div className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-panel p-5 shadow-sm ring-1 ${c.ring} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
      <div className={`absolute top-0 inset-x-0 h-0.5 ${c.bar} opacity-80`} />
      <div className="pointer-events-none absolute -bottom-4 -inset-e-4 opacity-[0.06] dark:opacity-[0.08]"><Icon size={110} strokeWidth={1} /></div>
      <div className={`pointer-events-none absolute -top-8 -inset-e-8 h-28 w-28 rounded-full ${c.glow} blur-3xl`} />
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className={`flex size-9 items-center justify-center rounded-xl ring-1 ${c.ring} ${c.icon}`}><Icon size={16} strokeWidth={2.5} /></div>
      </div>
      <div className="relative mt-5">
        <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
        <div className={`mt-2 h-0.5 w-10 rounded-full ${c.bar} opacity-60`} />
      </div>
    </div>
  );
}

const SkeletonCard = () => (<div className="rounded-xl border border-border bg-panel p-5"><div className="flex items-center gap-4"><div className="skeleton-item size-12 rounded-full" /><div className="flex-1 space-y-2"><div className="skeleton-item h-3 w-1/3 rounded-full" /><div className="skeleton-item h-6 w-1/2 rounded-full" /></div></div></div>);
const SkeletonChart = ({ height = 300 }: { height?: number }) => (<div className="rounded-xl border border-border bg-panel p-5"><div className="skeleton-item mb-5 h-4 w-40 rounded-full" /><div className="skeleton-item rounded-xl" style={{ height }} /></div>);

type ChartType = "area" | "bar";

export default function Home() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [stats, setStats] = useState<DashboardStats>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const dark = isDark();
  const locale = lang;

  useEffect(() => {
    (async () => {
      try { const res = await api.get("statistics"); setStats(res.data.data ?? EMPTY); }
      catch (e) { console.error("Failed to fetch dashboard stats", e); }
      finally { setLoading(false); }
    })();
  }, []);

  const textColor = dark ? "#94a3b8" : "#64748b";
  const gridColor = dark ? "#1e293b" : "#f1f5f9";
  const ttTheme = dark ? "dark" : "light" as const;

  const base: ApexOptions = useMemo(() => ({
    theme: { mode: dark ? "dark" : "light" },
    chart: { background: "transparent", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    grid: { borderColor: gridColor, strokeDashArray: 4 },
    tooltip: { theme: ttTheme },
    xaxis: { labels: { style: { colors: textColor, fontSize: "12px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: textColor, fontSize: "12px" } } },
    legend: { labels: { colors: textColor } },
  }), [dark, gridColor, textColor, ttTheme]);

  const revenueOptions: ApexOptions = useMemo(() => ({
    ...base, colors: ["#7c3aed"],
    xaxis: { ...base.xaxis, categories: [t("ANALYTICS.weekly"), t("ANALYTICS.monthly"), t("ANALYTICS.yearly")] },
    yaxis: { ...base.yaxis, labels: { style: { colors: textColor, fontSize: "12px" }, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v) } },
    tooltip: { theme: ttTheme, y: { formatter: (v: number) => `${v.toLocaleString()}` } },
    ...(chartType === "bar" ? { plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } }, dataLabels: { enabled: false } } : { stroke: { curve: "smooth" as const, width: 3 }, fill: { type: "gradient", gradient: { opacityFrom: 0.6, opacityTo: 0.05 } }, dataLabels: { enabled: false } }),
  }), [base, chartType, t, textColor, ttTheme]);

  const revenueSeries = useMemo(() => [{ name: t("ANALYTICS.revenue"), data: [stats.weekly_revenue ?? 0, stats.monthly_revenue ?? 0, stats.yearly_revenue ?? 0] }], [stats, t]);

  const COLORS = ["#7c3aed","#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#f97316","#06b6d4","#84cc16"];
  const topProducts = useMemo(() => (stats.top_selling_products ?? []).slice(0, 10), [stats]);

  const topProductsOptions: ApexOptions = useMemo(() => ({
    ...base, colors: COLORS,
    xaxis: { ...base.xaxis, categories: topProducts.map((p) => productName(p, locale)), labels: { style: { colors: textColor, fontSize: "11px" }, rotate: -45, rotateAlways: true, maxHeight: 120 } },
    yaxis: { ...base.yaxis, title: { text: t("ANALYTICS.unitsSold"), style: { color: textColor, fontSize: "12px", fontWeight: 500 } } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "70%", distributed: true, dataLabels: { position: "top" } } },
    dataLabels: { enabled: true, offsetY: -20, style: { fontSize: "11px", colors: [dark ? "#e2e8f0" : "#1e293b"] } },
    legend: { show: false },
    tooltip: { theme: ttTheme, y: { formatter: (v: number) => `${v} ${t("ANALYTICS.unitsSold")}` } },
    grid: { ...base.grid, xaxis: { lines: { show: false } } },
  }), [base, topProducts, locale, textColor, ttTheme, t, dark]);

  const topProductsSeries = useMemo(() => [{ name: t("ANALYTICS.unitsSold"), data: topProducts.map((p) => p.number_of_sold_item) }], [topProducts, t]);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-text">{t("ANALYTICS.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("ANALYTICS.description")}</p>
        {(stats as any).filter?.reference_date && <p className="mt-0.5 text-xs text-muted/60">{t("ANALYTICS.lastUpdated")}: {(stats as any).filter.reference_date}</p>}
      </div>

      {loading ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={DollarSign} accent="violet" label={t("ANALYTICS.yearlyRevenue")} value={fmt(stats.yearly_revenue)} />
            <StatCard icon={ShoppingBag} accent="blue" label={t("ANALYTICS.totalOrders")} value={fmt(stats.total_new_orders)} />
            <StatCard icon={Users} accent="emerald" label={t("ANALYTICS.totalUsers")} value={fmt(stats.total_users)} />
            <StatCard icon={BarChart3} accent="amber" label={t("ANALYTICS.totalProducts")} value={fmt(stats.total_products)} />
          </div>}

      {loading ? <SkeletonChart height={300} /> : (
        <div className="rounded-xl border border-border bg-panel p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-bold text-text">{t("ANALYTICS.revenueOverview")}</h3>
            <div className="flex items-center gap-1 rounded-lg   border border-border p-1">
              {(["bar", "area"] as ChartType[]).map((tp) => <button key={tp} type="button" onClick={() => setChartType(tp)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${chartType === tp ? "bg-panel text-text shadow-sm border border-border" : "text-muted hover:text-text"}`}>{tp === "bar" ? t("ANALYTICS.bar") : t("ANALYTICS.area")}</button>)}
            </div>
          </div>
          <ApexChart type={chartType} height={300} options={revenueOptions} series={revenueSeries} />
        </div>
      )}

      {loading ? <SkeletonChart height={350} /> : topProducts.length > 0 ? (
        <div className="rounded-xl border border-border bg-panel p-5 shadow-sm">
          <h3 className="mb-5 text-base font-bold text-text">{t("ANALYTICS.topSellingProducts")}</h3>
          <ApexChart type="bar" height={350} options={topProductsOptions} series={topProductsSeries} />
        </div>
      ) : !loading && (
        <div className="rounded-xl border border-dashed border-border   p-10 text-center">
          <p className="text-sm text-muted">{t("ANALYTICS.noProducts")}</p>
        </div>
      )}
    </div>
  );
}


