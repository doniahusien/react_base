import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  SquaresPlusIcon as Blocks,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import {
  BlockTemplateForm,
  buildBlockTemplatePayload,
} from "../../components/Shared/BlockTemplateForm";
import { blockTemplatesService } from "../../services/blockTemplatesService";
import { toast } from "../../stores/toast";

export default function BlockTemplateCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

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
      const payload = buildBlockTemplatePayload(formData);
      await blockTemplatesService.save(payload, true);
      toast.success(t("MESSAGES.blockTemplateCreated"));
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
        title={t("LABELS.createBlockTemplate")}
        translateTitle={false}
        icon={Blocks}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "blocks", href: "/blocks?page=1", icon: Blocks },
          { label: t("LABELS.createBlockTemplate"), translate: false, icon: Blocks },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-5 text-xs text-muted-foreground">
          {t("LABELS.blockTemplateModalDesc")}
        </p>
        <BlockTemplateForm
          saving={saving}
          onCancel={() => navigate("/blocks?page=1")}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
