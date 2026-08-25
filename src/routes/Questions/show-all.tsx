import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  QuestionMarkCircleIcon as QuestionIcon,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  ChatBubbleBottomCenterTextIcon as Answer,
  GlobeAltIcon as Publish,
  EyeSlashIcon as Unpublish,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { PageHeader } from "../../components/UI/PageHeader";
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

export default function QuestionsShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<Question>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "id", header: t("TITLES.id") },
      { index: 1, field: "question_text", header: t("TITLES.question") },
      { index: 2, field: "client", header: t("TITLES.client") },
      { index: 3, field: "status", header: t("TITLES.status") },
      { index: 4, field: "submitted_at", header: t("TITLES.submittedAt") },
      { index: 5, field: "answered_at", header: t("TITLES.answeredAt") },
      { index: 6, field: "actions", header: t("TITLES.actions") },
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
                <Link
                  to={`/questions/${item.id}?answer=1`}
                  onClick={() => setOpenMenu(null)}
                  className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-primary hover:bg-primary/10"
                >
                  <span className="action-btn primary">
                    <Answer className="size-4" />
                  </span>
                  {item.admin_answer
                    ? t("ACTIONS.editAnswer")
                    : t("ACTIONS.answerQuestion")}
                </Link>
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
    </div>
  );
}
