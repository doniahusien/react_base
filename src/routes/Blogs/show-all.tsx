import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  NewspaperIcon as Newspaper,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  PlusIcon as Plus,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import {
  StatusBadge,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { mediaUrl } from "../../lib/mediaUrl";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { Blog } from "../../types/blogs";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

export default function BlogsShowAll() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<Blog>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "title", header: t("TITLES.title") },
      { index: 1, field: "category", header: t("TITLES.blogCategory") },
      { index: 2, field: "is_published", header: t("TITLES.status") },
      { index: 3, field: "published_at", header: t("TITLES.publishedAt") },
      { index: 4, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchBlogs"),
        prependInputIcon: Search as any,
      },
      {
        type: "radio",
        key: "is_published",
        label: t("TITLES.status"),
        options: [
          { id: "1", label: t("STATUS.published") },
          { id: "0", label: t("STATUS.draft") },
        ],
      },
    ],
    [t]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const isPublished = searchParams.get("is_published") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("blogs", {
        params: {
          page,
          search: search || undefined,
          is_published: isPublished !== "" ? isPublished : undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<Blog>(res.data));
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadBlogs"), e?.response?.data?.message);
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, isPublished, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const blogTitle = (item: Blog) => {
    if (lang === "ar") return item.title_ar || item.title_en || item.title || "—";
    return item.title_en || item.title_ar || item.title || "—";
  };

  const renderCell = (field: string, item: Blog) => {
    switch (field) {
      case "title": {
        const img = mediaUrl(item.image_url);
        return (
          <div className="flex min-w-0 items-center gap-3">
            {img ? (
              <img
                src={img}
                alt=""
                className="size-10 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Newspaper width={16} height={16} />
              </div>
            )}
            <Link
              to={`/blogs/${item.id}`}
              className="truncate text-sm font-medium text-foreground hover:text-primary"
            >
              {blogTitle(item)}
            </Link>
          </div>
        );
      }
      case "category":
        return item.category ? (
          <Link
            to={`/blog-categories/${item.category.id}`}
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            {item.category.name || "—"}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "is_published":
        return (
          <StatusBadge
            status={item.is_published ? "available" : "inactive"}
            label={
              item.is_published ? t("STATUS.published") : t("STATUS.draft")
            }
          />
        );
      case "published_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.published_at)}
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
                showUrl={`/blogs/${item.id}`}
                deleteUrl={`blogs/${item.id}`}
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
        title="blogs"
        subtitle="blogsDesc"
        icon={Newspaper}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "blogs", icon: Newspaper },
        ]}
        rightActions={
          <Button type="button" onClick={() => navigate("/blogs/create")}>
            <Plus width={16} height={16} />
            {t("TITLES.add", { entity: t("TITLES.blog") })}
          </Button>
        }
      />
      <UITable
        data={data}
        columns={columns}
        title="blogs"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
