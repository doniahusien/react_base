import { useEffect, useRef, useState } from "react";
import { GlobeAltIcon as Earth, MagnifyingGlassIcon as Search, EllipsisHorizontalIcon as MoreHorizontal, Squares2X2Icon as LayoutDashboard } from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { Switcher } from "../../components/Shared/Switcher";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import type { City, CityData } from "../../types/city";
import { useTranslation } from "react-i18next";
import type { TableColumn } from "../../components/UI/ModifyColumns";

function getQueryParams() { const p = new URLSearchParams(window.location.search); return { page: p.get("page") ?? "1", keyword: p.get("keyword") ?? "" }; }

export default function CitiesShowAll() {
  const { t } = useTranslation();
  const [data, setData] = useState<CityData>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const anchorRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const columns: TableColumn[] = [
    { index: 0, field: "name", header: t("TITLES.name"), sortable: true },
    { index: 1, field: "created_at", header: t("TITLES.created_at"), sortable: true },
    { index: 2, field: "status", header: t("TITLES.status") },
    { index: 3, field: "actions", header: t("TITLES.actions") },
  ];

  const filterItems: FilterItem[] = [{ type: "text", key: "keyword", placeholder: "city", prependInputIcon: Search as any }];

  const fetchData = async () => {
    try {
      setLoading(true);
      const { page, keyword } = getQueryParams();
      const res = await api.get("cities", { params: { paginate: 1, page, search: keyword || undefined } });
      setData(normalizeResponse<City>(res.data, "cities"));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const onPop = () => fetchData(); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  useEffect(() => { const close = () => setActiveMenu(null); window.addEventListener("click", close); return () => window.removeEventListener("click", close); }, []);

  const renderCell = (field: string, item: City, index: number) => {
    switch (field) {
      case "name": return <span className="text-sm font-medium text-text">{item.name}</span>;
      case "created_at": return <span className="text-sm text-muted">{new Date(item.created_at).toLocaleDateString()}</span>;
      case "status": return <Switcher key={`status-${item.id}`} value={item.is_active} url={`/cities/${item.id}`} method="PUT" body={{ is_active: !item.is_active }} onReload={fetchData} />;
      case "actions": return (
        <div className="relative w-9 overflow-visible" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            ref={(el) => { anchorRefs.current[String(item.id)] = el; }}
            onClick={() => setActiveMenu((cur) => (cur === item.id ? null : item.id))}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:border-accent hover:text-primary transition-all"
          ><MoreHorizontal width={16} height={16} /></button>
          {activeMenu === item.id && <ActionsMenu anchorEl={anchorRefs.current[String(item.id)]} data={item} editUrl={`/cities/form/${item.id}`} deleteUrl={`/cities/${item.id}`} onReload={() => { setData((d) => ({ ...d, data: d.data.filter((c) => c.id !== item.id) })); setActiveMenu(null); }} />}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="cities" subtitle="cityDesc" icon={Earth} total={data.meta?.total ?? data.data.length} addHref="/cities/form" addLabel="city" path={[{ label: "home", href: "/", icon: LayoutDashboard }, { label: "cities", icon: Earth }]} />
      <Filter items={filterItems} />
      <UITable data={data} columns={columns} title="cities" loading={loading} renderCell={renderCell} />
    </div>
  );
}


