import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  GlobeAltIcon as Globe,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import {
  CountryForm,
  buildCountryFormData,
  type CountrySubmitPayload,
} from "../../components/Shared/CountryForm";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";

export default function CountryCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const onSubmit = async (payload: CountrySubmitPayload) => {
    try {
      setSaving(true);
      const fd = buildCountryFormData(payload);
      const res = await api.post("countries", fd);
      toast.success(t("MESSAGES.createdSuccess"), res.data?.message);
      const id = res.data?.data?.id;
      navigate(id ? `/countries/${id}` : "/countries?page=1");
    } catch (e: any) {
      toast.error(t("MESSAGES.createFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-0">
      <PageHeader
        title={t("TITLES.add", { entity: t("TITLES.country") })}
        translateTitle={false}
        subtitle={t("LABELS.createNewCountry")}
        translateSubtitle={false}
        icon={Globe}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "countries", href: "/countries?page=1", icon: Globe },
          { label: t("ACTIONS.create"), icon: Globe },
        ]}
      />
      <CountryForm
        mode="create"
        saving={saving}
        submitLabel={t("BUTTONS.save")}
        onCancel={() => navigate("/countries?page=1")}
        onSubmit={onSubmit}
      />
    </div>
  );
}
