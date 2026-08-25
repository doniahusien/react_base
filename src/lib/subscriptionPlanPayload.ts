import type {
  SubscriptionPlan,
  SubscriptionPlanFeatureInput,
  SubscriptionPlanUpdatePayload,
} from "./subscriptionPlans";

export function buildPlanUpdatePayload(
  plan: SubscriptionPlan,
  overrides?: Partial<{ is_active: boolean }>
): SubscriptionPlanUpdatePayload {
  const features: SubscriptionPlanFeatureInput[] = (plan.features ?? [])
    .map((f) => ({
      name_ar: (f.name_ar ?? "").trim(),
      name_en: (f.name_en ?? "").trim() || undefined,
    }))
    .filter((f) => f.name_ar);

  return {
    name_ar: plan.name_ar ?? "",
    name_en: plan.name_en || null,
    description_ar: plan.description_ar || null,
    description_en: plan.description_en || null,
    price: Number(plan.price),
    duration_in_days: Number(plan.duration_in_days),
    target_role: (plan.target_role === "lawyer" ? "lawyer" : "client") as
      | "client"
      | "lawyer",
    is_active: overrides?.is_active ?? !!plan.is_active,
    features: features.length ? features : null,
  };
}
