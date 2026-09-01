import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  BuildingOffice2Icon as Building,
  UserCircleIcon as UserCircle,
  ShieldCheckIcon as ShieldCheck,
  BookOpenIcon as BookOpen,
  LanguageIcon as Language,
  StarIcon as Star,
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
  accountDisplayStatus,
  displayName,
  formatDate,
  isAccountSuspended,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { LawFirmDetail, NamedLocale } from "../../types/accounts";

function localeName(item: NamedLocale, lang: string) {
  return lang === "ar" ? item.name_ar : item.name_en;
}

export default function LawFirmShow() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const { id } = useParams();
  const [firm, setFirm] = useState<LawFirmDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`law-firms/${id}`);
      setFirm(res.data?.data ?? null);
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadLawFirms"), e?.response?.data?.message);
      setFirm(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const restore = async () => {
    try {
      const res = await api.put(`law-firms/${id}/restore`);
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

  if (!firm) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link to="/law-firms?page=1" className="text-sm text-primary hover:underline">
          ← {t("TITLES.lawFirms")}
        </Link>
      </div>
    );
  }

  const isSuspended = isAccountSuspended(firm);
  const displayStatus = accountDisplayStatus(firm);

  return (
    <div className="space-y-0">
      <PageHeader
        title={displayName(firm.full_name)}
        translateTitle={false}
        icon={Building}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "lawFirms", href: "/law-firms?page=1", icon: Building },
          { label: displayName(firm.full_name), icon: UserCircle },
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
                url={`law-firms/${firm.id}`}
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
              <InfoCard label={t("TITLES.name")}>{displayName(firm.full_name)}</InfoCard>
              <InfoCard label={t("TITLES.email")}>
                {firm.email ? (
                  <a href={`mailto:${firm.email}`} className="break-all text-primary hover:underline">
                    {firm.email}
                  </a>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.phone")}>
                {firm.phone ? <bdo dir="ltr">{firm.phone}</bdo> : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.officialName")}>
                {firm.official_name || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.licenseNumber")}>
                {firm.license_number || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.qualification")}>
                {firm.qualification_degree
                  ? t(`STATUS.${firm.qualification_degree}`, {
                      defaultValue: firm.qualification_degree.replace(/_/g, " "),
                    })
                  : "—"}
              </InfoCard>
            </div>
            {firm.bio && (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{firm.bio}</p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={ShieldCheck} title={t("TITLES.accountInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.status")}>
                <StatusBadge
                  status={displayStatus}
                  label={
                    displayStatus
                      ? t(`STATUS.${displayStatus}`, {
                          defaultValue: displayStatus.replace(/_/g, " "),
                        })
                      : undefined
                  }
                />
              </InfoCard>
              <InfoCard label={t("TITLES.verification")}>
                <StatusBadge
                  status={firm.verification_status}
                  label={
                    firm.verification_status
                      ? t(`STATUS.${firm.verification_status}`, {
                          defaultValue: firm.verification_status.replace(/_/g, " "),
                        })
                      : undefined
                  }
                />
              </InfoCard>
              <InfoCard label={t("TITLES.membership")}>
                <StatusBadge
                  status={firm.membership_type}
                  label={
                    firm.membership_type
                      ? t(`STATUS.${firm.membership_type}`, {
                          defaultValue: firm.membership_type,
                        })
                      : undefined
                  }
                />
              </InfoCard>
              <InfoCard label={t("TITLES.commercialRegistry")}>
                {firm.commercial_registry_verified ? t("BUTTONS.yes") : t("BUTTONS.no")}
              </InfoCard>
              <InfoCard label={t("TITLES.joinedAt")}>{formatDate(firm.joined_at)}</InfoCard>
              <InfoCard label={t("TITLES.address")}>{firm.address || "—"}</InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={Star} title={t("TITLES.ratings")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoCard label={t("TITLES.avgRating")}>{firm.avg_rating ?? 0}</InfoCard>
              <InfoCard label={t("TITLES.ratingsCount")}>{firm.ratings_count ?? 0}</InfoCard>
              <InfoCard label={t("TITLES.priceOffers")}>{firm.price_offers_count ?? 0}</InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={Language} title={t("TITLES.languages")} />
            {(firm.languages ?? []).length ? (
              <div className="flex flex-wrap gap-2">
                {firm.languages!.map((l) => (
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
            {(firm.practice_areas ?? []).length ? (
              <div className="flex flex-wrap gap-2">
                {firm.practice_areas!.map((a) => (
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
