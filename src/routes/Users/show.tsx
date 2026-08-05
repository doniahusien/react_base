import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Squares2X2Icon as LayoutDashboard, UsersIcon as Users, PencilIcon as Edit, AtSymbolIcon as AtSign, PhoneIcon as Phone, CubeIcon as Package, HeartIcon as Heart, MapPinIcon as MapPin, CalendarDaysIcon as CalendarDays, ShieldCheckIcon as ShieldCheck, ShieldExclamationIcon as ShieldOff, NoSymbolIcon as Ban, StarIcon as Star, UserCircleIcon as UserCircle } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { Skeleton } from "../../components/UI/Skeleton";
import { Deleter } from "../../components/Shared/Deleter";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import type { UserDetail, UserProduct, UserAddress } from "../../types/user";

function formatDate(iso: string | null | undefined): string { if (!iso) return "—"; return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
function InfoCard({ label, children }: { label: string; children: any }) { return <div className="rounded-xl border border-border bg-background p-4"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><div className="text-sm font-semibold text-foreground">{children}</div></div>; }
function SectionHeading({ icon: Icon, title }: { icon: any; title: string }) { return <div className="mb-4 flex items-center gap-2"><div className="flex size-7 items-center justify-center rounded-lg bg-primary/10"><Icon width={15} height={15} className="text-primary" /></div><h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3></div>; }

function Avatar({ src, name }: { src?: string; name: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  if (src) return <ImagePreviewTrigger src={src} alt={name} className="size-24 md:size-32 rounded-full border-4 border-card/50 object-cover shadow-lg" wrapperClassName="rounded-full" />;
  return <span className="flex size-24 md:size-32 shrink-0 items-center justify-center rounded-full border-4 border-card/50 bg-primary/10 text-3xl font-bold text-primary shadow-lg">{initials}</span>;
}

function ProductCard({ product }: { product: UserProduct }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-colors">
      <div className="flex gap-3 mb-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border  ">{product.image ? <ImagePreviewTrigger src={product.image} alt={product.name} className="size-full object-cover" wrapperClassName="size-full" /> : <div className="size-full flex items-center justify-center"><Package width={20} height={20} className="text-muted-foreground/40" /></div>}</div>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{product.name}</p><p className="text-xs text-muted-foreground">{product.brand}</p></div>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">{t("TITLES.price")}</span><span className="font-bold text-primary">{Number(product.total_price_after_discount).toFixed(2)}</span></div>
      </div>
    </div>
  );
}

function AddressCard({ address }: { address: UserAddress }) {
  const { t } = useTranslation();
  return (
    <div className={`rounded-xl border p-4 transition-colors ${address.is_default ? "border-primary/50 bg-primary/5" : "border-border bg-background"}`}>
      {address.is_default && <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"><Star width={10} height={10} />{t("TITLES.defaultAddress")}</span>}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-start gap-1.5"><MapPin width={12} height={12} className="mt-0.5 shrink-0 text-muted-foreground" /><p className="text-foreground leading-relaxed">{address.description}</p></div>
        <div className="flex items-center gap-1.5 pt-1"><Phone width={11} height={11} className="text-muted-foreground" /><bdo dir="ltr" className="text-muted-foreground">+{address.contact.phone_code} {address.contact.phone}</bdo></div>
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
  if (!user) return <div className="space-y-3 p-6"><p className="font-semibold text-foreground">User not found.</p><a href="/users" className="text-sm text-primary hover:underline">← {t("TITLES.users")}</a></div>;

  return (
    <div className="space-y-0">
      <PageHeader
        title={user.full_name}
        translateTitle={false}
    
        icon={UserCircle}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "users", href: "/users", icon: Users },
          { label: user.full_name, icon: UserCircle }
        ]}
        rightActions={
          <>
          <div className="flex items-center gap-2">
              <Button type="button" variant="soft" onClick={() => navigate(`/users/form/${user.id}`)}>
                <Edit width={14} height={14} />
                {t("TITLES.edit", { count: "" as any })}
              </Button>
            </div>
          </>
        }
      />
      <div className="space-y-5 pb-8">
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"><div className="px-6 py-5 border-b border-border"><SectionHeading icon={UserCircle} title={t("TITLES.personalInfo")} /><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"><InfoCard label={t("TITLES.firstName")}>{user.first_name || "—"}</InfoCard><InfoCard label={t("TITLES.lastName")}>{user.last_name || "—"}</InfoCard><InfoCard label={t("TITLES.gender")}>{user.gender ? t(`TITLES.${user.gender}`) : "—"}</InfoCard><InfoCard label={t("TITLES.birthDate")}>{formatDate(user.birth_date)}</InfoCard><InfoCard label={t("TITLES.email")}><a href={`mailto:${user.email}`} className="text-primary hover:underline break-all">{user.email}</a></InfoCard><InfoCard label={t("TITLES.phone")}><bdo dir="ltr">+{user.phone_code} {user.phone}</bdo></InfoCard></div></div></div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"><div className="px-6 py-5 border-b border-border"><SectionHeading icon={ShieldCheck} title={t("TITLES.accountInfo")} /><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"><InfoCard label={t("TITLES.userType")}><span className="capitalize">{user.user_type || "—"}</span></InfoCard>{user.role && <InfoCard label={t("TITLES.role")}>{user.role.name}</InfoCard>}<InfoCard label={t("TITLES.status")}><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${user.is_active ? "bg-success-soft text-success-foreground" : "  text-muted-foreground"}`}>{user.is_active ? t("TITLES.active") : t("TITLES.inactive")}</span></InfoCard><InfoCard label={t("TITLES.lastLogin")}>{formatDate(user.last_login_at)}</InfoCard></div></div></div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"><div className="px-6 py-5"><SectionHeading icon={CalendarDays} title={t("TITLES.metaInfo")} /><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><InfoCard label="ID">#{user.id}</InfoCard><InfoCard label={t("TITLES.createdAt")}>{formatDate(user.created_at)}</InfoCard><InfoCard label={t("TITLES.updatedAt")}>{formatDate(user.updated_at)}</InfoCard></div></div></div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"><div className="px-6 py-5"><SectionHeading icon={MapPin} title={t("TITLES.addresses")} />{(user.addresses ?? []).length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{(user.addresses ?? []).map((addr) => <AddressCard key={addr.id} address={addr} />)}</div> : <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-10"><MapPin width={32} height={32} className="text-muted-foreground/30" /><p className="text-sm text-muted-foreground">{t("TITLES.noAddresses")}</p></div>}</div></div>
        {[{ icon: Package, label: "TITLES.lastOrderedProducts", products: user.statistics?.last_5_ordered_products ?? [], emptyKey: "TITLES.noOrderedProducts" }, { icon: Heart, label: "TITLES.wishlistProducts", products: user.statistics?.last_5_wishlist_products ?? [], emptyKey: "TITLES.noWishlistProducts" }].map(({ icon: Icon, label, products, emptyKey }) => (
          <div key={label} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"><div className="px-6 py-5"><SectionHeading icon={Icon} title={t(label)} />{products.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-10"><Icon width={32} height={32} className="text-muted-foreground/30" /><p className="text-sm text-muted-foreground">{t(emptyKey)}</p></div>}</div></div>
        ))}
      </div>
    </div>
  );
}


