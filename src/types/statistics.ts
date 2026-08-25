export interface StatisticsPeriod {
  from_date: string | null;
  to_date: string | null;
}

export interface DashboardStatistics {
  total_clients: number;
  total_lawyers: number;
  total_law_firms: number;
  pending_verifications: number;
  total_subscription_revenue: number;
  active_orders: number;
  completed_orders: number;
  period: StatisticsPeriod;
}
