import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  EnvelopeIcon as Mail,
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
import type { Contact } from "../../types/contacts";

export default function ContactShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`contacts/${id}`);
      setItem(res.data?.data ?? null);
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadContacts"),
        e?.response?.data?.message
      );
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, t]);

  const remove = async () => {
    if (!item) return;
    try {
      setDeleting(true);
      const res = await api.delete(`contacts/${item.id}`);
      toast.success(t("MESSAGES.deletedSuccess"), res.data?.message);
      navigate("/contacts?page=1");
    } catch (e: any) {
      toast.error(t("MESSAGES.deletedFailed"), e?.response?.data?.message);
    } finally {
      setDeleting(false);
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
          to="/contacts?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.contacts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title={item.subject || `${t("TITLES.contact")} #${item.id}`}
        translateTitle={false}
        icon={Mail}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          {
            label: "contacts",
            href: "/contacts?page=1",
            icon: Mail,
          },
          { label: `#${item.id}`, icon: Mail },
        ]}
        rightActions={
          <Button
            type="button"
            variant="danger"
            onClick={() => setDeleteOpen(true)}
          >
            {t("ACTIONS.delete")}
          </Button>
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading
              icon={Mail}
              title={t("TITLES.contactDetails")}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.status")}>
                <StatusBadge
                  status={item.is_read ? "read" : "unread"}
                  label={item.is_read ? t("STATUS.read") : t("STATUS.unread")}
                />
              </InfoCard>
              <InfoCard label={t("TITLES.createdAt")}>
                {formatDate(item.created_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.readAt")}>
                {formatDate(item.read_at)}
              </InfoCard>
            </div>
            <div className="mt-4">
              <InfoCard label={t("TITLES.subject")}>
                <p className="text-sm font-normal">{item.subject || "—"}</p>
              </InfoCard>
            </div>
            <div className="mt-4">
              <InfoCard label={t("TITLES.message")}>
                <p className="whitespace-pre-wrap text-sm font-normal">
                  {item.message || "—"}
                </p>
              </InfoCard>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={UserCircle} title={t("TITLES.sender")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.name")}>
                {displayName(item.name)}
              </InfoCard>
              <InfoCard label={t("TITLES.email")}>
                {item.email ? (
                  <a
                    href={`mailto:${item.email}`}
                    className="text-primary hover:underline"
                  >
                    {item.email}
                  </a>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.phone")}>
                {item.phone ? <bdo dir="ltr">{item.phone}</bdo> : "—"}
              </InfoCard>
            </div>
          </div>
        </div>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteOpen(false)}
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
                type="button"
                variant="soft"
                className="flex-1"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
              >
                {t("BUTTONS.cancel")}
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
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
