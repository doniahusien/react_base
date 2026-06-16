import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Edit, AtSign, Phone, Package, Heart, MapPin, CalendarDays, ShieldCheck, ShieldOff, Ban, Star, UserCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BannerBreadcrumb } from "../../components/UI/BannerBreadcrumb";
import { Skeleton } from "../../components/UI/Skeleton";
import { Deleter } from "../../components/Shared/Deleter";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import type { UserDetail, UserProduct, UserAddress } from "../../types/user";

function formatDate(iso: string | null | undefined): string { if (!iso) return "—"; return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
function InfoCard({ label, children }: { label: string; children: any }) { return <div className="rounded-xl border border-border bg-body p-4"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-app-muted">{label}</p><div className="text-sm font-semibold text-text">{children}</div></div>; }
function SectionHeading({ icon: Icon, title }: { icon: any; title: string }) { return <div className="mb-4 flex items-center gap-2"><div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10"><Icon size={15} className="text-purple-600" /></div><h3 className="text-xs font-bold uppercase tracking-widest text-app-muted">{title}</h3></div>; }

function Avatar({ src, name }: { src?: string; name: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  if (src) return <ImagePreviewTrigger src={src} alt={name} className="size-24 md:size-32 rounded-full border-4 border-white/50 dark:border-slate-700/50 object-cover shadow-lg" wrapperClassName="rounded-full" />;
  return <span className="flex size-24 md:size-32 shrink-0 items-center justify-center rounded-full border-4 border-white/50 dark:border-slate-700/50 bg-purple-100 dark:bg-purple-950/40 text-3xl font-bold text-purple-600 shadow-lg">{initials}</span>;
}

function ProductCard({ product }: { product: UserProduct }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-border bg-body p-4 hover:border-purple-400/40 transition-colors">
      <div className="flex gap-3 mb-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-slate-50 dark:bg-slate-800">{product.image ? <ImagePreviewTrigger src={product.image} alt={product.name} className="size-full object-cover" wrapperClassName="size-full" /> : <div className="size-full flex items-center justify-center"><Package size={20} className="text-app-muted/40" /></div>}</div>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-text">{product.name}</p><p className="text-xs text-app-muted">{product.brand}</p></div>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between"><span className="text-app-muted">{t("TITLES.price")}</span><span className="font-bold text-purple-600">{Number(product.total_price_after_discount).toFixed(2)}</span></div>
      </div>
    </div>
  );
}

function AddressCard({ address }: { address: UserAddress }) {
  const { t } = useTranslation();
  return (
    <div className={`rounded-xl border p-4 transition-colors ${address.is_default ? "border-purple-400/50 bg-purple-500/5" : "border-border bg-body"}`}>
      {address.is_default && <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600"><Star size={10} />{t("TITLES.defaultAddress")}</span>}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-start gap-1.5"><MapPin size={12} className="mt-0.5 shrink-0 text-app-muted" /><p className="text-text leading-relaxed">{address.description}</p></div>
        <div className="flex items-center gap-1.5 pt-1"><Phone size={11} className="text-app-muted" /><bdo dir="ltr" className="text-app-muted">+{address.contact.phone_code} {address.contact.phone}</bdo></div>
      </div>
    </div>
  );
}

export default function UserShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setLoading(true); const res = await api.get(`users/${id}`); setUser(res.data.data ?? res.data); }
      catch (e: any) { toast.error(t("MESSAGES.failedToLoadUser"), e?.response?.data?.message); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="space-y-5"><Skeleton sections={[{ fields: [{}, {}, {}, {}] }, { fields: [{}, {}, {}] }]} /></div>;
  if (!user) return <div className="space-y-3 p-6"><p className="font-semibold text-text">User not found.</p><a href="/users" className="text-sm text-purple-600 hover:underline">← {t("TITLES.users")}</a></div>;

  return (
    <div className="space-y-0">
      <div className="relative -mx-6 overflow-hidden bg-linear-to-r from-[#0f0a2a]/10 via-[#1a0f45]/6 to-[#0a1628]/8 dark:from-[#0f0a2a] dark:via-[#1a0f45] dark:to-[#0a1628] px-6 pt-14 pb-7 border-b border-purple-500/10 dark:border-purple-500/20 mb-6">
        <div className="absolute top-3 inset-s-6"><BannerBreadcrumb items={[{ label: t("TITLES.dashboard"), href: "/", icon: LayoutDashboard }, { label: t("TITLES.users"), href: "/users", icon: Users }, { label: user.full_name, icon: UserCircle }]} /></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative shrink-0"><Avatar src={user.image} name={user.full_name} /><span className={`absolute bottom-1 inset-e-1 size-4 rounded-full border-2 border-white dark:border-slate-900 ${user.is_active ? "bg-green-500" : "bg-slate-400"}`} /></div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">{user.full_name}</h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.is_active ? "bg-green-500/10 text-green-600" : "bg-slate-200 dark:bg-slate-700 text-app-muted"}`}>{user.is_active ? <ShieldCheck size={11} /> : <ShieldOff size={11} />}{user.is_active ? t("TITLES.active") : t("TITLES.inactive")}</span>
              {user.is_ban && <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600"><Ban size={11} />{t("TITLES.banned")}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-app-muted">
              {user.email && <span className="flex items-center gap-1.5"><AtSign size={13} />{user.email}</span>}
              {user.phone && <span className="flex items-center gap-1.5"><Phone size={13} /><bdo dir="ltr">+{user.phone_code} {user.phone}</bdo></span>}
              {user.created_at && <span className="flex items-center gap-1.5"><CalendarDays size={13} />{formatDate(user.created_at)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => navigate(`/users/form/${user.id}`)} className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-50 dark:bg-purple-950/20 px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-100 transition-all"><Edit size={14} />{t("TITLES.edit", { count: "" as any })}</button>
            <Deleter url={`/users/${user.id}`} onReload={() => navigate("/users")} />
          </div>
        </div>
      </div>
      <div className="space-y-5 pb-8">
        <div className="rounded-2xl border border-border bg-white/70 dark:bg-slate-800/40 overflow-hidden shadow-sm"><div className="px-6 py-5 border-b border-border"><SectionHeading icon={UserCircle} title={t("TITLES.personalInfo")} /><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"><InfoCard label={t("TITLES.firstName")}>{user.first_name || "—"}</InfoCard><InfoCard label={t("TITLES.lastName")}>{user.last_name || "—"}</InfoCard><InfoCard label={t("TITLES.gender")}>{user.gender ? t(`TITLES.${user.gender}`) : "—"}</InfoCard><InfoCard label={t("TITLES.birthDate")}>{formatDate(user.birth_date)}</InfoCard><InfoCard label={t("TITLES.email")}><a href={`mailto:${user.email}`} className="text-purple-600 hover:underline break-all">{user.email}</a></InfoCard><InfoCard label={t("TITLES.phone")}><bdo dir="ltr">+{user.phone_code} {user.phone}</bdo></InfoCard></div></div></div>
        <div className="rounded-2xl border border-border bg-white/70 dark:bg-slate-800/40 overflow-hidden shadow-sm"><div className="px-6 py-5 border-b border-border"><SectionHeading icon={ShieldCheck} title={t("TITLES.accountInfo")} /><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"><InfoCard label={t("TITLES.userType")}><span className="capitalize">{user.user_type || "—"}</span></InfoCard>{user.role && <InfoCard label={t("TITLES.role")}>{user.role.name}</InfoCard>}<InfoCard label={t("TITLES.status")}><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${user.is_active ? "bg-green-500/10 text-green-600" : "bg-slate-200 dark:bg-slate-700 text-app-muted"}`}>{user.is_active ? t("TITLES.active") : t("TITLES.inactive")}</span></InfoCard><InfoCard label={t("TITLES.lastLogin")}>{formatDate(user.last_login_at)}</InfoCard></div></div></div>
        <div className="rounded-2xl border border-border bg-white/70 dark:bg-slate-800/40 overflow-hidden shadow-sm"><div className="px-6 py-5"><SectionHeading icon={CalendarDays} title={t("TITLES.metaInfo")} /><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><InfoCard label="ID">#{user.id}</InfoCard><InfoCard label={t("TITLES.createdAt")}>{formatDate(user.created_at)}</InfoCard><InfoCard label={t("TITLES.updatedAt")}>{formatDate(user.updated_at)}</InfoCard></div></div></div>
        <div className="rounded-2xl border border-border bg-white/70 dark:bg-slate-800/40 overflow-hidden shadow-sm"><div className="px-6 py-5"><SectionHeading icon={MapPin} title={t("TITLES.addresses")} />{(user.addresses ?? []).length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{(user.addresses ?? []).map((addr) => <AddressCard key={addr.id} address={addr} />)}</div> : <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-10"><MapPin size={32} className="text-app-muted/30" /><p className="text-sm text-app-muted">{t("TITLES.noAddresses")}</p></div>}</div></div>
        {[{ icon: Package, label: "TITLES.lastOrderedProducts", products: user.statistics?.last_5_ordered_products ?? [], emptyKey: "TITLES.noOrderedProducts" }, { icon: Heart, label: "TITLES.wishlistProducts", products: user.statistics?.last_5_wishlist_products ?? [], emptyKey: "TITLES.noWishlistProducts" }].map(({ icon: Icon, label, products, emptyKey }) => (
          <div key={label} className="rounded-2xl border border-border bg-white/70 dark:bg-slate-800/40 overflow-hidden shadow-sm"><div className="px-6 py-5"><SectionHeading icon={Icon} title={t(label)} />{products.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-10"><Icon size={32} className="text-app-muted/30" /><p className="text-sm text-app-muted">{t(emptyKey)}</p></div>}</div></div>
        ))}
      </div>
    </div>
  );
}


