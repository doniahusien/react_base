import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, AtSign, Shield, Lock, Contact, X, Image as ImageIcon, LayoutDashboard, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BannerBreadcrumb } from "../../components/UI/BannerBreadcrumb";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSelectInput, type SelectOption } from "../../components/Inputs/BaseSelectInput";
import { BaseSwitchInput } from "../../components/Inputs/BaseSwitchInput";
import { BaseFilesInput, type FileOutputItem } from "../../components/Inputs/BaseFilesInput";
import { BasePhoneInput } from "../../components/Inputs/BasePhoneInput";
import { SectionCard } from "../../components/Shared/SectionCard";
import { Skeleton } from "../../components/UI/Skeleton";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import type { UserFormValues } from "../../types/user";
import { schemas } from "../../lib/schemas";

export default function UserForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [loadingData, setLoadingData] = useState(editing);
  const [loadingForm, setLoadingForm] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageValue, setImageValue] = useState<any>(null);
  const [imageFile, setImageFile] = useState<FileOutputItem | null>(null);
  const [values, setValues] = useState<UserFormValues>({ first_name: "", last_name: "", email: "", phone_code: "966", phone: "", user_role: null, password: "", password_confirmation: "", is_active: true });
  const set = <K extends keyof UserFormValues>(k: K, v: UserFormValues[K]) => setValues((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        setLoadingData(true);
        const res = await api.get(`users/${id}`);
        const d = res.data.data;
        setValues({ first_name: d.first_name ?? "", last_name: d.last_name ?? "", email: d.email ?? "", phone_code: d.phone_code ?? "966", phone: d.phone ?? "", user_role: d.role ? { id: d.role.id, name: d.role.name } : null, password: "", password_confirmation: "", is_active: d.is_active ?? true });
        if (d.image) setImageValue({ id: d.image?.id ?? null, media: d.image?.media ?? d.image });
      } catch (e: any) { toast.error(t("MESSAGES.failedToLoadUser"), e?.response?.data?.message); }
      finally { setLoadingData(false); }
    })();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setLoadingForm(true);
      const fd = new FormData();
      if (imageFile?.str) fd.append("image", imageFile.str);
      fd.append("first_name", values.first_name); fd.append("last_name", values.last_name);
      fd.append("email", values.email); fd.append("phone_code", values.phone_code); fd.append("phone", values.phone);
      if (values.user_role) fd.append("role_id", String(values.user_role.id));
      if (!editing || values.password) { fd.append("password", values.password); fd.append("password_confirmation", values.password_confirmation); }
      fd.append("is_active", values.is_active ? "1" : "0");
      const url = editing ? `/users/${id}` : "/users";
      if (editing) fd.append("_method", "PUT");
      const res = await api.post(url, fd);
      toast.success(editing ? t("MESSAGES.updatedSuccess") : t("MESSAGES.createdSuccess"), res.data?.message);
      navigate("/users");
    } catch (e: any) { toast.error(editing ? t("MESSAGES.updateFailed") : t("MESSAGES.createFailed"), e?.response?.data?.message); }
    finally { setLoadingForm(false); }
  };

  if (loadingData) return <div className="space-y-5"><Skeleton sections={[{ fields: [{}] }, { fields: [{}, {}] }, { fields: [{}, {}] }, { fields: [{}, {}] }, { fields: [{}, {}, {}] }]} /></div>;

  return (
    <div className="space-y-0">
      <div className="relative -mx-6 overflow-hidden bg-page-header px-6 py-7 border-b border-border/50 mb-8">
        <div className="relative">
          <BannerBreadcrumb items={[{ label: t("TITLES.dashboard"), href: "/", icon: LayoutDashboard }, { label: t("TITLES.users"), href: "/users", icon: Users }, { label: editing ? t("TITLES.edit", { count: "" as any }) : t("TITLES.add", { count: "" as any }) }]} />
          <div className="flex items-end gap-4">
            <div className="w-0.5 self-stretch rounded-full bg-accent" />
            <h1 className="text-2xl font-black tracking-tight text-text">{editing ? t("TITLES.edit", { count: t("TITLES.user") as any }) : t("TITLES.add", { count: t("TITLES.user") as any })}</h1>
          </div>
        </div>
      </div>
      <Form schema={editing ? schemas.userEdit : schemas.userCreate} values={values as any} onSubmit={handleSubmit}>
        {({ errors, touched, field, touch }) => (
          <div className="space-y-6">
            <SectionCard icon={ImageIcon} title={t("TITLES.profilePhoto")} subtitle={t("LABELS.profilePhotoDesc")} color="sky" step={1}>
              <BaseFilesInput name="image" accept="image/*" attachment model="users" value={imageValue} onChange={(v) => setImageFile(Array.isArray(v) ? v[0] : v)} onLoadingChange={setImageLoading} />
            </SectionCard>
            <SectionCard icon={User} title={t("TITLES.basicInfo")} subtitle={t("LABELS.basicInfo")} color="emerald" step={2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseTextInput name="first_name" label={t("TITLES.firstName")} placeholder={t("LABELS.firstName")} value={values.first_name} onInput={(v) => { set("first_name", v); touch("first_name"); }} prependInputIcon={User} {...field("first_name", errors)} />
                <BaseTextInput name="last_name" label={t("TITLES.lastName")} placeholder={t("LABELS.lastName")} value={values.last_name} onInput={(v) => { set("last_name", v); touch("last_name"); }} prependInputIcon={User} {...field("last_name", errors)} />
              </div>
            </SectionCard>
            <SectionCard icon={Contact} title={t("TITLES.contactInfo")} subtitle={t("LABELS.contactInfo")} color="blue" step={3}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseTextInput name="email" label={t("TITLES.email")} placeholder={t("LABELS.email")} type="email" value={values.email} onInput={(v) => { set("email", v); touch("email"); }} prependInputIcon={AtSign} {...field("email", errors)} />
                <BasePhoneInput phoneCode={values.phone_code} phone={values.phone} onPhoneCode={(v) => { set("phone_code", v); touch("phone_code"); }} onPhone={(v) => { set("phone", v); touch("phone"); }} label={t("TITLES.phone")} errorCode={errors.phone_code} errorPhone={errors.phone} touched={touched["phone_code"] || touched["phone"]} />
              </div>
            </SectionCard>
            <SectionCard icon={Shield} title={t("TITLES.roleInterests")} subtitle={t("LABELS.roleInterests")} color="blue" step={4}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseSelectInput name="user_role" label={t("TITLES.role")} placeholder={t("LABELS.role")} url="roles?paginate=0" value={values.user_role} onChange={(v) => set("user_role", v as SelectOption)} prependInputIcon={Shield} />
              </div>
            </SectionCard>
            <SectionCard icon={Lock} title={t("TITLES.security")} subtitle={t("LABELS.security")} color="orange" step={5}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseTextInput name="password" label={editing ? t("LABELS.newPassword") : t("TITLES.password")} placeholder={t("LABELS.passwordPlaceholder")} type="password" value={values.password} onInput={(v) => { set("password", v); touch("password"); }} prependInputIcon={Lock} {...field("password", errors)} />
                <BaseTextInput name="password_confirmation" label={t("LABELS.passwordConfirmation")} placeholder={t("LABELS.passwordConfirmationPlaceholder")} type="password" value={values.password_confirmation} onInput={(v) => { set("password_confirmation", v); touch("password_confirmation"); }} prependInputIcon={Lock} {...field("password_confirmation", errors)} />
                <div className="flex items-center gap-3 md:col-span-2"><BaseSwitchInput name="is_active" label={t("LABELS.activeAccount")} value={values.is_active} onChange={(v) => set("is_active", v)} /></div>
              </div>
            </SectionCard>
            <div className="flex items-center justify-end gap-3 pt-2 pb-4">
              <button type="button" onClick={() => navigate("/users")} className="inline-flex items-center gap-2 rounded-xl border border-border bg-panel px-5 py-2.5 text-sm font-semibold text-muted hover:text-text transition-all"><X size={15} />{t("BUTTONS.cancel")}</button>
              <button type="submit" disabled={loadingForm || imageLoading} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/30 hover:bg-primary-hover active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                {loadingForm ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Shield size={15} />}
                {editing ? t("BUTTONS.saveChanges") : t("BUTTONS.add")}
              </button>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}


