import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  UsersIcon as Users,
  UserCircleIcon as UserCircle,
  UserIcon as User,
  UserGroupIcon as UserGroup,
  ShieldCheckIcon as ShieldCheck,
  CalendarDaysIcon as CalendarDays,
  CreditCardIcon as CreditCard,
  BanknotesIcon as Banknotes,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
  HashtagIcon as Hashtag,
  ClipboardDocumentListIcon as ClipboardList,
  ArrowPathIcon as Restore,
  ArrowPathRoundedSquareIcon as AutoRenew,
  ArrowTopRightOnSquareIcon as ExternalLink,
  GlobeAltIcon as Globe,
  FingerPrintIcon as FingerPrint,
  CheckBadgeIcon as CheckBadge,
  ClockIcon as Clock,
  TagIcon as Tag,
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
import type { ClientDetail, ClientPayment } from "../../types/accounts";

function formatAmount(amount: string | number | null | undefined) {
  if (amount == null || amount === "") return "—";
  const value = Number(amount);
  if (Number.isNaN(value)) return String(amount);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function ClientShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`clients/${id}`);
      setClient(res.data?.data ?? null);
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadClients"), e?.response?.data?.message);
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const restore = async () => {
    try {
      const res = await api.put(`clients/${id}/restore`);
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

  if (!client) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link to="/clients?page=1" className="text-sm text-primary hover:underline">
          ← {t("TITLES.clients")}
        </Link>
      </div>
    );
  }

  const sub = client.subscription;
  const payments: ClientPayment[] = Array.isArray(client.payments) ? client.payments : [];
  const isSuspended = client.status === "suspended";
  const isActive = client.status === "active";

  return (
    <div className="space-y-0">
      <PageHeader
        title={displayName(client.full_name)}
        translateTitle={false}
        icon={UserCircle}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "clients", href: "/clients?page=1", icon: Users },
          { label: displayName(client.full_name), icon: UserCircle },
        ]}
        rightActions={
          <div className="flex items-center gap-2">
            {isSuspended && (
              <Button type="button" variant="soft" onClick={restore}>
                <Restore width={14} height={14} />
                {t("ACTIONS.restore")}
              </Button>
            )}
            {isActive && (
              <Deleter
                url={`clients/${client.id}`}
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
              <InfoCard icon={User} label={t("TITLES.name")}>
                {displayName(client.full_name)}
              </InfoCard>
              <InfoCard icon={Mail} label={t("TITLES.email")}>
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="break-all text-primary hover:underline">
                    {client.email}
                  </a>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard icon={Phone} label={t("TITLES.phone")}>
                {client.phone ? <bdo dir="ltr">{client.phone}</bdo> : "—"}
              </InfoCard>
              <InfoCard icon={UserCircle} label={t("TITLES.gender")}>
                {client.gender
                  ? t(`TITLES.${client.gender}`, { defaultValue: client.gender })
                  : "—"}
              </InfoCard>
              <InfoCard icon={UserGroup} label={t("TITLES.lawyerGenderPreference")}>
                {client.lawyer_gender_preference
                  ? t(`TITLES.${client.lawyer_gender_preference}`, {
                      defaultValue: client.lawyer_gender_preference,
                    })
                  : "—"}
              </InfoCard>
              <InfoCard icon={CheckBadge} label={t("TITLES.status")}>
                {client.status === "active" || client.status === "suspended" ? (
                  <StatusBadge
                    status={client.status}
                    label={t(`STATUS.${client.status}`)}
                  />
                ) : (
                  "—"
                )}
              </InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={ShieldCheck} title={t("TITLES.accountInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard icon={Hashtag} label="ID">#{client.id}</InfoCard>
              <InfoCard icon={CalendarDays} label={t("TITLES.joinedAt")}>
                {formatDate(client.joined_at)}
              </InfoCard>
              <InfoCard icon={ClipboardList} label={t("TITLES.legalRequests")}>
                {client.legal_requests_count ?? 0}
              </InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={CreditCard} title={t("TITLES.subscription")} />
            {sub ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                <InfoCard icon={CheckBadge} label={t("TITLES.status")}>
                  <StatusBadge status={sub.status} />
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
                <InfoCard icon={Tag} label={t("TITLES.planId")}>#{sub.plan_id}</InfoCard>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard width={16} height={16} className="shrink-0 opacity-70" />
                {t("TITLES.noSubscription")}
              </p>
            )}
          </div>
        </div>

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

{/*         <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={CalendarDays} title={t("TITLES.metaInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoCard icon={Hashtag} label="ID">#{client.id}</InfoCard>
              <InfoCard icon={CalendarDays} label={t("TITLES.joinedAt")}>
                {formatDate(client.joined_at)}
              </InfoCard>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
