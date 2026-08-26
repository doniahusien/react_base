import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  GlobeAltIcon as Globe,
  PencilIcon as Pencil,
  PhoneIcon as Phone,
  PhotoIcon as Photo,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { Button } from "../../components/UI/Button";
import {
  InfoCard,
  SectionHeading,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { mediaUrl } from "../../lib/mediaUrl";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { Country } from "../../types/countries";

export default function CountryShow() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`countries/${id}`);
        setItem(res.data?.data ?? null);
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadCountry"),
          e?.response?.data?.message
        );
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton sections={[{ fields: [{}, {}, {}] }, { fields: [{}, {}] }]} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link
          to="/countries?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.countries")}
        </Link>
      </div>
    );
  }

  const title =
    lang === "ar"
      ? item.name_ar || item.name_en || item.name || "—"
      : item.name_en || item.name_ar || item.name || "—";
  const flagSrc = mediaUrl(item.flag) ?? item.flag;

  return (
    <div className="space-y-0">
      <PageHeader
        title={title}
        translateTitle={false}
        subtitle={t("TITLES.countryDetails")}
        translateSubtitle={false}
        icon={Globe}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "countries", href: "/countries?page=1", icon: Globe },
          { label: title, icon: Globe },
        ]}
        rightActions={
          <Button
            type="button"
            onClick={() => navigate(`/countries/${item.id}/edit`)}
          >
            <Pencil width={16} height={16} />
            {t("ACTIONS.edit")}
          </Button>
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={Globe} title={t("TITLES.basicInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.nameArabic")}>
                {item.name_ar || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.nameEnglish")}>
                {item.name_en || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.code")}>{item.code || "—"}</InfoCard>
              <InfoCard label={t("TITLES.status")}>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.is_active
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.is_active
                    ? t("STATUS.active")
                    : t("STATUS.inactive")}
                </span>
              </InfoCard>
              <InfoCard label={t("TITLES.createdAt")}>
                {formatDate(item.created_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.updatedAt")}>
                {formatDate(item.updated_at)}
              </InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={Phone} title={t("TITLES.contactInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.phoneCode")}>
                <span dir="ltr">{item.phone_code || "—"}</span>
              </InfoCard>
              <InfoCard label={t("TITLES.phoneLimit")}>
                {item.phone_length ?? "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.phoneStartsWith")}>
                {item.phone_starts_with || "—"}
              </InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={Photo} title={t("TITLES.flag")} />
            {flagSrc ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 p-4">
                <img
                  src={flagSrc}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="mx-auto max-h-48 w-auto max-w-full rounded-lg object-contain shadow-sm"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
