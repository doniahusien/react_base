import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, AtSign, Phone, Shield, Pencil, LayoutDashboard, UserCircle, Mail, Calendar } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import { BannerBreadcrumb } from "../../components/UI/BannerBreadcrumb";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";

function InfoRow({ icon: Icon, label, children }: { icon: any; label: string; children: any }) {
  return <div className="flex items-start gap-3 py-3.5 border-b border-border last:border-0"><div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon size={13} /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p><div className="mt-0.5 text-sm font-medium text-foreground">{children}</div></div></div>;
}

export default function ProfileShow() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user) ?? {};
  const initials = ((user.name || user.full_name || "") as string).split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <div className="space-y-5">
      <BannerBreadcrumb items={[{ label: t("TITLES.dashboard"), href: "/", icon: LayoutDashboard }, { label: t("PROFILE.title"), icon: UserCircle }]} />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-28 bg-primary relative overflow-hidden opacity-90">
          <div className="pointer-events-none absolute inset-0 bg-foreground/20" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
            <div className="relative">
              {user.image ? <ImagePreviewTrigger src={user.image} alt={user.name || user.full_name} className="size-20 rounded-full border-4 border-card object-cover shadow-lg" wrapperClassName="rounded-full" /> : <div className="flex size-20 items-center justify-center rounded-full border-4 border-card bg-primary text-2xl font-black text-foreground shadow-lg">{initials || <User size={28} />}</div>}
              <span className="absolute bottom-1 inset-e-1 size-4 rounded-full border-2 border-card bg-success" />
            </div>
            <button type="button" onClick={() => navigate("/profile/edit")} className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-all"><Pencil size={14} />{t("PROFILE.editTitle")}</button>
          </div>
          <div className="mt-3"><h2 className="text-xl font-black text-foreground">{user.full_name || user.name || "—"}</h2>{user.role && <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success-foreground capitalize">{user.role}</span>}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card px-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border py-4"><div className="flex size-7 items-center justify-center rounded-lg bg-emerald-soft text-emerald"><User size={13} /></div><h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("PROFILE.basicInfo")}</h3></div>
          <div className="py-1">
            <InfoRow icon={User} label={t("TITLES.name")}>{user.full_name || user.name || "—"}</InfoRow>
            <InfoRow icon={Shield} label={t("TITLES.role")}>{user.role || "—"}</InfoRow>
            <InfoRow icon={UserCircle} label={t("TITLES.userType")}><span className="capitalize">{user.gender ? t(`TITLES.${user.gender}`) : "—"}</span></InfoRow>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border py-4"><div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary"><Mail size={13} /></div><h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("PROFILE.contactInfo")}</h3></div>
          <div className="py-1">
            <InfoRow icon={AtSign} label={t("TITLES.email")}><a href={`mailto:${user.email}`} className="text-primary hover:underline break-all">{user.email || "—"}</a></InfoRow>
            <InfoRow icon={Phone} label={t("TITLES.phone")}>{user.phone ? <bdo dir="ltr">+{user.phone_code} {user.phone}</bdo> : "—"}</InfoRow>
            <InfoRow icon={Calendar} label="ID">#{user.id || "—"}</InfoRow>
          </div>
        </div>
      </div>
    </div>
  );
}


