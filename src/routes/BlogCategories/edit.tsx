import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  TagIcon as Tag,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { BlogCategoryForm } from "../../components/Shared/BlogCategoryForm";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type { BlogCategory, BlogCategoryPayload } from "../../types/blogCategories";

export default function BlogCategoryEdit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<BlogCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`blog-categories/${id}`);
        const data = res.data?.data as BlogCategory | undefined;
        if (!data) {
          setNotFound(true);
          return;
        }
        setItem(data);
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadBlogCategory"),
          e?.response?.data?.message
        );
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  const onSubmit = async (payload: BlogCategoryPayload) => {
    try {
      setSaving(true);
      const res = await api.put(`blog-categories/${id}`, payload);
      toast.success(t("MESSAGES.updatedSuccess"), res.data?.message);
      navigate(`/blog-categories/${id}`);
    } catch (e: any) {
      toast.error(t("MESSAGES.updateFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton sections={[{ fields: [{}, {}, {}] }, { fields: [{}, {}] }]} />
      </div>
    );
  }

  if (notFound || !item) {
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

  return (
    <div className="space-y-0">
      <PageHeader
        title={t("TITLES.edit", { count: t("TITLES.blogCategory") })}
        translateTitle={false}
        subtitle={t("LABELS.updateCategoryInfo")}
        translateSubtitle={false}
        icon={Tag}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "blogCategories", href: "/blog-categories?page=1", icon: Tag },
          { label: t("ACTIONS.edit"), icon: Tag },
        ]}
      />
      <BlogCategoryForm
        initial={item}
        saving={saving}
        submitLabel={t("BUTTONS.saveChanges")}
        onCancel={() => navigate(`/blog-categories/${id}`)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
