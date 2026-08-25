import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  BanknotesIcon as Banknotes,
  UserCircleIcon as UserCircle,
  CreditCardIcon as CreditCard,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import {
  InfoCard,
  SectionHeading,
  StatusBadge,
  displayName,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type { Payment } from "../../types/payments";

function formatAmount(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function PaymentShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`payments/${id}`);
        setPayment(res.data?.data ?? null);
      } catch (e: any) {
        toast.error(t("MESSAGES.failedToLoadPayments"), e?.response?.data?.message);
        setPayment(null);
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

  if (!payment) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link to="/payments?page=1" className="text-sm text-primary hover:underline">
          ← {t("TITLES.payments")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title={`${t("TITLES.payment")} #${payment.id}`}
        translateTitle={false}
        icon={Banknotes}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "payments", href: "/payments?page=1", icon: Banknotes },
          { label: `#${payment.id}`, icon: CreditCard },
        ]}
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={CreditCard} title={t("TITLES.paymentDetails")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.amount")}>
                {formatAmount(payment.amount)}
              </InfoCard>
              <InfoCard label={t("TITLES.status")}>
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
              <InfoCard label={t("TITLES.subscription")}>
                {payment.subscription_name ?? "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.paymentGateway")}>
                {payment.payment_gateway || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.transactionId")}>
                <span className="break-all font-mono text-xs">
                  {payment.gateway_transaction_id || "—"}
                </span>
              </InfoCard>
              <InfoCard label={t("TITLES.paidAt")}>
                {formatDate(payment.paid_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.createdAt")}>
                {formatDate(payment.created_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.updatedAt")}>
                {formatDate(payment.updated_at)}
              </InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={UserCircle} title={t("TITLES.user")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.name")}>
                {displayName(payment.user?.full_name)}
              </InfoCard>
              <InfoCard label={t("TITLES.email")}>
                {payment.user?.email ? (
                  <a
                    href={`mailto:${payment.user.email}`}
                    className="break-all text-primary hover:underline"
                  >
                    {payment.user.email}
                  </a>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.phone")}>
                {payment.user?.phone ? (
                  <bdo dir="ltr">{payment.user.phone}</bdo>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.id")}>
                {payment.user?.id ?? "—"}
              </InfoCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
