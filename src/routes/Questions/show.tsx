import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  QuestionMarkCircleIcon as QuestionIcon,
  UserCircleIcon as UserCircle,
  ChatBubbleBottomCenterTextIcon as Answer,
  GlobeAltIcon as Publish,
  EyeSlashIcon as Unpublish,
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
import { toast } from "../../stores/toast";
import type { Question } from "../../types/questions";

const MAX_ANSWER = 5000;

export default function QuestionShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [item, setItem] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [adminAnswer, setAdminAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`questions/${id}`);
      setItem(res.data?.data ?? null);
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadQuestions"),
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
    if (searchParams.get("answer") === "1") {
      setAnswerOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("answer");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (answerOpen && item) {
      setAdminAnswer(item.admin_answer ?? "");
    }
  }, [answerOpen, item]);

  const submitAnswer = async () => {
    if (!item) return;
    const answer = adminAnswer.trim();
    if (!answer) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.adminAnswer") })
      );
      return;
    }
    if (answer.length > MAX_ANSWER) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.maxLength", { count: MAX_ANSWER })
      );
      return;
    }
    try {
      setSaving(true);
      const res = await api.put(`questions/${item.id}/answer`, {
        admin_answer: answer,
      });
      toast.success(t("MESSAGES.questionAnswered"), res.data?.message);
      setItem(res.data?.data ?? { ...item, admin_answer: answer });
      setAnswerOpen(false);
      load();
    } catch (e: any) {
      toast.error(t("MESSAGES.updateFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (publish: boolean) => {
    if (!item) return;
    try {
      setPublishing(true);
      const res = await api.put(
        `questions/${item.id}/${publish ? "publish" : "unpublish"}`
      );
      toast.success(
        publish
          ? t("MESSAGES.questionPublished")
          : t("MESSAGES.questionUnpublished"),
        res.data?.message
      );
      setItem(res.data?.data ?? item);
      load();
    } catch (e: any) {
      toast.error(t("MESSAGES.updateFailed"), e?.response?.data?.message);
    } finally {
      setPublishing(false);
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
          to="/questions?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.questions")}
        </Link>
      </div>
    );
  }

  const canPublish =
    item.status === "answered" || (!!item.admin_answer && !item.is_published);
  const canUnpublish = item.is_published || item.status === "published";

  return (
    <div className="space-y-0">
      <PageHeader
        title={`${t("TITLES.question")} #${item.id}`}
        translateTitle={false}
        icon={QuestionIcon}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          {
            label: "questions",
            href: "/questions?page=1",
            icon: QuestionIcon,
          },
          { label: `#${item.id}`, icon: QuestionIcon },
        ]}
        rightActions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={() => setAnswerOpen(true)}>
              <Answer width={16} height={16} />
              {item.admin_answer
                ? t("ACTIONS.editAnswer")
                : t("ACTIONS.answerQuestion")}
            </Button>
            {canPublish ? (
              <Button
                type="button"
                variant="soft"
                loading={publishing}
                onClick={() => togglePublish(true)}
              >
                <Publish width={16} height={16} />
                {t("ACTIONS.publish")}
              </Button>
            ) : null}
            {canUnpublish ? (
              <Button
                type="button"
                variant="soft"
                loading={publishing}
                onClick={() => togglePublish(false)}
              >
                <Unpublish width={16} height={16} />
                {t("ACTIONS.unpublish")}
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading
              icon={QuestionIcon}
              title={t("TITLES.questionDetails")}
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
              <InfoCard label={t("TITLES.published")}>
                {item.is_published ? t("BUTTONS.yes") : t("BUTTONS.no")}
              </InfoCard>
              <InfoCard label={t("TITLES.submittedAt")}>
                {formatDate(item.submitted_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.answeredAt")}>
                {formatDate(item.answered_at)}
              </InfoCard>
              <InfoCard label={t("TITLES.answeredBy")}>
                {displayName(item.answered_by?.name)}
              </InfoCard>
              <InfoCard label={t("TITLES.createdAt")}>
                {formatDate(item.created_at)}
              </InfoCard>
            </div>
            <div className="mt-4">
              <InfoCard label={t("TITLES.question")}>
                <p className="whitespace-pre-wrap text-sm font-normal">
                  {item.question_text || "—"}
                </p>
              </InfoCard>
            </div>
            {item.admin_answer ? (
              <div className="mt-4">
                <InfoCard label={t("TITLES.adminAnswer")}>
                  <p className="whitespace-pre-wrap text-sm font-normal">
                    {item.admin_answer}
                  </p>
                </InfoCard>
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-5">
            <SectionHeading icon={UserCircle} title={t("TITLES.client")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.name")}>
                {displayName(item.client?.name)}
              </InfoCard>
              <InfoCard label={t("TITLES.email")}>
                {item.client?.email || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.id")}>
                {item.client?.id ?? "—"}
              </InfoCard>
            </div>
          </div>
        </div>
      </div>

      {answerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => !saving && setAnswerOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-base font-semibold text-foreground">
                {item.admin_answer
                  ? t("ACTIONS.editAnswer")
                  : t("ACTIONS.answerQuestion")}
              </h3>
              <button
                type="button"
                disabled={saving}
                onClick={() => setAnswerOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X width={16} height={16} />
              </button>
            </div>
            <Form
              values={{ admin_answer: adminAnswer }}
              onSubmit={submitAnswer}
              className="space-y-4 p-5"
            >
              {() => (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t("LABELS.answerQuestionDesc")}
                  </p>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("TITLES.question")}
                    </p>
                    <p className="text-sm text-foreground">
                      {item.question_text || "—"}
                    </p>
                  </div>
                  <BaseTextInput
                    name="admin_answer"
                    type="textarea"
                    label={t("TITLES.adminAnswer")}
                    value={adminAnswer}
                    onInput={setAdminAnswer}
                  />
                  <p className="text-xs text-muted-foreground">
                    {adminAnswer.length}/{MAX_ANSWER}
                  </p>
                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="soft"
                      className="flex-1"
                      disabled={saving}
                      onClick={() => setAnswerOpen(false)}
                    >
                      {t("BUTTONS.cancel")}
                    </Button>
                    <Button type="submit" className="flex-1" loading={saving}>
                      {t("ACTIONS.answerQuestion")}
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
