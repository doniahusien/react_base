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
  type BlogSubmitPayload,
} from "../../components/Shared/BlogForm";
import api from "../../lib/axios";
import { uploadBlogImage } from "../../lib/uploadBlogImage";
import { toast } from "../../stores/toast";

export default function BlogCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const onSubmit = async ({ imageFile, ...payload }: BlogSubmitPayload) => {
    try {
      setSaving(true);
      const res = await api.post("blogs", payload);
      const created = res.data?.data;
      const id = created?.id as number | undefined;

      if (id && imageFile) {
        try {
          const image_url = await uploadBlogImage(id, imageFile);
          await api.put(`blogs/${id}`, { ...payload, image_url });
        } catch (e: any) {
          toast.error(
            t("MESSAGES.uploadFailed"),
            e?.response?.data?.message || e?.message
          );
          navigate(`/blogs/${id}`);
          return;
        }
      }

      toast.success(t("MESSAGES.createdSuccess"), res.data?.message);
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
        title={t("TITLES.add", { count: t("TITLES.blog") })}
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
