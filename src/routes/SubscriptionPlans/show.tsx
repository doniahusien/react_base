import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  RectangleStackIcon as Plans,
  PencilIcon as Pencil,
  CheckBadgeIcon as CheckBadge,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { Button } from "../../components/UI/Button";
import {
  InfoCard,
  SectionHeading,
  StatusBadge,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { SubscriptionPlan } from "../../types/subscriptionPlans";

function formatAmount(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function SubscriptionPlanShow() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`subscription-plans/${id}`);
        setPlan(res.data?.data ?? null);
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadSubscriptionPlans"),
          e?.response?.data?.message
        );
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  if (loading) {
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

  const title =
    lang === "ar"
      ? plan.name_ar || plan.name_en || plan.name || `#${plan.id}`
      : plan.name_en || plan.name_ar || plan.name || `#${plan.id}`;

  const description =
    lang === "ar"
      ? plan.description_ar || plan.description_en || plan.description
      : plan.description_en || plan.description_ar || plan.description;

  const featureName = (f: NonNullable<SubscriptionPlan["features"]>[number]) =>
    lang === "ar"
      ? f.name_ar || f.name_en || f.name || "—"
      : f.name_en || f.name_ar || f.name || "—";

  return (
    <div className="space-y-0">
      <PageHeader
        title={title}
        translateTitle={false}
        icon={Plans}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          {
            label: "subscriptionPlans",
            href: "/subscription-plans?page=1",
            icon: Plans,
          },
          { label: `#${plan.id}`, icon: Plans },
        ]}
        rightActions={
          <Button
            type="button"
            onClick={() => navigate(`/subscription-plans/${plan.id}/edit`)}
          >
            <Pencil width={16} height={16} />
            {t("ACTIONS.edit")}
          </Button>
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading
              icon={Plans}
              title={t("TITLES.subscriptionPlanDetails")}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.nameArabic")}>
                {plan.name_ar || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.nameEnglish")}>
                {plan.name_en || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.slug")}>{plan.slug || "—"}</InfoCard>
              <InfoCard label={t("TITLES.price")}>
                {formatAmount(plan.price)}
              </InfoCard>
              <InfoCard label={t("TITLES.durationInDays")}>
                {plan.duration_in_days != null
                  ? t("LABELS.daysCount", { count: plan.duration_in_days })
                  : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.targetRole")}>
                {plan.target_role
                  ? t(`TITLES.${plan.target_role}`, {
                      defaultValue: plan.target_role,
                    })
                  : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.status")}>
                <StatusBadge
                  status={plan.is_active ? "active" : "inactive"}
                  label={
                    plan.is_active ? t("STATUS.active") : t("STATUS.inactive")
                  }
                />
              </InfoCard>
              <InfoCard label={t("TITLES.createdAt")}>
                {formatDate(plan.created_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.updatedAt")}>
                {formatDate(plan.updated_at)}
              </InfoCard>
            </div>
          </div>

          {(plan.description_ar ||
            plan.description_en ||
            plan.description) && (
            <div className="border-b border-border px-6 py-5">
              <SectionHeading icon={Plans} title={t("TITLES.description")} />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoCard label={t("TITLES.descriptionArabic")}>
                  <p className="whitespace-pre-wrap text-sm">
                    {plan.description_ar || "—"}
                  </p>
                </InfoCard>
                <InfoCard label={t("TITLES.descriptionEnglish")}>
                  <p className="whitespace-pre-wrap text-sm">
                    {plan.description_en || "—"}
                  </p>
                </InfoCard>
              </div>
              {description && !plan.description_ar && !plan.description_en ? (
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={CheckBadge} title={t("TITLES.features")} />
            {(plan.features ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("LABELS.noFeatures")}
              </p>
            ) : (
              <ul className="space-y-2">
                {(plan.features ?? []).map((f, i) => (
                  <li
                    key={f.id ?? `${f.name_ar}-${i}`}
                    className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {featureName(f)}
                      </p>
                      {(f.name_ar || f.name_en) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[f.name_ar, f.name_en].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
