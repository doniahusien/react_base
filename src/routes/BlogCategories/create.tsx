import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  TagIcon as Tag,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { BlogCategoryForm } from "../../components/Shared/BlogCategoryForm";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type { BlogCategoryPayload } from "../../types/blogCategories";

export default function BlogCategoryCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const onSubmit = async (payload: BlogCategoryPayload) => {
    try {
      setSaving(true);
      const res = await api.post("blog-categories", payload);
      toast.success(t("MESSAGES.createdSuccess"), res.data?.message);
      const id = res.data?.data?.id;
      navigate(id ? `/blog-categories/${id}` : "/blog-categories?page=1");
    } catch (e: any) {
      toast.error(t("MESSAGES.createFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-0">
      <PageHeader
        title={t("TITLES.add", { entity: t("TITLES.blogCategory") })}
        translateTitle={false}
        subtitle={t("LABELS.createNewCategory")}
        translateSubtitle={false}
        icon={Tag}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "blogCategories", href: "/blog-categories?page=1", icon: Tag },
          { label: t("ACTIONS.create"), icon: Tag },
        ]}
      />
      <BlogCategoryForm
        saving={saving}
        submitLabel={t("BUTTONS.save")}
        onCancel={() => navigate("/blog-categories?page=1")}
        onSubmit={onSubmit}
      />
    </div>
  );
}
