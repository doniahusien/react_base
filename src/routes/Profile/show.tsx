import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, AtSign, Phone, Shield, Pencil, LayoutDashboard, UserCircle, Mail, Calendar } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import { BannerBreadcrumb } from "../../components/UI/BannerBreadcrumb";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";

function InfoRow({ icon: Icon, label, children }: { icon: any; label: string; children: any }) {
  return <div className="flex items-start gap-3 py-3.5 border-b border-border last:border-0"><div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500"><Icon size={13} /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-widest text-app-muted">{label}</p><div className="mt-0.5 text-sm font-medium text-text">{children}</div></div></div>;
}

export default function ProfileShow() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user) ?? {};
  const initials = ((user.name || user.full_name || "") as string).split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <div className="space-y-5">
      <BannerBreadcrumb items={[{ label: t("TITLES.dashboard"), href: "/", icon: LayoutDashboard }, { label: t("PROFILE.title"), icon: UserCircle }]} />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-white/70 dark:bg-slate-800/40 shadow-sm">
        <div className="h-28 bg-linear-to-r from-[#0f0a2a] via-[#1a0f45] to-[#0a1628] relative overflow-hidden">
          <div className="pointer-events-none absolute top-0 left-1/4 h-32 w-52 -translate-y-1/2 rounded-full bg-purple-600/20 blur-3xl" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
            <div className="relative">
              {user.image ? <ImagePreviewTrigger src={user.image} alt={user.name || user.full_name} className="size-20 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-lg" wrapperClassName="rounded-full" /> : <div className="flex size-20 items-center justify-center rounded-full border-4 border-white dark:border-slate-800 bg-purple-600 text-2xl font-black text-white shadow-lg">{initials || <User size={28} />}</div>}
              <span className="absolute bottom-1 inset-e-1 size-4 rounded-full border-2 border-white dark:border-slate-800 bg-green-500" />
            </div>
            <button type="button" onClick={() => navigate("/profile/edit")} className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-50 dark:bg-purple-950/20 px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-100 transition-all"><Pencil size={14} />{t("PROFILE.editTitle")}</button>
          </div>
          <div className="mt-3"><h2 className="text-xl font-black text-text">{user.full_name || user.name || "—"}</h2>{user.role && <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400 capitalize">{user.role}</span>}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white/70 dark:bg-slate-800/40 px-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border py-4"><div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><User size={13} /></div><h3 className="text-xs font-bold uppercase tracking-widest text-app-muted">{t("PROFILE.basicInfo")}</h3></div>
          <div className="py-1">
            <InfoRow icon={User} label={t("TITLES.name")}>{user.full_name || user.name || "—"}</InfoRow>
            <InfoRow icon={Shield} label={t("TITLES.role")}>{user.role || "—"}</InfoRow>
            <InfoRow icon={UserCircle} label={t("TITLES.userType")}><span className="capitalize">{user.gender ? t(`TITLES.${user.gender}`) : "—"}</span></InfoRow>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white/70 dark:bg-slate-800/40 px-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border py-4"><div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600"><Mail size={13} /></div><h3 className="text-xs font-bold uppercase tracking-widest text-app-muted">{t("PROFILE.contactInfo")}</h3></div>
          <div className="py-1">
            <InfoRow icon={AtSign} label={t("TITLES.email")}><a href={`mailto:${user.email}`} className="text-purple-600 hover:underline break-all">{user.email || "—"}</a></InfoRow>
            <InfoRow icon={Phone} label={t("TITLES.phone")}>{user.phone ? <bdo dir="ltr">+{user.phone_code} {user.phone}</bdo> : "—"}</InfoRow>
            <InfoRow icon={Calendar} label="ID">#{user.id || "—"}</InfoRow>
          </div>
        </div>
      </div>
    </div>
  );
}


