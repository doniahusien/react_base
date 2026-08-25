export type SubscriptionTargetRole = "client" | "lawyer" | string;

export interface SubscriptionPlanFeature {
  id?: number;
  name?: string | null;
  name_ar: string | null;
  name_en: string | null;
}

export interface SubscriptionPlan {
  id: number;
  name: string | null;
  name_ar: string | null;
  name_en: string | null;
  description: string | null;
  description_ar: string | null;
  description_en: string | null;
  slug: string | null;
  price: number;
  duration_in_days: number;
  target_role: SubscriptionTargetRole | null;
  is_active: boolean;
  features: SubscriptionPlanFeature[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SubscriptionPlanFeatureInput {
  name_ar: string;
  name_en?: string;
}

export interface SubscriptionPlanUpdatePayload {
  name_ar: string;
  name_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  price: number;
  duration_in_days: number;
  target_role: "client" | "lawyer";
  is_active: boolean;
  features?: SubscriptionPlanFeatureInput[] | null;
}
