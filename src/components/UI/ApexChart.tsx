import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface ApexChartProps {
  type: string;
  height?: number | string;
  options: ApexOptions;
  series: ApexOptions["series"];
}

/** ApexCharts cannot parse CSS Color 4 `rgb(15 76 129)` and falls back to gray. */
function toApexColor(value: string, fallback = "#0f4c81"): string {
  const v = value.trim();
  if (!v) return fallback;
  if (v.startsWith("#")) return v;
  const m = v.match(/rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i);
  if (!m) return fallback;
  const hex = (n: string) => Math.round(Number(n)).toString(16).padStart(2, "0");
  return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}`;
}

function cssVar(name: string, fallback?: string): string {
  return toApexColor(
    getComputedStyle(document.documentElement).getPropertyValue(name),
    fallback
  );
}

export function ApexChart({ type, height = 300, options, series }: ApexChartProps) {
  const primary = cssVar("--color-primary");
  const colors = (options.colors?.length ? options.colors : [primary]).map((c) =>
    typeof c === "string" ? toApexColor(c, primary) : c
  );

  return (
    <ReactApexChart
      type={type as any}
      height={height}
      options={{
        ...options,
        colors,
        fill: { ...options.fill, opacity: options.fill?.opacity ?? 1 },
        chart: { ...options.chart, type: type as any },
      }}
      series={series}
    />
  );
}
