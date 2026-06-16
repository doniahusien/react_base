export interface Translation { locale: string; name?: string; brand?: string; }

export interface TopProduct {
  id: number; name?: string;
  number_of_sold_item: number;
  translations?: Translation[];
}

export interface DashboardStats {
  total_new_orders: number; weekly_revenue: number;
  monthly_revenue: number; yearly_revenue: number;
  total_users: number; total_products: number;
  top_selling_products: TopProduct[];
  filter?: { reference_date?: string };
}

export interface StatCardProps {
  icon: any; label: string; value: string;
  accent: "violet" | "blue" | "emerald" | "amber";
}
