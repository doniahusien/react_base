import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  BellIcon as Bell,
  TrashIcon as Trash,
  UserIcon as User,
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
import { toast } from "../../stores/toast";
import type { AppNotification } from "../../types/notifications";

export default function NotificationShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<AppNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`notifications/${id}`);
        setItem(res.data?.data ?? null);
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadNotification"),
          e?.response?.data?.message
        );
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  const remove = async () => {
    if (!item) return;
    try {
      setDeleting(true);
      const res = await api.delete(`notifications/${item.id}`);
      toast.success(t("MESSAGES.deletedSuccess"), res.data?.message);
      navigate("/notifications?page=1");
    } catch (e: any) {
      toast.error(t("MESSAGES.deletedFailed"), e?.response?.data?.message);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

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
          to="/notifications?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.notifications")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title={item.title || `#${item.id}`}
        translateTitle={false}
        subtitle={t("TITLES.notificationDetails")}
        translateSubtitle={false}
        icon={Bell}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "notifications", href: "/notifications?page=1", icon: Bell },
          { label: item.title || `#${item.id}`, translate: false, icon: Bell },
        ]}
        rightActions={
          <Button
            type="button"
            variant="danger"
            loading={deleting}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash width={16} height={16} />
            {t("ACTIONS.delete")}
          </Button>
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={Bell} title={t("TITLES.basicInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label="ID">#{item.id}</InfoCard>
              <InfoCard label={t("TITLES.title")}>{item.title || "—"}</InfoCard>
              <InfoCard label={t("TITLES.targetSegment")}>
                {item.target_segment
                  ? t(`NOTIFICATION_SEGMENT.${item.target_segment}`, {
                      defaultValue: item.target_segment,
                    })
                  : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.status")}>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.is_read
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {item.is_read ? t("STATUS.read") : t("STATUS.unread")}
                </span>
              </InfoCard>
              <InfoCard label={t("TITLES.readAt")}>
                {item.read_at ? formatDate(item.read_at) : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.deepLink")}>
                {item.deep_link ? (
                  <span dir="ltr" className="break-all">
                    {item.deep_link}
                  </span>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.createdAt")}>
                {formatDate(item.created_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.updatedAt")}>
                {formatDate(item.updated_at)}
              </InfoCard>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("TITLES.body")}
              </p>
              <p className="whitespace-pre-line text-sm text-foreground">
                {item.body || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={User} title={t("TITLES.recipient")} />
            {item.recipient ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                <InfoCard label={t("TITLES.name")}>
                  {item.recipient.full_name || "—"}
                </InfoCard>
                <InfoCard label={t("TITLES.email")}>
                  <span dir="ltr">{item.recipient.email || "—"}</span>
                </InfoCard>
                <InfoCard label={t("TITLES.sentBy")}>
                  {item.sent_by_admin?.full_name || t("TITLES.system")}
                </InfoCard>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoCard label={t("TITLES.recipient")}>
                  {t("LABELS.broadcastNotification")}
                </InfoCard>
                <InfoCard label={t("TITLES.sentBy")}>
                  {item.sent_by_admin?.full_name || t("TITLES.system")}
                </InfoCard>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-background p-6 shadow-2xl">
            <h3 className="mb-2 text-base font-semibold text-foreground">
              {t("TITLES.confirmDelete")}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {t("MESSAGES.confirmDelete")}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="flex-1 max-w-full"
                onClick={() => setConfirmOpen(false)}
              >
                {t("BUTTONS.cancel")}
              </Button>
              <Button
                variant="danger"
                className="flex-1 max-w-full"
                loading={deleting}
                onClick={remove}
              >
                {t("BUTTONS.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
