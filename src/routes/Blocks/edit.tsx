import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  SquaresPlusIcon as Blocks,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import {
  BlockTemplateForm,
  buildBlockTemplatePayload,
} from "../../components/Shared/BlockTemplateForm";
import { blockTemplatesService } from "../../services/blockTemplatesService";
import { toast } from "../../stores/toast";
import type { BlockTemplate } from "../../types/blocks";

export default function BlockTemplateEdit() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const currentLang = (i18n.language || "ar").startsWith("en") ? "en" : "ar";
  const [editingTemplate, setEditingTemplate] = useState<BlockTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await blockTemplatesService.get(id);
        setEditingTemplate(data);
      } catch {
        toast.error(t("MESSAGES.failedToLoadBlocks"));
        setEditingTemplate(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton sections={[{ fields: [{}, {}, {}, {}] }, { fields: [{}, {}, {}] }]} />
      </div>
    );
  }

  if (!editingTemplate) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link to="/blocks?page=1" className="text-sm text-primary hover:underline">
          ← {t("TITLES.blocks")}
        </Link>
      </div>
    );
  }

  const displayName =
    currentLang === "ar"
      ? editingTemplate.name_ar
      : editingTemplate.name_en || editingTemplate.name_ar;

  const onSubmit = async (formData: Parameters<typeof buildBlockTemplatePayload>[0]) => {
    if (!formData.name_ar.trim() || !formData.id.trim()) {
      toast.error(t("MESSAGES.blockNameAndIdRequired"));
      return;
    }
    if (formData.icon.startsWith("data:")) {
      toast.error(t("MESSAGES.uploadFailed"));
      return;
    }

    setSaving(true);
    try {
      const payload = buildBlockTemplatePayload(formData, editingTemplate);
      await blockTemplatesService.save(payload, false);
      toast.success(t("MESSAGES.blockTemplateUpdated"));
      navigate("/blocks?page=1");
    } catch (err: any) {
      toast.error(
        t("MESSAGES.blockTemplateSaveFailed"),
        err?.response?.data?.message
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("LABELS.editBlockTemplate")}
        translateTitle={false}
        icon={Blocks}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "blocks", href: "/blocks?page=1", icon: Blocks },
          { label: displayName, translate: false, icon: Blocks },
          { label: t("LABELS.editBlockTemplate"), translate: false, icon: Blocks },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-5 text-xs text-muted-foreground">
          {t("LABELS.blockTemplateModalDesc")}
        </p>
        <BlockTemplateForm
          initial={editingTemplate}
          saving={saving}
          onCancel={() => navigate("/blocks?page=1")}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
