import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  TicketIcon as Ticket,
  UserCircleIcon as UserCircle,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { Button } from "../../components/UI/Button";
import { Deleter } from "../../components/Shared/Deleter";
import {
  InfoCard,
  SectionHeading,
  StatusBadge,
  displayName,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type { DiscountCode } from "../../types/codes";

export default function CodeShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`codes/${id}`);
        setCode(res.data?.data ?? null);
      } catch (e: any) {
        toast.error(t("MESSAGES.failedToLoadCodes"), e?.response?.data?.message);
        setCode(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton sections={[{ fields: [{}, {}, {}, {}] }, { fields: [{}, {}] }]} />
      </div>
    );
  }

  if (!code) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link to="/codes?page=1" className="text-sm text-primary hover:underline">
          ← {t("TITLES.codes")}
        </Link>
      </div>
    );
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code.code);
      toast.success(t("MESSAGES.copied"));
    } catch {
      toast.error(t("MESSAGES.copyFailed"));
    }
  };

  return (
    <div className="space-y-0">
      <PageHeader
        title={code.code}
        translateTitle={false}
        icon={Ticket}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "codes", href: "/codes?page=1", icon: Ticket },
          { label: code.code, icon: Ticket },
        ]}
        rightActions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="soft" onClick={copyCode}>
              {t("ACTIONS.copy")}
            </Button>
            <Deleter
              url={`codes/${code.id}`}
              text={t("ACTIONS.delete")}
              onReload={() => navigate("/codes?page=1")}
            />
          </div>
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={Ticket} title={t("TITLES.codeDetails")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.code")}>
                <span className="font-mono font-semibold tracking-wide">
                  {code.code}
                </span>
              </InfoCard>
              <InfoCard label={t("TITLES.discount")}>
                {code.discount_percentage != null
                  ? `${code.discount_percentage}%`
                  : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.status")}>
                <StatusBadge
                  status={code.status}
                  label={
                    code.status
                      ? t(`STATUS.${code.status}`, {
                          defaultValue: code.status.replace(/_/g, " "),
                        })
                      : undefined
                  }
                />
              </InfoCard>
              <InfoCard label={t("TITLES.generatedAt")}>
                {formatDate(code.generated_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.usedAt")}>
                {formatDate(code.used_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.generatedBy")}>
                {displayName(
                  code.generated_by?.name || code.generated_by?.full_name
                )}
              </InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={UserCircle} title={t("TITLES.usedBy")} />
            {code.used_by ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                <InfoCard label={t("TITLES.name")}>
                  {displayName(
                    code.used_by.full_name || code.used_by.name
                  )}
                </InfoCard>
                <InfoCard label={t("TITLES.email")}>
                  {code.used_by.email || "—"}
                </InfoCard>
                <InfoCard label={t("TITLES.phone")}>
                  {code.used_by.phone || "—"}
                </InfoCard>
                <InfoCard label={t("TITLES.id")}>
                  {code.used_by.id ?? "—"}
                </InfoCard>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("LABELS.codeNotUsed")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
