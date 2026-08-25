import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  QuestionMarkCircleIcon as QuestionIcon,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  ChatBubbleBottomCenterTextIcon as Answer,
  GlobeAltIcon as Publish,
  EyeSlashIcon as Unpublish,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import {
  StatusBadge,
  displayName,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import type { Question } from "../../types/questions";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

const MAX_ANSWER = 5000;

export default function QuestionsShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<Question>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);
  const [answerItem, setAnswerItem] = useState<Question | null>(null);
  const [adminAnswer, setAdminAnswer] = useState("");
  const [savingAnswer, setSavingAnswer] = useState(false);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "question_text", header: t("TITLES.question") },
      { index: 1, field: "client", header: t("TITLES.client") },
      { index: 2, field: "status", header: t("TITLES.status") },
      { index: 3, field: "submitted_at", header: t("TITLES.submittedAt") },
      { index: 4, field: "answered_at", header: t("TITLES.answeredAt") },
      { index: 5, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const statusOptions = useMemo(() => {
    const fromApi = data.meta?.available_statuses;
    const statuses =
      fromApi && fromApi.length
        ? fromApi
        : ["submitted", "answered", "published"];
    return statuses.map((status) => ({
      id: status,
      label: t(`STATUS.${status}`, {
        defaultValue: status.replace(/_/g, " "),
      }),
    }));
  }, [data.meta?.available_statuses, t]);

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchQuestions"),
        prependInputIcon: Search as any,
      },
      {
        type: "radio",
        key: "status",
        label: t("TITLES.status"),
        options: statusOptions,
      },
    ],
    [t, statusOptions]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("questions", {
        params: {
          page,
          search: search || undefined,
          status: status || undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<Question>(res.data));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadQuestions"),
        e?.response?.data?.message
      );
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, status, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const togglePublish = async (item: Question, publish: boolean) => {
    try {
      const res = await api.put(
        `questions/${item.id}/${publish ? "publish" : "unpublish"}`
      );
      toast.success(
        publish
          ? t("MESSAGES.questionPublished")
          : t("MESSAGES.questionUnpublished"),
        res.data?.message
      );
      setOpenMenu(null);
      fetchData();
    } catch (e: any) {
      toast.error(t("MESSAGES.updateFailed"), e?.response?.data?.message);
    }
  };

  const openAnswer = (item: Question) => {
    setOpenMenu(null);
    setAnswerItem(item);
    setAdminAnswer(item.admin_answer ?? "");
  };

  const closeAnswer = () => {
    setAnswerItem(null);
    setAdminAnswer("");
  };

  const submitAnswer = async () => {
    if (!answerItem || savingAnswer) return;
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
      setSavingAnswer(true);
      const res = await api.put(`questions/${answerItem.id}/answer`, {
        admin_answer: answer,
      });
      toast.success(t("MESSAGES.questionAnswered"), res.data?.message);
      setAnswerItem(null);
      setAdminAnswer("");
      fetchData();
    } catch (e: any) {
      toast.error(t("MESSAGES.updateFailed"), e?.response?.data?.message);
    } finally {
      setSavingAnswer(false);
    }
  };

  const renderCell = (field: string, item: Question) => {
    switch (field) {
      case "id":
        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            #{item.id}
          </span>
        );
      case "question_text":
        return (
          <p
            className="max-w-sm truncate text-sm text-foreground"
            title={item.question_text ?? undefined}
          >
            {item.question_text || "—"}
          </p>
        );
      case "client":
        return (
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {displayName(item.client?.name)}
            </p>
            {item.client?.email ? (
              <p className="truncate text-xs text-muted-foreground">
                {item.client.email}
              </p>
            ) : null}
          </div>
        );
      case "status":
        return (
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
        );
      case "submitted_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.submitted_at)}
          </span>
        );
      case "answered_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.answered_at)}
          </span>
        );
      case "actions": {
        const canPublish =
          item.status === "answered" ||
          (!!item.admin_answer && !item.is_published);
        const canUnpublish = item.is_published || item.status === "published";
        return (
          <div className="relative w-9 overflow-visible">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (openMenu?.id === item.id) {
                  setOpenMenu(null);
                  return;
                }
                setOpenMenu({ id: item.id, anchor: e.currentTarget });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
            >
              <MoreHorizontal width={16} height={16} />
            </button>
            {openMenu?.id === item.id && (
              <ActionsMenu
                anchorEl={openMenu.anchor}
                data={item}
                showUrl={`/questions/${item.id}`}
                deleteUrl={`questions/${item.id}`}
                onReload={fetchData}
                onClose={() => setOpenMenu(null)}
              >
                <button
                  type="button"
                  onClick={() => openAnswer(item)}
                  className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-primary hover:bg-primary/10"
                >
                  <span className="action-btn primary">
                    <Answer className="size-4" />
                  </span>
                  {item.admin_answer
                    ? t("ACTIONS.editAnswer")
                    : t("ACTIONS.answerQuestion")}
                </button>
                {canPublish ? (
                  <button
                    type="button"
                    onClick={() => togglePublish(item, true)}
                    className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                  >
                    <span className="action-btn primary">
                      <Publish className="size-4" />
                    </span>
                    {t("ACTIONS.publish")}
                  </button>
                ) : null}
                {canUnpublish ? (
                  <button
                    type="button"
                    onClick={() => togglePublish(item, false)}
                    className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-muted-foreground hover:bg-muted"
                  >
                    <span className="action-btn main">
                      <Unpublish className="size-4" />
                    </span>
                    {t("ACTIONS.unpublish")}
                  </button>
                ) : null}
              </ActionsMenu>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="questions"
        subtitle="questionsDesc"
        icon={QuestionIcon}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "questions", icon: QuestionIcon },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="questions"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />

      {answerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => !savingAnswer && closeAnswer()}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-base font-semibold text-foreground">
                {answerItem.admin_answer
                  ? t("ACTIONS.editAnswer")
                  : t("ACTIONS.answerQuestion")}
              </h3>
              <button
                type="button"
                disabled={savingAnswer}
                onClick={() => !savingAnswer && closeAnswer()}
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
                      {answerItem.question_text || "—"}
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
                      disabled={savingAnswer}
                      onClick={() => !savingAnswer && closeAnswer()}
                    >
                      {t("BUTTONS.cancel")}
                    </Button>
                    <Button type="submit" className="flex-1" loading={savingAnswer}>
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
