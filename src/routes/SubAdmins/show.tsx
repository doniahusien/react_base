import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  UserGroupIcon as SubAdminsIcon,
  PencilIcon as Pencil,
  ShieldCheckIcon as Shield,
  UserCircleIcon as UserCircle,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
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
import type { SubAdmin } from "../../types/permissions";

export default function SubAdminShow() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<SubAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`sub-admins/${id}`);
        setItem(res.data?.data ?? null);
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadSubAdmins"),
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
          to="/sub-admins?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.subAdmins")}
        </Link>
      </div>
    );
  }

  const permName = (p: { name?: string; name_ar?: string | null; name_en?: string | null; code: string }) => {
    if (i18n.language?.startsWith("ar")) return p.name_ar || p.name || p.code;
    return p.name_en || p.name || p.code;
  };

  return (
    <div className="space-y-0">
      <PageHeader
        title={item.full_name}
        translateTitle={false}
        icon={SubAdminsIcon}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          {
            label: "subAdmins",
            href: "/sub-admins?page=1",
            icon: SubAdminsIcon,
          },
          { label: item.full_name, icon: SubAdminsIcon },
        ]}
        rightActions={
          <Button
            type="button"
            onClick={() => navigate(`/sub-admins/${item.id}/edit`)}
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
              icon={UserCircle}
              title={t("TITLES.basicInfo")}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.name")}>
                {displayName(item.full_name)}
              </InfoCard>
              <InfoCard label={t("TITLES.email")}>{item.email}</InfoCard>
              <InfoCard label={t("TITLES.phone")}>
                {item.phone_number || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.status")}>
                <StatusBadge
                  status={item.status}
                  label={
                    item.status
                      ? t(`STATUS.${item.status}`, {
                          defaultValue: item.status,
                        })
                      : undefined
                  }
                />
              </InfoCard>
              <InfoCard label={t("TITLES.preferredLanguage")}>
                {item.preferred_language === "ar"
                  ? t("TITLES.arabic")
                  : item.preferred_language === "en"
                    ? t("TITLES.english")
                    : item.preferred_language || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.lastLogin")}>
                {formatDate(item.last_login_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.createdAt")}>
                {formatDate(item.created_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.updatedAt")}>
                {formatDate(item.updated_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.createdBy")}>
                {displayName(
                  item.creator_details?.full_name ||
                    item.created_by?.full_name
                )}
              </InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading
              icon={Shield}
              title={t("TITLES.permissions")}
            />
            {item.permissions?.length ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {item.permissions.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {permName(p)}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {p.code}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("LABELS.noPermissions")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
