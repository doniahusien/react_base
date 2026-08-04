import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlobeAltIcon as Earth, PencilSquareIcon as Pen, ShieldCheckIcon as Shield, XMarkIcon as X, Squares2X2Icon as LayoutDashboard } from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { Skeleton } from "../../components/UI/Skeleton";
import { SectionCard } from "../../components/Shared/SectionCard";
import { Button } from "../../components/UI/Button";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import { useTranslation } from "react-i18next";
import { schemas } from "../../lib/schemas";

export default function CityForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [loadingData, setLoadingData] = useState(editing);
  const [loadingForm, setLoadingForm] = useState(false);
  const [values, setValues] = useState({ name_en: "", name_ar: "" });
  const set = <K extends keyof typeof values>(k: K, v: string) => setValues((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        setLoadingData(true);
        const res = await api.get(`cities/${id}`);
        const d = res.data.data;
        setValues({ name_en: d.en?.name ?? "", name_ar: d.ar?.name ?? "" });
      } catch (e: any) { toast.error(t("MESSAGES.failedToLoadCity"), e?.response?.data?.message); }
      finally { setLoadingData(false); }
    })();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setLoadingForm(true);
      const fd = new FormData();
      fd.append("ar[name]", values.name_ar); fd.append("en[name]", values.name_en);
      const url = editing ? `/cities/${id}` : "/cities";
      if (editing) fd.append("_method", "PUT");
      const res = await api.post(url, fd);
      toast.success(editing ? t("MESSAGES.updatedSuccess") : t("MESSAGES.createdSuccess"), res.data?.message);
      navigate("/cities");
    } catch (e: any) { toast.error(editing ? t("MESSAGES.updateFailed") : t("MESSAGES.createFailed"), e?.response?.data?.message); }
    finally { setLoadingForm(false); }
  };

  if (loadingData) return <div className="space-y-5"><Skeleton showImageSection={false} sections={[{ fields: [{}, {}] }]} /></div>;

  return (
    <div className="space-y-0">
      <PageHeader
        title={editing ? "editCity" : "addCity"}
        subtitle={editing ? "updateCityInfo" : "createNewCity"}
        icon={Earth}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "cities", href: "/cities", icon: Earth },
          { label: editing ? "editCity" : "addCity" }
        ]}
      />
      <Form schema={schemas.city} values={{ ...values }} onSubmit={handleSubmit}>
        {({ errors, field, touch }) => (
          <div className="space-y-6">
            <SectionCard icon={Earth} title={t("TITLES.basicInfo")} subtitle={t("LABELS.cityDesc")} color="emerald" step={1}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseTextInput name="name_ar" label={t("TITLES.nameArabic")} placeholder={t("LABELS.nameArabic")} value={values.name_ar} onInput={(v) => { set("name_ar", v); touch("name_ar"); }} prependInputIcon={Pen} {...field("name_ar", errors)} />
                <BaseTextInput name="name_en" label={t("TITLES.nameEnglish")} placeholder={t("LABELS.nameEnglish")} value={values.name_en} onInput={(v) => { set("name_en", v); touch("name_en"); }} prependInputIcon={Pen} {...field("name_en", errors)} />
              </div>
            </SectionCard>
            <div className="flex items-center justify-end gap-3 pt-2 pb-4">
              <Button type="button" variant="secondary" onClick={() => navigate("/cities")}>
                <X width={15} height={15} />
                {t("BUTTONS.cancel")}
              </Button>
              <Button type="submit" loading={loadingForm}>
                {!loadingForm && <Shield width={15} height={15} />}
                {editing ? t("BUTTONS.saveChanges") : t("BUTTONS.add")}
              </Button>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}


