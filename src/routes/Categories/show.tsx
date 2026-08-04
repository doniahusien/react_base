import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BuildingLibraryIcon as Library, PencilIcon as Edit, CalendarDaysIcon as CalendarDays, FolderIcon as Folder, Squares2X2Icon as LayoutDashboard } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { Deleter } from "../../components/Shared/Deleter";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import type { Category } from "../../types/category";

function formatDate(iso: string | null | undefined): string { if (!iso) return "—"; return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
function InfoCard({ label, children }: { label: string; children: any }) { return <div className="rounded-xl border border-border bg-background p-4"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><div className="text-sm font-semibold text-foreground">{children}</div></div>; }
function SectionHeading({ icon: Icon, title }: { icon: any; title: string }) { return <div className="mb-4 flex items-center gap-2"><div className="flex size-7 items-center justify-center rounded-lg bg-primary/10"><Icon width={15} height={15} className="text-primary" /></div><h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3></div>; }

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
  if (!category) return <div className="space-y-3 p-6"><p className="font-semibold text-foreground">{t("TITLES.notFound")}</p><a href="/categories" className="text-sm text-primary hover:underline">← {t("TITLES.categories")}</a></div>;

  const displayName = category.name ?? category.en?.name ?? category.ar?.name ?? "—";

  return (
    <div className="space-y-0">
      <PageHeader
        title={displayName}
        translateTitle={false}
        subtitle={category.is_active ? t("TITLES.active") : t("TITLES.inactive")}
        translateSubtitle={false}
        icon={Folder}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "categories", href: "/categories", icon: Library },
          { label: displayName, icon: Folder }
        ]}
        rightActions={
          <>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays width={13} height={13} />
              {formatDate(category.created_at)}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => navigate(`/categories/form/${category.id}`)} className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-all">
                <Edit width={14} height={14} />{t("TITLES.edit", { count: "" as any })}
              </button>
              <Deleter url={`/categories/${category.id}`} onReload={() => navigate("/categories")} />
            </div>
          </>
        }
      />
      <div className="space-y-5 pb-8">
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"><div className="px-6 py-5"><SectionHeading icon={Library} title={t("TITLES.translations")} /><div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-background border border-border rounded-lg"><div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full bg-blue-soft flex items-center justify-center"><span className="text-xs font-bold text-blue">EN</span></div><span className="text-sm font-medium text-muted-foreground">{t("TITLES.english")}</span></div><p className="text-base font-medium text-foreground">{category.en?.name || "—"}</p></div>
          <div className="p-4 bg-background border border-border rounded-lg"><div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center"><span className="text-xs font-bold text-success-foreground">AR</span></div><span className="text-sm font-medium text-muted-foreground">{t("TITLES.arabic")}</span></div><p className="text-base font-medium text-foreground" dir="rtl">{category.ar?.name || "—"}</p></div>
        </div></div></div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"><div className="px-6 py-5"><SectionHeading icon={CalendarDays} title={t("TITLES.metaInfo")} /><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><InfoCard label="ID">#{category.id}</InfoCard><InfoCard label={t("TITLES.createdAt")}>{formatDate(category.created_at)}</InfoCard><InfoCard label={t("TITLES.updatedAt")}>{formatDate(category.updated_at)}</InfoCard></div></div></div>
      </div>
    </div>
  );
}


