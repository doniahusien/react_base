import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  TrashIcon as Trash,
  UserCircleIcon as UserCircle,
  CheckIcon as Check,
  XMarkIcon as X,
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
import type { LawyerDeletionRequest } from "../../types/lawyerDeletionRequests";

const MIN_REASON = 5;
const MAX_REASON = 1000;

export default function LawyerDeletionRequestShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [item, setItem] = useState<LawyerDeletionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`lawyer-deletion-requests/${id}`);
      setItem(res.data?.data ?? null);
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadDeletionRequests"),
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
    if (searchParams.get("reject") === "1") {
      setRejectOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("reject");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const approve = async () => {
    if (!item) return;
    try {
      setApproving(true);
      const res = await api.put(`lawyer-deletion-requests/${item.id}/approve`);
      toast.success(
        t("MESSAGES.deletionRequestApproved"),
        res.data?.message
      );
      setItem(res.data?.data ?? item);
      load();
    } catch (e: any) {
      toast.error(
        t("MESSAGES.deletionRequestApproveFailed"),
        e?.response?.data?.message
      );
    } finally {
      setApproving(false);
    }
  };

  const reject = async () => {
    if (!item) return;
    const reason = rejectReason.trim();
    if (reason.length < MIN_REASON || reason.length > MAX_REASON) {
      toast.error(t("MESSAGES.rejectionReasonInvalid"));
      return;
    }
    try {
      setRejecting(true);
      const res = await api.put(`lawyer-deletion-requests/${item.id}/reject`, {
        rejection_reason: reason,
      });
      toast.success(
        t("MESSAGES.deletionRequestRejected"),
        res.data?.message
      );
      setRejectOpen(false);
      setRejectReason("");
      setItem(res.data?.data ?? item);
      load();
    } catch (e: any) {
      toast.error(
        t("MESSAGES.deletionRequestRejectFailed"),
        e?.response?.data?.message
      );
    } finally {
      setRejecting(false);
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
          to="/lawyer-deletion-requests?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.deletionRequests")}
        </Link>
      </div>
    );
  }

  const isPending = item.status === "pending";

  return (
    <div className="space-y-0">
      <PageHeader
        title={`${t("TITLES.deletionRequest")} #${item.id}`}
        translateTitle={false}
        icon={Trash}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          {
            label: "deletionRequests",
            href: "/lawyer-deletion-requests?page=1",
            icon: Trash,
          },
          { label: `#${item.id}`, icon: Trash },
        ]}
        rightActions={
          isPending ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="danger"
                onClick={() => setRejectOpen(true)}
                disabled={approving || rejecting}
              >
                <X width={16} height={16} />
                {t("ACTIONS.reject")}
              </Button>
              <Button
                type="button"
                onClick={approve}
                disabled={approving || rejecting}
                loading={approving}
              >
                <Check width={16} height={16} />
                {t("ACTIONS.approve")}
              </Button>
            </div>
          ) : null
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading
              icon={Trash}
              title={t("TITLES.deletionRequestDetails")}
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
              <InfoCard label={t("TITLES.createdAt")}>
                {formatDate(item.created_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.updatedAt")}>
                {formatDate(item.updated_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.handledBy")}>
                {displayName(item.handled_by?.name)}
              </InfoCard>
            </div>
            <div className="mt-4">
              <InfoCard label={t("TITLES.reason")}>
                <p className="whitespace-pre-wrap text-sm font-normal">
                  {item.reason || "—"}
                </p>
              </InfoCard>
            </div>
            {item.rejection_reason ? (
              <div className="mt-4">
                <InfoCard label={t("TITLES.rejectionReason")}>
                  <p className="whitespace-pre-wrap text-sm font-normal">
                    {item.rejection_reason}
                  </p>
                </InfoCard>
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={UserCircle} title={t("TITLES.lawyer")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.name")}>
                {displayName(item.lawyer?.name)}
              </InfoCard>
              <InfoCard label={t("TITLES.email")}>
                {item.lawyer?.email || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.phone")}>
                {item.lawyer?.phone ? (
                  <bdo dir="ltr">{item.lawyer.phone}</bdo>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.id")}>
                {item.lawyer?.id ?? "—"}
              </InfoCard>
            </div>
          </div>
        </div>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => !rejecting && setRejectOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl">
            <h3 className="mb-2 text-base font-semibold text-foreground">
              {t("TITLES.rejectDeletionRequest")}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("LABELS.rejectDeletionRequestDesc")}
            </p>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("TITLES.rejectionReason")}
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              maxLength={MAX_REASON}
              className="mb-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
              placeholder={t("LABELS.rejectionReasonPlaceholder")}
            />
            <p className="mb-5 text-xs text-muted-foreground">
              {rejectReason.trim().length}/{MAX_REASON} ·{" "}
              {t("LABELS.minChars", { count: MIN_REASON })}
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="soft"
                className="flex-1"
                disabled={rejecting}
                onClick={() => {
                  setRejectOpen(false);
                  setRejectReason("");
                }}
              >
                {t("BUTTONS.cancel")}
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                loading={rejecting}
                disabled={rejectReason.trim().length < MIN_REASON}
                onClick={reject}
              >
                {t("ACTIONS.reject")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
