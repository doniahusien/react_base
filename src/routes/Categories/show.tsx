import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Library, Edit, CalendarDays, Folder, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BannerBreadcrumb } from "../../components/UI/BannerBreadcrumb";
import { Skeleton } from "../../components/UI/Skeleton";
import { Deleter } from "../../components/Shared/Deleter";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import type { Category } from "../../types/category";

function formatDate(iso: string | null | undefined): string { if (!iso) return "—"; return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
function InfoCard({ label, children }: { label: string; children: any }) { return <div className="rounded-xl border border-border bg-body p-4"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p><div className="text-sm font-semibold text-text">{children}</div></div>; }
function SectionHeading({ icon: Icon, title }: { icon: any; title: string }) { return <div className="mb-4 flex items-center gap-2"><div className="flex size-7 items-center justify-center rounded-lg bg-primary/10"><Icon size={15} className="text-primary" /></div><h3 className="text-xs font-bold uppercase tracking-widest text-muted">{title}</h3></div>; }

export default function CategoryShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setLoading(true); const res = await api.get(`categories/${id}`); setCategory(res.data.data ?? res.data); }
      catch (e: any) { toast.error(t("MESSAGES.failedToLoadCategory"), e?.response?.data?.message); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="space-y-5"><Skeleton sections={[{ fields: [{}, {}, {}] }, { fields: [{}, {}] }]} /></div>;
  if (!category) return <div className="space-y-3 p-6"><p className="font-semibold text-text">{t("TITLES.notFound")}</p><a href="/categories" className="text-sm text-primary hover:underline">← {t("TITLES.categories")}</a></div>;

  const displayName = category.name ?? category.en?.name ?? category.ar?.name ?? "—";

  return (
    <div className="space-y-0">
      <div className="page-header relative -mx-6 overflow-hidden px-6 pt-14 pb-7 mb-6">
        <div className="absolute top-3 start-6"><BannerBreadcrumb items={[{ label: t("TITLES.dashboard"), href: "/", icon: LayoutDashboard }, { label: t("TITLES.categories"), href: "/categories", icon: Library }, { label: displayName, icon: Folder }]} /></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative shrink-0">
            {category.image ? <ImagePreviewTrigger src={category.image} alt={displayName} className="size-24 md:size-32 rounded-xl border-4 border-panel/50 object-cover shadow-lg" wrapperClassName="rounded-xl" /> : <div className="flex size-24 md:size-32 items-center justify-center rounded-xl border-4 border-panel/50 bg-primary/10 shadow-lg"><Folder size={40} className="text-primary" /></div>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-text mb-1">{displayName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1.5"><CalendarDays size={13} />{formatDate(category.created_at)}</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${category.is_active ? "bg-green-500/10 text-green-600" : "bg-panel-soft text-muted"}`}>{category.is_active ? t("TITLES.active") : t("TITLES.inactive")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => navigate(`/categories/form/${category.id}`)} className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-all"><Edit size={14} />{t("TITLES.edit", { count: "" as any })}</button>
            <Deleter url={`/categories/${category.id}`} onReload={() => navigate("/categories")} />
          </div>
        </div>
      </div>
      <div className="space-y-5 pb-8">
        <div className="rounded-2xl border border-border bg-panel overflow-hidden shadow-sm"><div className="px-6 py-5"><SectionHeading icon={Library} title={t("TITLES.translations")} /><div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-body border border-border rounded-lg"><div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center"><span className="text-xs font-bold text-blue-600">EN</span></div><span className="text-sm font-medium text-muted">{t("TITLES.english")}</span></div><p className="text-base font-medium text-text">{category.en?.name || "—"}</p></div>
          <div className="p-4 bg-body border border-border rounded-lg"><div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center"><span className="text-xs font-bold text-green-600">AR</span></div><span className="text-sm font-medium text-muted">{t("TITLES.arabic")}</span></div><p className="text-base font-medium text-text" dir="rtl">{category.ar?.name || "—"}</p></div>
        </div></div></div>
        <div className="rounded-2xl border border-border bg-panel overflow-hidden shadow-sm"><div className="px-6 py-5"><SectionHeading icon={CalendarDays} title={t("TITLES.metaInfo")} /><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><InfoCard label="ID">#{category.id}</InfoCard><InfoCard label={t("TITLES.createdAt")}>{formatDate(category.created_at)}</InfoCard><InfoCard label={t("TITLES.updatedAt")}>{formatDate(category.updated_at)}</InfoCard></div></div></div>
      </div>
    </div>
  );
}


