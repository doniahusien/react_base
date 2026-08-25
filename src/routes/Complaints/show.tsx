import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  ExclamationTriangleIcon as ComplaintIcon,
  UserCircleIcon as UserCircle,
  CheckIcon as Check,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { Button } from "../../components/UI/Button";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import {
  InfoCard,
  SectionHeading,
  StatusBadge,
  displayName,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { mediaUrl } from "../../lib/mediaUrl";
import { toast } from "../../stores/toast";
import type { Complaint } from "../../types/complaints";

const MAX_RESPONSE = 2000;

export default function ComplaintShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [item, setItem] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [closeOpen, setCloseOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [closing, setClosing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`complaints/${id}`);
      setItem(res.data?.data ?? null);
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadComplaints"),
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

  useEffect(() => {
    if (searchParams.get("close") === "1") {
      setCloseOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("close");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const closeComplaint = async () => {
    if (!item) return;
    const response = adminResponse.trim();
    if (response.length > MAX_RESPONSE) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.maxLength", { count: MAX_RESPONSE })
      );
      return;
    }
    try {
      setClosing(true);
      const res = await api.put(`complaints/${item.id}/close`, {
        admin_response: response || null,
      });
      toast.success(t("MESSAGES.complaintClosed"), res.data?.message);
      setItem(res.data?.data ?? { ...item, status: "closed", admin_response: response || null });
      setCloseOpen(false);
      setAdminResponse("");
      load();
    } catch (e: any) {
      toast.error(t("MESSAGES.updateFailed"), e?.response?.data?.message);
    } finally {
      setClosing(false);
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
          to="/complaints?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.complaints")}
        </Link>
      </div>
    );
  }

  const isOpen = item.status === "open";
  const attachment = mediaUrl(item.attachment_url);

  return (
    <div className="space-y-0">
      <PageHeader
        title={`${t("TITLES.complaint")} #${item.id}`}
        translateTitle={false}
        icon={ComplaintIcon}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          {
            label: "complaints",
            href: "/complaints?page=1",
            icon: ComplaintIcon,
          },
          { label: `#${item.id}`, icon: ComplaintIcon },
        ]}
        rightActions={
          isOpen ? (
            <Button type="button" onClick={() => setCloseOpen(true)}>
              <Check width={16} height={16} />
              {t("ACTIONS.closeComplaint")}
            </Button>
          ) : null
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading
              icon={ComplaintIcon}
              title={t("TITLES.complaintDetails")}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.status")}>
                <StatusBadge
                  status={item.status}
                  label={
                    item.status
                      ? t(`STATUS.${item.status}`, {
                          defaultValue: item.status.replace(/_/g, " "),
                        })
                      : undefined
                  }
                />
              </InfoCard>
              <InfoCard label={t("TITLES.type")}>
                {item.type
                  ? t(`COMPLAINT_TYPE.${item.type}`, {
                      defaultValue: item.type.replace(/_/g, " "),
                    })
                  : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.createdAt")}>
                {formatDate(item.created_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.resolvedAt")}>
                {formatDate(item.resolved_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.resolvedBy")}>
                {displayName(item.resolved_by?.name)}
              </InfoCard>
            </div>
            <div className="mt-4">
              <InfoCard label={t("TITLES.description")}>
                <p className="whitespace-pre-wrap text-sm">
                  {item.description || "—"}
                </p>
              </InfoCard>
            </div>
            {item.admin_response ? (
              <div className="mt-4">
                <InfoCard label={t("TITLES.adminResponse")}>
                  <p className="whitespace-pre-wrap text-sm">
                    {item.admin_response}
                  </p>
                </InfoCard>
              </div>
            ) : null}
            {attachment ? (
              <div className="mt-4">
                <InfoCard label={t("TITLES.attachment")}>
                  <a
                    href={attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {t("ACTIONS.show")}
                  </a>
                </InfoCard>
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={UserCircle} title={t("TITLES.submittedBy")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.name")}>
                {displayName(item.submitted_by?.name)}
              </InfoCard>
              <InfoCard label={t("TITLES.type")}>
                {item.submitted_by?.type
                  ? t(`TITLES.${item.submitted_by.type}`, {
                      defaultValue: item.submitted_by.type,
                    })
                  : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.id")}>
                {item.submitted_by?.id ?? "—"}
              </InfoCard>
            </div>
          </div>
        </div>

        {item.target_lawyer ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="px-6 py-5">
              <SectionHeading
                icon={UserCircle}
                title={t("TITLES.targetLawyer")}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                <InfoCard label={t("TITLES.name")}>
                  {displayName(item.target_lawyer.name)}
                </InfoCard>
                <InfoCard label={t("TITLES.id")}>
                  {item.target_lawyer.id ?? "—"}
                </InfoCard>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {closeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => !closing && setCloseOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-base font-semibold text-foreground">
                {t("ACTIONS.closeComplaint")}
              </h3>
              <button
                type="button"
                disabled={closing}
                onClick={() => setCloseOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X width={16} height={16} />
              </button>
            </div>
            <Form
              values={{ admin_response: adminResponse }}
              onSubmit={closeComplaint}
              className="space-y-4 p-5"
            >
              {() => (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t("LABELS.closeComplaintDesc")}
                  </p>
                  <BaseTextInput
                    name="admin_response"
                    type="textarea"
                    label={t("TITLES.adminResponse")}
                    value={adminResponse}
                    onInput={setAdminResponse}
                  />
                  <p className="text-xs text-muted-foreground">
                    {adminResponse.length}/{MAX_RESPONSE}
                  </p>
                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="soft"
                      className="flex-1"
                      disabled={closing}
                      onClick={() => setCloseOpen(false)}
                    >
                      {t("BUTTONS.cancel")}
                    </Button>
                    <Button type="submit" className="flex-1" loading={closing}>
                      {t("ACTIONS.closeComplaint")}
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
