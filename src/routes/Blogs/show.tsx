import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  NewspaperIcon as Newspaper,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import {
  BlogForm,
  buildBlogFormData,
  type BlogSubmitPayload,
} from "../../components/Shared/BlogForm";
import { Deleter } from "../../components/Shared/Deleter";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { Blog } from "../../types/blogs";

export default function BlogShow() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`blogs/${id}`);
      setBlog(res.data?.data ?? null);
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadBlogs"), e?.response?.data?.message);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, t]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton sections={[{ fields: [{}, {}, {}] }, { fields: [{}, {}] }]} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link to="/blogs?page=1" className="text-sm text-primary hover:underline">
          ← {t("TITLES.blogs")}
        </Link>
      </div>
    );
  }

  const title =
    lang === "ar"
      ? blog.title_ar || blog.title_en || blog.title || `#${blog.id}`
      : blog.title_en || blog.title_ar || blog.title || `#${blog.id}`;

  const onSubmit = async (payload: BlogSubmitPayload) => {
    try {
      setSaving(true);
      const res = await api.put(`blogs/${blog.id}`, buildBlogFormData(payload));
      toast.success(t("MESSAGES.updatedSuccess"), res.data?.message);
      setBlog(res.data?.data ?? blog);
    } catch (e: any) {
      toast.error(t("MESSAGES.updateFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-0">
      <PageHeader
        title={title}
        translateTitle={false}
        icon={Newspaper}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "blogs", href: "/blogs?page=1", icon: Newspaper },
          { label: title, icon: Newspaper },
        ]}
        rightActions={
          <Deleter
            url={`blogs/${blog.id}`}
            text={t("ACTIONS.delete")}
            onReload={() => navigate("/blogs?page=1")}
          />
        }
      />
      <BlogForm
        initial={blog}
        saving={saving}
        submitLabel={t("BUTTONS.save")}
        onCancel={() => navigate("/blogs?page=1")}
        onSubmit={onSubmit}
      />
    </div>
  );
}
