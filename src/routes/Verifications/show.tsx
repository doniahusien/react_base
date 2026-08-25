import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  ShieldCheckIcon as ShieldCheck,
  UserCircleIcon as UserCircle,
  DocumentTextIcon as Document,
  BookOpenIcon as BookOpen,
  LanguageIcon as Language,
  CheckIcon as Check,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { Button } from "../../components/UI/Button";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";
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
import { useAppStore } from "../../store";
import type { VerificationDetail } from "../../types/verifications";

export default function VerificationShow() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const { type, id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [item, setItem] = useState<VerificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`verifications/${id}`, {
        params: { type },
      });
      setItem(res.data?.data ?? null);
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadVerifications"), e?.response?.data?.message);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, type]);

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
      const res = await api.put(`verifications/${item.id}/approve`, {
        type: item.type || type,
      });
      toast.success(t("MESSAGES.verificationApproved"), res.data?.message);
      setItem(res.data?.data ?? item);
      load();
    } catch (e: any) {
      toast.error(t("MESSAGES.verificationApproveFailed"), e?.response?.data?.message);
    } finally {
      setApproving(false);
    }
  };

  const reject = async () => {
    if (!item) return;
    const reason = rejectReason.trim();
    if (reason.length < 5 || reason.length > 1000) {
      toast.error(t("MESSAGES.rejectionReasonInvalid"));
      return;
    }
    try {
      setRejecting(true);
      const res = await api.put(`verifications/${item.id}/reject`, {
        type: item.type || type,
        rejection_reason: reason,
      });
      toast.success(t("MESSAGES.verificationRejected"), res.data?.message);
      setRejectOpen(false);
      setRejectReason("");
      setItem(res.data?.data ?? item);
      load();
    } catch (e: any) {
      toast.error(t("MESSAGES.verificationRejectFailed"), e?.response?.data?.message);
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton sections={[{ fields: [{}, {}, {}, {}] }, { fields: [{}, {}, {}] }]} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link to="/verifications?page=1" className="text-sm text-primary hover:underline">
          ← {t("TITLES.verifications")}
        </Link>
      </div>
    );
  }

  const isPending = item.verification_status === "pending";
  const licenseSrc = mediaUrl(item.license_document_url);
  const regionName =
    item.region &&
    (lang === "ar" ? item.region.name_ar : item.region.name_en);

  return (
    <div className="space-y-0">
      <PageHeader
        title={displayName(item.full_name)}
        translateTitle={false}
        icon={ShieldCheck}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "verifications", href: "/verifications?page=1", icon: ShieldCheck },
          { label: displayName(item.full_name), icon: UserCircle },
        ]}
        rightActions={
          isPending ? (
            <div className="flex items-center gap-2">
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
          ) : undefined
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={UserCircle} title={t("PROFILE.basicInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.name")}>{displayName(item.full_name)}</InfoCard>
              <InfoCard label={t("TITLES.type")}>
                {item.type === "law_firm"
                  ? t("TITLES.lawFirm")
                  : item.type === "lawyer"
                    ? t("TITLES.lawyer")
                    : item.type || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.licenseNumber")}>
                {item.license_number || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.qualification")}>
                {item.qualification_degree
                  ? t(`STATUS.${item.qualification_degree}`, {
                      defaultValue: item.qualification_degree,
                    })
                  : "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.membership")}>
                <StatusBadge
                  status={item.membership_type}
                  label={
                    item.membership_type
                      ? t(`STATUS.${item.membership_type}`, {
                          defaultValue: item.membership_type,
                        })
                      : undefined
                  }
                />
              </InfoCard>
    {/*           <InfoCard label={t("TITLES.subtype")}>
                {item.account_subtype || "—"}
              </InfoCard> */}
              <InfoCard label={t("TITLES.city")}>{item.city || "—"}</InfoCard>
              <InfoCard label={t("TITLES.region")}>{regionName || "—"}</InfoCard>
              <InfoCard label={t("TITLES.verification")}>
                <StatusBadge
                  status={item.verification_status}
                  label={
                    item.verification_status
                      ? t(`STATUS.${item.verification_status}`, {
                          defaultValue: item.verification_status.replace(/_/g, " "),
                        })
                      : undefined
                  }
                />
              </InfoCard>
            </div>
            {item.rejection_reason && (
              <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                  {t("TITLES.rejectionReason")}
                </p>
                <p className="text-sm text-foreground">{item.rejection_reason}</p>
              </div>
            )}
            {(item.specialization_text || item.experience_text) && (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {item.specialization_text && (
                  <InfoCard label={t("TITLES.specialization")}>
                    {item.specialization_text}
                  </InfoCard>
                )}
                {item.experience_text && (
                  <InfoCard label={t("TITLES.experience")}>
                    {item.experience_text}
                  </InfoCard>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={Document} title={t("TITLES.licenseDocument")} />
            {licenseSrc ? (
              <ImagePreviewTrigger
                src={licenseSrc}
                alt={t("TITLES.licenseDocument")}
                className="max-h-72 rounded-xl border border-border object-contain"
                wrapperClassName="rounded-xl"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("LABELS.noData")}</p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={UserCircle} title={t("TITLES.accountInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.email")}>
                {item.user?.email ? (
                  <a
                    href={`mailto:${item.user.email}`}
                    className="break-all text-primary hover:underline"
                  >
                    {item.user.email}
                  </a>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.phone")}>
                {item.user?.phone_number ? (
                  <bdo dir="ltr">{item.user.phone_number}</bdo>
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.status")}>
                {item.user?.status ? (
                  <StatusBadge
                    status={item.user.status}
                    label={t(`STATUS.${item.user.status}`, {
                      defaultValue: item.user.status,
                    })}
                  />
                ) : (
                  "—"
                )}
              </InfoCard>
              <InfoCard label={t("TITLES.preferredLanguage")}>
                {item.user?.preferred_language || "—"}
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
          <div className="px-6 py-5">
            <SectionHeading icon={Language} title={t("TITLES.languages")} />
            {(item.languages ?? []).length ? (
              <div className="flex flex-wrap gap-2">
                {item.languages!.map((l) => (
                  <span
                    key={l.id}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {l.name}
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
            {(item.practice_areas ?? []).length ? (
              <div className="flex flex-wrap gap-2">
                {item.practice_areas!.map((a) => (
                  <span
                    key={a.id}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {a.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("LABELS.noData")}</p>
            )}
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
              {t("TITLES.rejectVerification")}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("LABELS.rejectVerificationDesc")}
            </p>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("TITLES.rejectionReason")}
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              maxLength={1000}
              className="mb-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
              placeholder={t("LABELS.rejectionReasonPlaceholder")}
            />
            <p className="mb-5 text-xs text-muted-foreground">
              {rejectReason.trim().length}/1000 · {t("LABELS.minChars", { count: 5 })}
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
                disabled={rejectReason.trim().length < 5}
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
