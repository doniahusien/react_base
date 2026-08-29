import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  RectangleStackIcon as Plans,
  PlusIcon as Plus,
  TrashIcon as Trash,
  CheckBadgeIcon as CheckBadge,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { Button } from "../../components/UI/Button";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSwitchInput } from "../../components/Inputs/BaseSwitchInput";
import {
  BaseSelectInput,
  type SelectOption,
} from "../../components/Inputs/BaseSelectInput";
import { SectionCard } from "../../components/Shared/SectionCard";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type {
  SubscriptionPlan,
  SubscriptionPlanFeatureInput,
  SubscriptionPlanUpdatePayload,
} from "../../types/subscriptionPlans";

interface FeatureDraft {
  key: string;
  name_ar: string;
  name_en: string;
}

interface FormValues {
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: string;
  duration_in_days: string;
  target_role: SelectOption | null;
  is_active: boolean;
  features: FeatureDraft[];
}

function newFeatureKey() {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDraft(plan: SubscriptionPlan): FormValues {
  return {
    name_ar: plan.name_ar ?? "",
    name_en: plan.name_en ?? "",
    description_ar: plan.description_ar ?? "",
    description_en: plan.description_en ?? "",
    price: plan.price != null ? String(plan.price) : "",
    duration_in_days:
      plan.duration_in_days != null ? String(plan.duration_in_days) : "",
    target_role: plan.target_role
      ? { id: plan.target_role, name: plan.target_role }
      : null,
    is_active: !!plan.is_active,
    features: (plan.features ?? []).map((f) => ({
      key: newFeatureKey(),
      name_ar: f.name_ar ?? "",
      name_en: f.name_en ?? "",
    })),
  };
}

export default function SubscriptionPlanEdit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<FormValues | null>(null);

  const roleOptions: SelectOption[] = [
    { id: "client", name: t("TITLES.client") },
    { id: "lawyer", name: t("TITLES.lawyer") },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`subscription-plans/${id}`);
        const data = res.data?.data as SubscriptionPlan | null;
        setPlan(data);
        setValues(data ? toDraft(data) : null);
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadSubscriptionPlans"),
          e?.response?.data?.message
        );
        setPlan(null);
        setValues(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  if (loading || !values) {
    return (
      <div className="space-y-5">
        <Skeleton sections={[{ fields: [{}, {}, {}, {}] }, { fields: [{}, {}, {}] }]} />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link
          to="/subscription-plans?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.subscriptionPlans")}
        </Link>
      </div>
    );
  }

  const setField =
    <K extends keyof FormValues>(key: K) =>
    (v: FormValues[K]) =>
      setValues((prev) => (prev ? { ...prev, [key]: v } : prev));

  const updateFeature = (key: string, patch: Partial<FeatureDraft>) => {
    setValues((prev) =>
      prev
        ? {
            ...prev,
            features: prev.features.map((f) =>
              f.key === key ? { ...f, ...patch } : f
            ),
          }
        : prev
    );
  };

  const addFeature = () => {
    setValues((prev) =>
      prev
        ? {
            ...prev,
            features: [
              ...prev.features,
              { key: newFeatureKey(), name_ar: "", name_en: "" },
            ],
          }
        : prev
    );
  };

  const removeFeature = (key: string) => {
    setValues((prev) =>
      prev
        ? {
            ...prev,
            features: prev.features.filter((f) => f.key !== key),
          }
        : prev
    );
  };

  const submit = async () => {
    const nameAr = values.name_ar.trim();
    const price = Number(values.price);
    const duration = Number(values.duration_in_days);
    const roleId = values.target_role?.id;

    if (!nameAr) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.nameArabic") })
      );
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.price") })
      );
      return;
    }
    if (!Number.isFinite(duration) || duration < 1) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.durationInDays") })
      );
      return;
    }
    if (roleId !== "client" && roleId !== "lawyer") {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.targetRole") })
      );
      return;
    }

    const features: SubscriptionPlanFeatureInput[] = values.features
      .map((f) => ({
        name_ar: f.name_ar.trim(),
        name_en: f.name_en.trim() || undefined,
      }))
      .filter((f) => f.name_ar);

    const payload: SubscriptionPlanUpdatePayload = {
      name_ar: nameAr,
      name_en: values.name_en.trim() || null,
      description_ar: values.description_ar.trim() || null,
      description_en: values.description_en.trim() || null,
      price,
      duration_in_days: Math.round(duration),
      target_role: roleId,
      is_active: values.is_active,
      features: features.length ? features : null,
    };

    try {
      setSaving(true);
      const res = await api.put(`subscription-plans/${plan.id}`, payload);
      toast.success(t("MESSAGES.updatedSuccess"), res.data?.message);
      navigate(`/subscription-plans/${plan.id}`);
    } catch (e: any) {
      toast.error(t("MESSAGES.updateFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedRole =
    roleOptions.find((o) => o.id === values.target_role?.id) ??
    values.target_role;

  return (
    <div className="space-y-0">
      <PageHeader
        title={t("TITLES.edit", { entity: t("TITLES.subscriptionPlan") })}
        translateTitle={false}
        icon={Plans}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          {
            label: "subscriptionPlans",
            href: "/subscription-plans?page=1",
            icon: Plans,
          },
          {
            label: `#${plan.id}`,
            href: `/subscription-plans/${plan.id}`,
            icon: Plans,
          },
          { label: t("ACTIONS.edit"), icon: Plans },
        ]}
      />

      <Form values={values} onSubmit={submit} className="space-y-5 pb-8">
        {({ field, touch, errors }) => (
          <>
            <SectionCard icon={Plans} title={t("TITLES.subscriptionPlanDetails")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BaseTextInput
                  name="name_ar"
                  label={`${t("TITLES.nameArabic")} *`}
                  value={values.name_ar}
                  onInput={(v) => {
                    setField("name_ar")(v);
                    touch("name_ar");
                  }}
                  {...field("name_ar", errors)}
                />
                <BaseTextInput
                  name="name_en"
                  label={t("TITLES.nameEnglish")}
                  value={values.name_en}
                  onInput={(v) => setField("name_en")(v)}
                />
                <BaseTextInput
                  name="description_ar"
                  type="textarea"
                  label={t("TITLES.descriptionArabic")}
                  value={values.description_ar}
                  onInput={(v) => setField("description_ar")(v)}
                />
                <BaseTextInput
                  name="description_en"
                  type="textarea"
                  label={t("TITLES.descriptionEnglish")}
                  value={values.description_en}
                  onInput={(v) => setField("description_en")(v)}
                />
                <BaseTextInput
                  name="price"
                  type="number"
                  label={`${t("TITLES.price")} *`}
                  value={values.price}
                  onInput={(v) => {
                    setField("price")(v);
                    touch("price");
                  }}
                  {...field("price", errors)}
                />
                <BaseTextInput
                  name="duration_in_days"
                  type="number"
                  label={`${t("TITLES.durationInDays")} *`}
                  value={values.duration_in_days}
                  onInput={(v) => {
                    setField("duration_in_days")(v);
                    touch("duration_in_days");
                  }}
                  {...field("duration_in_days", errors)}
                />
                <BaseSelectInput
                  name="target_role"
                  label={`${t("TITLES.targetRole")} *`}
                  items={roleOptions}
                  value={selectedRole}
                  onChange={(v) =>
                    setField("target_role")(v as SelectOption | null)
                  }
                />
                <div className="flex items-end pb-1">
                  <BaseSwitchInput
                    name="is_active"
                    label={t("TITLES.activeAccount")}
                    value={values.is_active}
                    onChange={(v) => setField("is_active")(v)}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={CheckBadge} title={t("TITLES.features")}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {values.features.length === 0
                    ? t("LABELS.noFeatures")
                    : `${values.features.length}`}
                </p>
                <Button type="button" variant="soft" onClick={addFeature}>
                  <Plus width={14} height={14} />
                  {t("ACTIONS.addFeature")}
                </Button>
              </div>

              {values.features.length === 0 ? null : (
                <div className="space-y-3">
                  {values.features.map((f, idx) => (
                    <div
                      key={f.key}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          {t("TITLES.feature")} #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFeature(f.key)}
                          className="flex size-8 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-500/10"
                          aria-label={t("ACTIONS.delete")}
                        >
                          <Trash width={14} height={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <BaseTextInput
                          name={`feature_ar_${f.key}`}
                          label={`${t("TITLES.nameArabic")} *`}
                          value={f.name_ar}
                          onInput={(v) => updateFeature(f.key, { name_ar: v })}
                        />
                        <BaseTextInput
                          name={`feature_en_${f.key}`}
                          label={t("TITLES.nameEnglish")}
                          value={f.name_en}
                          onInput={(v) => updateFeature(f.key, { name_en: v })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="soft"
                onClick={() => navigate(`/subscription-plans/${plan.id}`)}
              >
                {t("BUTTONS.cancel")}
              </Button>
              <Button type="submit" loading={saving}>
                {t("BUTTONS.save")}
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
