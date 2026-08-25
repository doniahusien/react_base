import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  UserIcon as User,
  AtSymbolIcon as AtSign,
  PhoneIcon as Phone,
  ShieldCheckIcon as Shield,
  PencilIcon as Pencil,
  Squares2X2Icon as LayoutDashboard,
  UserCircleIcon as UserCircle,
  EnvelopeIcon as Mail,
  CalendarIcon as Calendar,
  LanguageIcon as Language,
  ClockIcon as Clock,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../stores/auth";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: any;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border py-3.5 last:border-0">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon width={13} height={13} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

export default function ProfileShow() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const initials = (user?.full_name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const roleLabel = user?.admin_role || user?.user_type || "—";
  const langLabel =
    user?.preferred_language === "ar"
      ? t("TITLES.arabic")
      : user?.preferred_language === "en"
        ? t("TITLES.english")
        : user?.preferred_language || "—";

  return (
    <div className="space-y-5">
      <PageHeader
        title={user?.full_name || "profile"}
        translateTitle={!user?.full_name}
        icon={UserCircle}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "profile", icon: UserCircle },
        ]}
        rightActions={
          <Button type="button" variant="soft" onClick={() => navigate("/profile/edit")}>
            <Pencil width={14} height={14} />
            {t("PROFILE.editTitle")}
          </Button>
        }
      />

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative h-28 overflow-hidden bg-primary opacity-90">
          <div className="pointer-events-none absolute inset-0 bg-foreground/20" />
        </div>
        <div className="px-6 pb-6">
          <div className="relative -mt-10">
            <div className="flex size-20 items-center justify-center rounded-full border-4 border-card bg-primary text-2xl font-black text-foreground shadow-lg">
              {initials || <User width={28} height={28} />}
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-xl font-black text-foreground">
              {user?.full_name || "—"}
            </h2>
            {roleLabel !== "—" && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success-foreground capitalize">
                {roleLabel.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card px-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border py-4">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-soft text-emerald">
              <User width={13} height={13} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("PROFILE.basicInfo")}
            </h3>
          </div>
          <div className="py-1">
            <InfoRow icon={User} label={t("TITLES.name")}>
              {user?.full_name || "—"}
            </InfoRow>
            <InfoRow icon={Shield} label={t("TITLES.role")}>
              <span className="capitalize">{roleLabel.replace(/_/g, " ")}</span>
            </InfoRow>
            <InfoRow icon={UserCircle} label={t("TITLES.userType")}>
              <span className="capitalize">
                {(user?.user_type || "—").replace(/_/g, " ")}
              </span>
            </InfoRow>
            <InfoRow icon={Language} label={t("TITLES.preferredLanguage")}>
              {langLabel}
            </InfoRow>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card px-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border py-4">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail width={13} height={13} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("PROFILE.contactInfo")}
            </h3>
          </div>
          <div className="py-1">
            <InfoRow icon={AtSign} label={t("TITLES.email")}>
              {user?.email ? (
                <a href={`mailto:${user.email}`} className="break-all text-primary hover:underline">
                  {user.email}
                </a>
              ) : (
                "—"
              )}
            </InfoRow>
            <InfoRow icon={Phone} label={t("TITLES.phone")}>
              {user?.phone_number || "—"}
            </InfoRow>
            <InfoRow icon={Clock} label={t("TITLES.lastLogin")}>
              {user?.last_login_at || "—"}
            </InfoRow>
            <InfoRow icon={Calendar} label="ID">
              #{user?.id || "—"}
            </InfoRow>
          </div>
        </div>
      </div>
    </div>
  );
}
