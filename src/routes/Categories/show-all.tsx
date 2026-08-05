import { useEffect, useRef, useState } from "react";
import { BuildingLibraryIcon as Library, MagnifyingGlassIcon as Search, EllipsisHorizontalIcon as MoreHorizontal, Squares2X2Icon as LayoutDashboard, FunnelIcon as FilterIcon, CheckIcon as CheckSquare, AdjustmentsHorizontalIcon as SlidersHorizontal } from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { Filter, type FilterSection } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { Switcher } from "../../components/Shared/Switcher";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import type { Category, CategoryData } from "../../types/category";
import { useTranslation } from "react-i18next";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";
import type { TableColumn } from "../../components/UI/ModifyColumns";

function getQueryParams() { const p = new URLSearchParams(window.location.search); return { page: p.get("page") ?? "1", search: p.get("search") ?? "", is_active: p.get("is_active") ?? "" }; }
function formatDate(iso: string | null | undefined): string { if (!iso) return "—"; return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }

export default function CategoriesShowAll() {
  const { t } = useTranslation();
  const [data, setData] = useState<CategoryData>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const columns: TableColumn[] = [
    { index: 0, field: "image", header: t("TITLES.image") },
    { index: 1, field: "name", header: t("TITLES.name"), sortable: true },
    { index: 2, field: "status", header: t("TITLES.status") },
    { index: 3, field: "created_at", header: t("TITLES.createdAt"), sortable: true },
    { index: 4, field: "actions", header: t("TITLES.actions") },
  ];

  const filterSections: FilterSection[] = [
    { 
      key: "search", 
      label: t("TITLES.search", { count: 1 }),
      icon: Search,
      type: "text",
      placeholder: t("TITLES.search", { count: 1 }),
      defaultOpen: true
    },
    { 
      key: "is_active", 
      label: t("TITLES.status"),
      icon: CheckSquare,
      type: "radio",
      options: [
        { id: "1", label: t("TITLES.active") },
        { id: "0", label: t("TITLES.inactive") }
      ],
      defaultOpen: true
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const { page, search, is_active } = getQueryParams();
      const res = await api.get("categories", { params: { paginate: 1, page, search: search || undefined, "filters[is_active]": is_active || undefined } });
      setData(normalizeResponse<Category>(res.data, "categories"));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const onPop = () => fetchData(); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  useEffect(() => { const close = () => setActiveMenu(null); window.addEventListener("click", close); return () => window.removeEventListener("click", close); }, []);

  const renderCell = (field: string, item: Category, index: number) => {
    switch (field) {
      case "image": return item.image ? <ImagePreviewTrigger src={item.image} alt={item.name ?? ""} className="h-10 w-10 rounded-full border-2 border-border object-cover" wrapperClassName="rounded-full" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border  "><Library width={16} height={16} className="text-muted" /></div>;
      case "name": return <span className="text-sm font-medium text-text">{item.name ?? item.en?.name ?? item.ar?.name ?? "—"}</span>;
      case "created_at": return <span className="text-sm text-muted">{formatDate(item.created_at)}</span>;
      case "status": return <Switcher key={`status-${item.id}`} value={item.is_active} url={`/categories/${item.id}`} method="PUT" body={{ is_active: !item.is_active }} onReload={fetchData} />;
      case "actions": return (
        <div className="relative w-9 overflow-visible" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            ref={(el) => { buttonRefs.current[item.id] = el; }}
            onClick={() => setActiveMenu((cur) => (cur === item.id ? null : item.id))}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
          ><MoreHorizontal width={16} height={16} /></button>
          {activeMenu === item.id && <ActionsMenu anchorEl={buttonRefs.current[item.id]} data={item} showUrl={`/categories/${item.id}`} editUrl={`/categories/form/${item.id}`} deleteUrl={`/categories/${item.id}`} onReload={() => { setData((d) => ({ ...d, data: d.data.filter((c) => c.id !== item.id) })); setActiveMenu(null); }} />}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader 
        title="categories" 
        subtitle="categoryDesc" 
        icon={Library} 
        total={data.meta?.total ?? data.data.length} 
        addHref="/categories/form" 
        addLabel="category" 
        path={[
          { label: "home", href: "/", icon: LayoutDashboard }, 
          { label: "categories", icon: Library }
        ]} 
      />
      <UITable 
        data={data} 
        columns={columns} 
        title="categories" 
        loading={loading} 
        renderCell={renderCell} 
        filters={
          <Filter 
            sections={filterSections} 
            onApply={fetchData} 
            onClear={fetchData}
            triggerButton={
              <Button type="button" variant="primary">
                <SlidersHorizontal width={18} height={18} />
                <span>{t("TITLES.filters")}</span>
              </Button>
            }
          />
        }
      />
    </div>
  );
}


