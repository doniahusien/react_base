import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  ScaleIcon as Scale,
  UserCircleIcon as UserCircle,
  ShieldCheckIcon as ShieldCheck,
  BookOpenIcon as BookOpen,
  LanguageIcon as Language,
  StarIcon as Star,
  CreditCardIcon as CreditCard,
  CalendarDaysIcon as CalendarDays,
  ArrowPathRoundedSquareIcon as AutoRenew,
  TagIcon as Tag,
  BanknotesIcon as Banknotes,
  ArrowTopRightOnSquareIcon as ExternalLink,
  GlobeAltIcon as Globe,
  FingerPrintIcon as FingerPrint,
  CheckBadgeIcon as CheckBadge,
  ClockIcon as Clock,
  InboxIcon as Inbox,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { Deleter } from "../../components/Shared/Deleter";
import { Button } from "../../components/UI/Button";
import {
  InfoCard,
  SectionHeading,
  StatusBadge,
  displayName,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { ClientPayment, LawyerDetail, NamedLocale } from "../../types/accounts";

function formatAmount(amount: string | number | null | undefined) {
  if (amount == null || amount === "") return "—";
  const value = Number(amount);
  if (Number.isNaN(value)) return String(amount);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function localeName(item: NamedLocale, lang: string) {
  return lang === "ar" ? item.name_ar : item.name_en;
}

export default function LawyerShow() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const { id } = useParams();
  const [lawyer, setLawyer] = useState<LawyerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`lawyers/${id}`);
      setLawyer(res.data?.data ?? null);
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadLawyers"), e?.response?.data?.message);
      setLawyer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const restore = async () => {
    try {
      const res = await api.put(`lawyers/${id}/restore`);
      toast.success(t("MESSAGES.restoredSuccess"), res.data?.message);
      load();
    } catch (e: any) {
      toast.error(t("MESSAGES.restoreFailed"), e?.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton sections={[{ fields: [{}, {}, {}, {}] }, { fields: [{}, {}, {}] }]} />
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link to="/lawyers?page=1" className="text-sm text-primary hover:underline">
          ← {t("TITLES.lawyers")}
        </Link>
      </div>
    );
  }

  const isSuspended = lawyer.status === "suspended";
  const sub = lawyer.subscription;
  const payments: ClientPayment[] = Array.isArray(lawyer.payments) ? lawyer.payments : [];

  return (
    <div className="space-y-0">
      <PageHeader
        title={displayName(lawyer.full_name)}
        translateTitle={false}
        icon={Scale}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "lawyers", href: "/lawyers?page=1", icon: Scale },
          { label: displayName(lawyer.full_name), icon: UserCircle },
        ]}
        rightActions={
          <div className="flex items-center gap-2">
            {isSuspended && (
              <Button type="button" variant="soft" onClick={restore}>
                {t("ACTIONS.restore")}
              </Button>
            )}
            {!isSuspended && (
              <Deleter
                url={`lawyers/${lawyer.id}`}
                text={t("ACTIONS.suspend")}
                onReload={() => load()}
              />
            )}
          </div>
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={UserCircle} title={t("PROFILE.basicInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.name")}>{displayName(lawyer.full_name)}</InfoCard>
              <InfoCard label={t("TITLES.email")}>
                {lawyer.email ? (
                  <a href={`mailto:${lawyer.email}`} className="break-all text-primary hover:underline">
                    {lawyer.email}
                  </a>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.phone")}>
                {lawyer.phone ? <bdo dir="ltr">{lawyer.phone}</bdo> : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.officialName")}>
                {lawyer.official_name || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.licenseNumber")}>
                {lawyer.license_number || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.qualification")}>
                {lawyer.qualification_degree
                  ? t(`STATUS.${lawyer.qualification_degree}`, {
                      defaultValue: lawyer.qualification_degree.replace(/_/g, " "),
                    })
                  : "—"}
              </InfoCard>
            </div>
            {lawyer.bio && (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{lawyer.bio}</p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={ShieldCheck} title={t("TITLES.accountInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.status")}>
                <StatusBadge
                  status={lawyer.status}
                  label={
                    lawyer.status
                      ? t(`STATUS.${lawyer.status}`, {
                          defaultValue: lawyer.status.replace(/_/g, " "),
                        })
                      : undefined
                  }
                />
              </InfoCard>
              <InfoCard label={t("TITLES.verification")}>
                <StatusBadge
                  status={lawyer.verification_status}
                  label={
                    lawyer.verification_status
                      ? t(`STATUS.${lawyer.verification_status}`, {
                          defaultValue: lawyer.verification_status.replace(/_/g, " "),
                        })
                      : undefined
                  }
                />
              </InfoCard>
              <InfoCard label={t("TITLES.membership")}>
                <StatusBadge
                  status={lawyer.membership_type}
                  label={
                    lawyer.membership_type
                      ? t(`STATUS.${lawyer.membership_type}`, {
                          defaultValue: lawyer.membership_type,
                        })
                      : undefined
                  }
                />
              </InfoCard>
              <InfoCard label={t("TITLES.commercialRegistry")}>
                {lawyer.commercial_registry_verified ? t("BUTTONS.yes") : t("BUTTONS.no")}
              </InfoCard>
              <InfoCard label={t("TITLES.joinedAt")}>{formatDate(lawyer.joined_at)}</InfoCard>
              <InfoCard label={t("TITLES.address")}>{lawyer.address || "—"}</InfoCard>
            </div>
          </div>
        </div>

        {sub ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="px-6 py-5">
              <SectionHeading icon={CreditCard} title={t("TITLES.subscription")} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                <InfoCard label={t("TITLES.status")}>
                  <StatusBadge
                    status={sub.status}
                    label={
                      sub.status
                        ? t(`STATUS.${sub.status}`, {
                            defaultValue: sub.status.replace(/_/g, " "),
                          })
                        : undefined
                    }
                  />
                </InfoCard>
                <InfoCard icon={CalendarDays} label={t("ANALYTICS.fromDate")}>
                  {formatDate(sub.start_date)}
                </InfoCard>
                <InfoCard icon={CalendarDays} label={t("ANALYTICS.toDate")}>
                  {formatDate(sub.end_date)}
                </InfoCard>
                <InfoCard icon={AutoRenew} label={t("TITLES.autoRenew")}>
                  {sub.auto_renew ? t("BUTTONS.yes") : t("BUTTONS.no")}
                </InfoCard>
                <InfoCard icon={Tag} label={t("TITLES.planId")}>
                  <Link
                    to={`/subscription-plans/${sub.plan_id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    #{sub.plan_id}
                  </Link>
                </InfoCard>
              </div>
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={Banknotes} title={t("TITLES.payments")} />
            {payments.length ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Banknotes width={14} height={14} />
                        </span>
                        <p className="text-sm font-semibold text-foreground">
                          {t("TITLES.payment")} #{payment.id}
                        </p>
                      </div>
                      <Link
                        to={`/payments/${payment.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {t("TITLES.paymentDetails")}
                        <ExternalLink width={12} height={12} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      <InfoCard icon={Banknotes} label={t("TITLES.amount")}>
                        {formatAmount(payment.amount)}
                      </InfoCard>
                      <InfoCard icon={CheckBadge} label={t("TITLES.status")}>
                        <StatusBadge
                          status={payment.status}
                          label={
                            payment.status
                              ? t(`STATUS.${payment.status}`, {
                                  defaultValue: payment.status.replace(/_/g, " "),
                                })
                              : undefined
                          }
                        />
                      </InfoCard>
                      <InfoCard icon={Globe} label={t("TITLES.paymentGateway")}>
                        {payment.payment_gateway || "—"}
                      </InfoCard>
                      <InfoCard icon={FingerPrint} label={t("TITLES.transactionId")}>
                        <span className="break-all font-mono text-xs">
                          {payment.gateway_transaction_id || "—"}
                        </span>
                      </InfoCard>
                      <InfoCard icon={Clock} label={t("TITLES.paidAt")}>
                        {formatDate(payment.paid_at)}
                      </InfoCard>
                      <InfoCard icon={CreditCard} label={t("TITLES.subscription")}>
                        {payment.subscription_id ?? "—"}
                      </InfoCard>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Inbox width={16} height={16} className="shrink-0 opacity-70" />
                {t("TITLES.noPayments")}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={Star} title={t("TITLES.ratings")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoCard label={t("TITLES.avgRating")}>{lawyer.avg_rating ?? 0}</InfoCard>
              <InfoCard label={t("TITLES.ratingsCount")}>{lawyer.ratings_count ?? 0}</InfoCard>
              <InfoCard label={t("TITLES.priceOffers")}>{lawyer.price_offers_count ?? 0}</InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={Language} title={t("TITLES.languages")} />
            {(lawyer.languages ?? []).length ? (
              <div className="flex flex-wrap gap-2">
                {lawyer.languages!.map((l) => (
                  <span
                    key={l.id}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {localeName(l, lang)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("LABELS.noData")}</p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={BookOpen} title={t("TITLES.practiceAreas")} />
            {(lawyer.practice_areas ?? []).length ? (
              <div className="flex flex-wrap gap-2">
                {lawyer.practice_areas!.map((a) => (
                  <span
                    key={a.id}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {localeName(a, lang)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("LABELS.noData")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
