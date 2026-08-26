import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  GlobeAltIcon as Globe,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import {
  CountryForm,
  buildCountryFormData,
  type CountrySubmitPayload,
} from "../../components/Shared/CountryForm";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type { Country } from "../../types/countries";

export default function CountryEdit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`countries/${id}`);
        const data = res.data?.data as Country | undefined;
        if (!data) {
          setNotFound(true);
          return;
        }
        setItem(data);
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadCountry"),
          e?.response?.data?.message
        );
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  const onSubmit = async (payload: CountrySubmitPayload) => {
    try {
      setSaving(true);
      const fd = buildCountryFormData(payload);
      const res = await api.put(`countries/${id}`, fd);
      toast.success(t("MESSAGES.updatedSuccess"), res.data?.message);
      navigate(`/countries/${id}`);
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
          to="/countries?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.countries")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title={t("TITLES.edit", { count: t("TITLES.country") })}
        translateTitle={false}
        subtitle={t("LABELS.updateCountryInfo")}
        translateSubtitle={false}
        icon={Globe}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "countries", href: "/countries?page=1", icon: Globe },
          { label: t("ACTIONS.edit"), icon: Globe },
        ]}
      />
      <CountryForm
        mode="edit"
        initial={item}
        saving={saving}
        submitLabel={t("BUTTONS.saveChanges")}
        onCancel={() => navigate(`/countries/${id}`)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
