import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  TagIcon as Tag,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { Switcher } from "../../components/Shared/Switcher";
import { PageHeader } from "../../components/UI/PageHeader";
import { formatDate } from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { BlogCategory } from "../../types/blogCategories";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

const RESOURCE = "blog-categories";

export default function BlogCategoriesShowAll() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<BlogCategory>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "name", header: t("TITLES.name") },
      { index: 1, field: "slug", header: t("TITLES.slug") },
      { index: 2, field: "articles_count", header: t("TITLES.articlesCount") },
      { index: 3, field: "is_active", header: t("TITLES.status") },
      { index: 4, field: "created_at", header: t("TITLES.createdAt") },
      { index: 5, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchBlogCategories"),
        prependInputIcon: Search as any,
      },
      {
        type: "radio",
        key: "is_active",
        label: t("TITLES.status"),
        options: [
          { id: "1", label: t("STATUS.active") },
          { id: "0", label: t("STATUS.inactive") },
        ],
      },
    ],
    [t]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const isActive = searchParams.get("is_active") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(RESOURCE, {
        params: {
          page,
          search: search || undefined,
          is_active: isActive !== "" ? isActive : undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<BlogCategory>(res.data));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadBlogCategories"),
        e?.response?.data?.message
      );
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, isActive, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayName = (item: BlogCategory) =>
    lang === "ar"
      ? item.name_ar || item.name_en || item.name || "—"
      : item.name_en || item.name_ar || item.name || "—";

  const renderCell = (field: string, item: BlogCategory) => {
    switch (field) {
      case "name":
        return (
          <Link
            to={`/blog-categories/${item.id}`}
            className="min-w-0 block hover:text-primary"
          >
            <p className="truncate text-sm font-medium text-foreground hover:text-primary">
              {displayName(item)}
            </p>
          </Link>
        );
      case "slug":
        return (
          <span className="text-sm font-medium tabular-nums text-muted-foreground" dir="ltr">
            {item.slug || "—"}
          </span>
        );
      case "articles_count":
        return (
          <span className="text-sm tabular-nums text-foreground">
            {item.articles_count ?? "—"}
          </span>
        );
      case "is_active":
        return (
          <Switcher
            value={!!item.is_active}
            url={`${RESOURCE}/${item.id}`}
            method="PUT"
            body={{
              name_ar: item.name_ar,
              name_en: item.name_en,
              is_active: !item.is_active,
            }}
            onReload={fetchData}
          />
        );
      case "created_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.created_at)}
          </span>
        );
      case "actions":
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
                showUrl={`/blog-categories/${item.id}`}
                editUrl={`/blog-categories/${item.id}/edit`}
                deleteUrl={`${RESOURCE}/${item.id}`}
                onClose={() => setOpenMenu(null)}
                onReload={() => {
                  setOpenMenu(null);
                  fetchData();
                }}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="blogCategories"
        subtitle="blogCategoriesDesc"
        icon={Tag}
        total={data.meta?.total ?? data.data.length}
        addHref="/blog-categories/create"
        addLabel="blogCategory"
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "blogCategories", icon: Tag },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="blogCategories"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
