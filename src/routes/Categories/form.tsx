import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Library, Shield, X, Image as ImageIcon, Pen, LayoutDashboard } from "lucide-react";
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

export default function CategoryForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [loadingData, setLoadingData] = useState(editing);
  const [loadingForm, setLoadingForm] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageValue, setImageValue] = useState<any>(null);
  const [imageFile, setImageFile] = useState<FileOutputItem | null>(null);
  const [values, setValues] = useState({ name_en: "", name_ar: "" });
  const set = <K extends keyof typeof values>(k: K, v: string) => setValues((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        setLoadingData(true);
        const res = await api.get(`categories/${id}`);
        const d = res.data.data;
        setValues({ name_en: d.en?.name ?? "", name_ar: d.ar?.name ?? "" });
        if (d.image) setImageValue({ id: d.image?.id ?? null, media: d.image?.media ?? d.image });
      } catch (e: any) { toast.error(t("MESSAGES.failedToLoadCategory"), e?.response?.data?.message); }
      finally { setLoadingData(false); }
    })();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setLoadingForm(true);
      const fd = new FormData();
      if (imageFile?.str) fd.append("image", imageFile.str);
      fd.append("ar[name]", values.name_ar); fd.append("en[name]", values.name_en);
      const url = editing ? `/categories/${id}` : "/categories";
      if (editing) fd.append("_method", "PUT");
      const res = await api.post(url, fd);
      toast.success(editing ? t("MESSAGES.updatedSuccess") : t("MESSAGES.createdSuccess"), res.data?.message);
      navigate("/categories");
    } catch (e: any) { toast.error(editing ? t("MESSAGES.updateFailed") : t("MESSAGES.createFailed"), e?.response?.data?.message); }
    finally { setLoadingForm(false); }
  };

  if (loadingData) return <div className="space-y-5"><Skeleton sections={[{ fields: [{}] }, { fields: [{}, {}] }]} /></div>;

  return (
    <div className="space-y-0">
      <div className="page-header relative -mx-6 overflow-hidden px-6 py-7 mb-8">
        <div className="relative">
          <BannerBreadcrumb items={[{ label: t("TITLES.dashboard"), href: "/", icon: LayoutDashboard }, { label: t("TITLES.categories"), href: "/categories", icon: Library }, { label: editing ? t("TITLES.edit", { count: "" as any }) : t("TITLES.add", { count: "" as any }) }]} />
          <div className="flex items-end gap-4">
            <div className="w-0.5 self-stretch rounded-full bg-primary opacity-70" />
            <h1 className="text-2xl font-black tracking-tight text-text">{editing ? t("TITLES.edit", { count: t("TITLES.category") as any }) : t("TITLES.add", { count: t("TITLES.category") as any })}</h1>
          </div>
        </div>
      </div>
      <Form schema={schemas.category} values={{ ...values, image: imageFile ?? imageValue }} onSubmit={handleSubmit}>
        {({ errors, field, touch }) => (
          <div className="space-y-6">
            <SectionCard icon={ImageIcon} title={t("TITLES.image")} subtitle={t("LABELS.categoryImageDesc")} color="sky" step={1}>
              <BaseFilesInput name="image" accept="image/*" attachment model="categories" value={imageValue} onChange={(v) => setImageFile(Array.isArray(v) ? v[0] : v)} onLoadingChange={setImageLoading} error={errors.image} touched={!!errors.image} />
            </SectionCard>
            <SectionCard icon={Library} title={t("TITLES.basicInfo")} subtitle={t("LABELS.basicInfoCategoryDesc")} color="emerald" step={2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseTextInput name="name_ar" label={t("TITLES.nameArabic")} placeholder={t("LABELS.nameArabic")} value={values.name_ar} onInput={(v) => { set("name_ar", v); touch("name_ar"); }} prependInputIcon={Pen} {...field("name_ar", errors)} />
                <BaseTextInput name="name_en" label={t("TITLES.nameEnglish")} placeholder={t("LABELS.nameEnglish")} value={values.name_en} onInput={(v) => { set("name_en", v); touch("name_en"); }} prependInputIcon={Pen} {...field("name_en", errors)} />
              </div>
            </SectionCard>
            <div className="flex items-center justify-end gap-3 pt-2 pb-4">
              <button type="button" onClick={() => navigate("/categories")} className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted hover:text-text hover:bg-panel-alt transition-all"><X size={15} />{t("BUTTONS.cancel")}</button>
              <button type="submit" disabled={loadingForm || imageLoading} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-text shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
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


