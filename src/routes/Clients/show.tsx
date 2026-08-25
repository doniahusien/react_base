import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  UsersIcon as Users,
  UserCircleIcon as UserCircle,
  ShieldCheckIcon as ShieldCheck,
  CalendarDaysIcon as CalendarDays,
  CreditCardIcon as CreditCard,
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
import type { ClientDetail } from "../../types/accounts";

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
              <InfoCard label={t("TITLES.name")}>{displayName(client.full_name)}</InfoCard>
              <InfoCard label={t("TITLES.email")}>
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="break-all text-primary hover:underline">
                    {client.email}
                  </a>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.phone")}>
                {client.phone ? <bdo dir="ltr">{client.phone}</bdo> : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.gender")}>
                {client.gender
                  ? t(`TITLES.${client.gender}`, { defaultValue: client.gender })
                  : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.lawyerGenderPreference")}>
                {client.lawyer_gender_preference
                  ? t(`TITLES.${client.lawyer_gender_preference}`, {
                      defaultValue: client.lawyer_gender_preference,
                    })
                  : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.status")}>
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
              <InfoCard label="ID">#{client.id}</InfoCard>
              <InfoCard label={t("TITLES.joinedAt")}>{formatDate(client.joined_at)}</InfoCard>
              <InfoCard label={t("TITLES.legalRequests")}>
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
                <InfoCard label={t("TITLES.status")}>
                  <StatusBadge status={sub.status} />
                </InfoCard>
                <InfoCard label={t("ANALYTICS.fromDate")}>
                  {formatDate(sub.start_date)}
                </InfoCard>
                <InfoCard label={t("ANALYTICS.toDate")}>{formatDate(sub.end_date)}</InfoCard>
                <InfoCard label={t("TITLES.autoRenew")}>
                  {sub.auto_renew ? t("BUTTONS.yes") : t("BUTTONS.no")}
                </InfoCard>
                <InfoCard label={t("TITLES.planId")}>#{sub.plan_id}</InfoCard>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("TITLES.noSubscription")}</p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={CalendarDays} title={t("TITLES.metaInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoCard label="ID">#{client.id}</InfoCard>
              <InfoCard label={t("TITLES.joinedAt")}>{formatDate(client.joined_at)}</InfoCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
