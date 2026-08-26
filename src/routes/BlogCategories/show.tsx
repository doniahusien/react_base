import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  TagIcon as Tag,
  PencilIcon as Pencil,
  NewspaperIcon as Newspaper,
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
import { useAppStore } from "../../store";
import type { BlogCategory } from "../../types/blogCategories";

export default function BlogCategoryShow() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<BlogCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`blog-categories/${id}`);
        setItem(res.data?.data ?? null);
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadBlogCategory"),
          e?.response?.data?.message
        );
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

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
          to="/blog-categories?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.blogCategories")}
        </Link>
      </div>
    );
  }

  const title =
    lang === "ar"
      ? item.name_ar || item.name_en || item.name || "—"
      : item.name_en || item.name_ar || item.name || "—";

  const articles = item.articles ?? [];
  const articleTitle = (article: (typeof articles)[number]) =>
    lang === "ar"
      ? article.title_ar || article.title_en || article.title || `#${article.id}`
      : article.title_en || article.title_ar || article.title || `#${article.id}`;

  return (
    <div className="space-y-0">
      <PageHeader
        title={title}
        translateTitle={false}
        subtitle={t("TITLES.blogCategoryDetails")}
        translateSubtitle={false}
        icon={Tag}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "blogCategories", href: "/blog-categories?page=1", icon: Tag },
          { label: title, icon: Tag },
        ]}
        rightActions={
          <Button
            type="button"
            onClick={() => navigate(`/blog-categories/${item.id}/edit`)}
          >
            <Pencil width={16} height={16} />
            {t("ACTIONS.edit")}
          </Button>
        }
      />

      <div className="space-y-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <SectionHeading icon={Tag} title={t("TITLES.basicInfo")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoCard label={t("TITLES.nameArabic")}>
                {item.name_ar || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.nameEnglish")}>
                {item.name_en || "—"}
              </InfoCard>
              <InfoCard label={t("TITLES.slug")}>
                <span dir="ltr">{item.slug || "—"}</span>
              </InfoCard>
              <InfoCard label={t("TITLES.status")}>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.is_active
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.is_active
                    ? t("STATUS.active")
                    : t("STATUS.inactive")}
                </span>
              </InfoCard>
              <InfoCard label={t("TITLES.articlesCount")}>
                {item.articles_count ?? articles.length}
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
            <SectionHeading icon={Newspaper} title={t("TITLES.relatedArticles")} />
            {articles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("LABELS.noArticles")}
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border">
                {articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      to={`/blogs/${article.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/40"
                    >
                      <span className="truncate font-medium text-foreground">
                        {articleTitle(article)}
                      </span>
                      {article.is_published != null && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            article.is_published
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {article.is_published
                            ? t("STATUS.published")
                            : t("STATUS.draft")}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
