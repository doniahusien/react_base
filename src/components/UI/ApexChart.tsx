import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface ApexChartProps {
  type: string;
  height?: number | string;
  options: ApexOptions;
  series: ApexOptions["series"];
}

export function ApexChart({ type, height = 300, options, series }: ApexChartProps) {
  return (
    <ReactApexChart
      type={type as any}
      height={height}
      options={{ ...options, chart: { ...options.chart, type: type as any } }}
      series={series}
    />
  );
}
