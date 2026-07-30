import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Earth, Pen, Shield, X, Image as ImageIcon, HandCoins, PackageCheck, LayoutDashboard, Phone } from "lucide-react";
import { BannerBreadcrumb } from "../../components/UI/BannerBreadcrumb";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseFilesInput, type FileOutputItem } from "../../components/Inputs/BaseFilesInput";
import { Skeleton } from "../../components/UI/Skeleton";
import { SectionCard } from "../../components/Shared/SectionCard";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import { useTranslation } from "react-i18next";
import { schemas } from "../../lib/schemas";

export default function CountryForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [loadingData, setLoadingData] = useState(editing);
  const [loadingForm, setLoadingForm] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);
  const [flagValue, setFlagValue] = useState<any>(null);
  const [flagFile, setFlagFile] = useState<FileOutputItem | null>(null);
  const [values, setValues] = useState({ name_en: "", name_ar: "", phone_code: "", phone_length: "", currency_ar: "", currency_en: "", estimated_arrival_days: "" });
  const set = <K extends keyof typeof values>(k: K, v: string) => setValues((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        setLoadingData(true);
        const res = await api.get(`countries/${id}`);
        const d = res.data.data;
        setValues({ name_en: d.en?.name ?? "", name_ar: d.ar?.name ?? "", phone_code: d.phone_code ?? "", phone_length: String(d.phone_length ?? ""), currency_ar: d.ar?.currency ?? "", currency_en: d.en?.currency ?? "", estimated_arrival_days: String(d.estimated_arrival_days ?? "") });
        if (d.flag) setFlagValue({ id: d.flag?.id ?? null, media: d.flag?.media ?? d.flag });
      } catch (e: any) { toast.error(t("MESSAGES.failedToLoadCountry"), e?.response?.data?.message); }
      finally { setLoadingData(false); }
    })();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setLoadingForm(true);
      const fd = new FormData();
      if (flagFile?.str) fd.append("flag", flagFile.str);
      fd.append("ar[name]", values.name_ar); fd.append("en[name]", values.name_en);
      fd.append("phone_code", values.phone_code); fd.append("phone_length", values.phone_length);
      fd.append("ar[currency]", values.currency_ar); fd.append("en[currency]", values.currency_en);
      fd.append("estimated_arrival_days", values.estimated_arrival_days);
      const url = editing ? `/countries/${id}` : "/countries";
      if (editing) fd.append("_method", "PUT");
      const res = await api.post(url, fd);
      toast.success(editing ? t("MESSAGES.updatedSuccess") : t("MESSAGES.createdSuccess"), res.data?.message);
      navigate("/countries");
    } catch (e: any) { toast.error(editing ? t("MESSAGES.updateFailed") : t("MESSAGES.createFailed"), e?.response?.data?.message); }
    finally { setLoadingForm(false); }
  };

  if (loadingData) return <div className="space-y-5"><Skeleton sections={[{ fields: [{}] }, { fields: [{}, {}, {}, {}] }, { fields: [{}, {}, {}] }]} /></div>;

  return (
    <div className="space-y-0">
      <div className="page-header relative -mx-6 overflow-hidden px-6 py-7 mb-8">
        <div className="relative">
          <BannerBreadcrumb items={[{ label: t("TITLES.dashboard"), href: "/", icon: LayoutDashboard }, { label: t("TITLES.countries"), href: "/countries", icon: Earth }, { label: editing ? t("TITLES.edit", { count: "" as any }) : t("TITLES.add", { count: "" as any }) }]} />
          <div className="flex items-end gap-4">
            <div className="w-0.5 self-stretch rounded-full bg-primary opacity-70" />
            <h1 className="text-2xl font-black tracking-tight text-text">{editing ? t("TITLES.edit", { count: t("TITLES.country") as any }) : t("TITLES.add", { count: t("TITLES.country") as any })}</h1>
          </div>
        </div>
      </div>
      <Form schema={schemas.country} values={{ ...values, flag: flagFile ?? flagValue }} onSubmit={handleSubmit}>
        {({ errors, field, touch }) => (
          <div className="space-y-6">
            <SectionCard icon={ImageIcon} title={t("TITLES.flag")} subtitle={t("LABELS.flagImageDesc")} color="sky" step={1}>
              <BaseFilesInput name="flag" accept="image/*" attachment model="countries" value={flagValue} onChange={(v) => setFlagFile(Array.isArray(v) ? v[0] : v)} onLoadingChange={setFlagLoading} error={errors.flag} touched={!!errors.flag} />
            </SectionCard>
            <SectionCard icon={Earth} title={t("TITLES.basicInfo")} subtitle={t("LABELS.basicInfoCountryDesc")} color="emerald" step={2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseTextInput name="name_ar" label={t("TITLES.nameArabic")} placeholder={t("LABELS.nameArabic")} value={values.name_ar} onInput={(v) => { set("name_ar", v); touch("name_ar"); }} prependInputIcon={Pen} {...field("name_ar", errors)} />
                <BaseTextInput name="name_en" label={t("TITLES.nameEnglish")} placeholder={t("LABELS.nameEnglish")} value={values.name_en} onInput={(v) => { set("name_en", v); touch("name_en"); }} prependInputIcon={Pen} {...field("name_en", errors)} />
                <BaseTextInput name="phone_code" label={t("TITLES.phoneCode")} placeholder={t("LABELS.phoneCode")} value={values.phone_code} onInput={(v) => { set("phone_code", v); touch("phone_code"); }} prependInputIcon={Phone} {...field("phone_code", errors)} />
                <BaseTextInput name="phone_length" label={t("TITLES.phoneNumberLimit")} placeholder={t("LABELS.phoneNumberLimit")} type="number" value={values.phone_length} onInput={(v) => { set("phone_length", v); touch("phone_length"); }} prependInputIcon={Phone} {...field("phone_length", errors)} />
              </div>
            </SectionCard>
            <SectionCard icon={HandCoins} title={t("TITLES.otherInfo")} subtitle={t("LABELS.otherInfoDesc")} color="blue" step={3}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseTextInput name="currency_ar" label={t("TITLES.currencyArabic")} placeholder={t("LABELS.currencyArabic")} value={values.currency_ar} onInput={(v) => { set("currency_ar", v); touch("currency_ar"); }} prependInputIcon={HandCoins} {...field("currency_ar", errors)} />
                <BaseTextInput name="currency_en" label={t("TITLES.currencyEnglish")} placeholder={t("LABELS.currencyEnglish")} value={values.currency_en} onInput={(v) => { set("currency_en", v); touch("currency_en"); }} prependInputIcon={HandCoins} {...field("currency_en", errors)} />
                <BaseTextInput name="estimated_arrival_days" label={t("TITLES.estimatedArrivalDays")} placeholder={t("LABELS.estimatedArrivalDays")} type="number" value={values.estimated_arrival_days} onInput={(v) => { set("estimated_arrival_days", v); touch("estimated_arrival_days"); }} prependInputIcon={PackageCheck} {...field("estimated_arrival_days", errors)} />
              </div>
            </SectionCard>
            <div className="flex items-center justify-end gap-3 pt-2 pb-4">
              <button type="button" onClick={() => navigate("/countries")} className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted hover:text-text hover:bg-panel-alt transition-all"><X size={15} />{t("BUTTONS.cancel")}</button>
              <button type="submit" disabled={loadingForm || flagLoading} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-text shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                {loadingForm ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <Shield size={15} />}
                {editing ? t("BUTTONS.saveChanges") : t("BUTTONS.add")}
              </button>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}


