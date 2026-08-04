import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserIcon as User, AtSymbolIcon as AtSign, ShieldCheckIcon as Shield, LockClosedIcon as Lock, UserCircleIcon as Contact, XMarkIcon as X, PhotoIcon as ImageIcon, Squares2X2Icon as LayoutDashboard, UserCircleIcon as UserCircle, KeyIcon as KeyRound } from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { useAuthStore } from "../../stores/auth";
import Cookies from "js-cookie";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { type FileOutputItem } from "../../components/Inputs/BaseFilesInput";
import { AvatarPicker } from "../../components/Inputs/AvatarPicker";
import { BasePhoneInput } from "../../components/Inputs/BasePhoneInput";
import { SectionCard } from "../../components/Shared/SectionCard";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import { schemas } from "../../lib/schemas";

const USER_DATA_KEY = import.meta.env.VITE_USER_DATA ?? "admin_data";

function ChangePasswordDialog({ onClose, successMsg, failedMsg }: { onClose: () => void; successMsg: string; failedMsg: string; }) {
  const { t } = useTranslation();
  const [values, setValues] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof values) => (v: string) => setValues(p => ({ ...p, [k]: v }));
  const handleSubmit = async () => {
    try { setLoading(true); const fd = new FormData(); fd.append("current_password", values.current_password); fd.append("password", values.password); fd.append("password_confirmation", values.password_confirmation); await api.post("/profile/change-password", fd); toast.success(successMsg); onClose(); }
    catch (e: any) { toast.error(failedMsg, e?.response?.data?.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} /><div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-background border border-border shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><KeyRound width={14} height={14} /></div><h3 className="text-sm font-bold text-foreground">{t("PROFILE.changePassword")}</h3></div>
        <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-xl   text-muted-foreground hover:bg-muted border border-border transition-all"><X width={14} height={14} /></button>
      </div>
      <Form schema={schemas.profilePassword} values={values} onSubmit={handleSubmit}>{({ errors, field, touch }) => (
        <div className="space-y-4 px-6 py-5">
          <BaseTextInput name="current_password" label={t("PROFILE.currentPassword")} type="password" value={values.current_password} onInput={v => { set("current_password")(v); touch("current_password"); }} prependInputIcon={Lock} {...field("current_password", errors)} />
          <BaseTextInput name="password" label={t("PROFILE.newPassword")} type="password" value={values.password} onInput={v => { set("password")(v); touch("password"); }} prependInputIcon={Lock} {...field("password", errors)} />
          <BaseTextInput name="password_confirmation" label={t("PROFILE.confirmPassword")} type="password" value={values.password_confirmation} onInput={v => { set("password_confirmation")(v); touch("password_confirmation"); }} prependInputIcon={Lock} {...field("password_confirmation", errors)} />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"><X width={14} height={14} /> {t("BUTTONS.cancel")}</button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all">{loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <Shield width={14} height={14} />}{t("BUTTONS.saveChanges")}</button>
          </div>
        </div>
      )}</Form>
    </div></div>
  );
}

export default function ProfileEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuthStore();
  const [imageValue] = useState<any>(user?.image ? { id: user.image?.id ?? null, media: user.image?.media ?? user.image } : null);
  const [imageFile, setImageFile] = useState<FileOutputItem | null>(null);
  const [imageLoading, setImgLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [values, setValues] = useState({ first_name: user?.first_name ?? "", last_name: user?.last_name ?? "", email: user?.email ?? "", phone_code: user?.phone_code ?? "966", phone: user?.phone ?? "" });
  const set = <K extends keyof typeof values>(k: K, v: string) => setValues(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      if (imageFile?.str) fd.append("image", imageFile.str);
      fd.append("first_name", values.first_name); fd.append("last_name", values.last_name);
      fd.append("email", values.email); fd.append("phone_code", values.phone_code); fd.append("phone", values.phone);
      fd.append("_method", "PUT");
      const res = await api.post("profile", fd);
      const updated = res.data?.data ?? {};
      const { token: _t, verification_token: _vt, permissions: _p, permissions_of_roles: _por, ...userData } = updated;
      Cookies.set(USER_DATA_KEY, JSON.stringify(userData));
      await fetchProfile();
      toast.success(res.data?.message);
      navigate("/profile");
    } catch (e: any) { toast.error(t("PROFILE.updateFailed"), e?.response?.data?.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-0">
      <PageHeader
        title="editProfile"
        subtitle={t("LABELS.profileEditDesc")}
        translateSubtitle={false}
        icon={User}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "profile", href: "/profile", icon: UserCircle },
          { label: "editProfile" }
        ]}
      />
      <Form schema={schemas.profileEdit} values={values} onSubmit={handleSubmit}>
        {({ errors, field, touch }) => (
          <div className="space-y-6">
            <SectionCard icon={ImageIcon} title={t("PROFILE.profilePhoto")} subtitle="" color="sky" step={1}>
              <div className="flex flex-col gap-4">
                <div className="w-full"><AvatarPicker name="image" label={t("PROFILE.profilePhoto")} accept="image/*" attachment model="users" value={imageValue} onChange={v => setImageFile(v)} onLoadingChange={setImgLoad} /></div>
                <button type="button" onClick={() => setPwOpen(true)} className="inline-flex items-center gap-2 self-start rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-all"><KeyRound width={14} height={14} />{t("PROFILE.changePassword")}</button>
              </div>
            </SectionCard>
            <SectionCard icon={User} title={t("PROFILE.basicInfo")} subtitle="" color="emerald" step={2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseTextInput name="first_name" label={t("TITLES.firstName")} placeholder={t("LABELS.firstName")} value={values.first_name} prependInputIcon={User} onInput={v => { set("first_name", v); touch("first_name"); }} {...field("first_name", errors)} />
                <BaseTextInput name="last_name" label={t("TITLES.lastName")} placeholder={t("LABELS.lastName")} value={values.last_name} prependInputIcon={User} onInput={v => { set("last_name", v); touch("last_name"); }} {...field("last_name", errors)} />
              </div>
            </SectionCard>
            <SectionCard icon={Contact} title={t("PROFILE.contactInfo")} subtitle="" color="blue" step={3}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseTextInput name="email" label={t("TITLES.email")} placeholder={t("LABELS.email")} type="email" value={values.email} prependInputIcon={AtSign} onInput={v => { set("email", v); touch("email"); }} {...field("email", errors)} />
                <BasePhoneInput phoneCode={values.phone_code} phone={values.phone} label={t("TITLES.phone")} onPhoneCode={v => { set("phone_code", v); touch("phone_code"); }} onPhone={v => { set("phone", v); touch("phone"); }} errorCode={errors.phone_code} errorPhone={errors.phone} touched={!!errors.phone} />
              </div>
            </SectionCard>
            <div className="flex items-center justify-end gap-3 pt-2 pb-4">
              <button type="button" onClick={() => navigate("/profile")} className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><X width={15} height={15} />{t("BUTTONS.cancel")}</button>
              <button type="submit" disabled={loading || imageLoading} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-60 transition-all">{loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <Shield width={15} height={15} />}{t("BUTTONS.saveChanges")}</button>
            </div>
          </div>
        )}
      </Form>
      {pwOpen && <ChangePasswordDialog onClose={() => setPwOpen(false)} successMsg={t("PROFILE.passwordUpdated")} failedMsg={t("PROFILE.passwordFailed")} />}
    </div>
  );
}


