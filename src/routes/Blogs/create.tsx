import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  NewspaperIcon as Newspaper,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import {
  BlogForm,
  buildBlogFormData,
  type BlogSubmitPayload,
} from "../../components/Shared/BlogForm";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";

export default function BlogCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const onSubmit = async (payload: BlogSubmitPayload) => {
    try {
      setSaving(true);
      const res = await api.post("blogs", buildBlogFormData(payload));
      toast.success(t("MESSAGES.createdSuccess"), res.data?.message);
      const id = res.data?.data?.id;
      navigate(id ? `/blogs/${id}` : "/blogs?page=1");
    } catch (e: any) {
      toast.error(t("MESSAGES.createFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-0">
      <PageHeader
        title={t("TITLES.add", { entity: t("TITLES.blog") })}
        translateTitle={false}
        icon={Newspaper}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "blogs", href: "/blogs?page=1", icon: Newspaper },
          { label: t("ACTIONS.create"), icon: Newspaper },
        ]}
      />
      <BlogForm
        saving={saving}
        submitLabel={t("BUTTONS.save")}
        onCancel={() => navigate("/blogs?page=1")}
        onSubmit={onSubmit}
      />
    </div>
  );
}
