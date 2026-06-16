import { useEffect, useState } from "react";
import { Earth, Search, Phone, MoreHorizontal, LayoutDashboard } from "lucide-react";
import { PageHeader } from "../../components/UI/PageHeader";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { Switcher } from "../../components/Shared/Switcher";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import type { Country, CountryData } from "../../types/country";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";
import type { TableColumn } from "../../components/UI/ModifyColumns";

function getQueryParams() { const p = new URLSearchParams(window.location.search); return { page: p.get("page") ?? "1", keyword: p.get("keyword") ?? "" }; }

export default function CountriesShowAll() {
  const { t } = useTranslation();
  const [data, setData] = useState<CountryData>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const columns: TableColumn[] = [
    { index: 0, field: "index", header: "#" },
    { index: 1, field: "flag", header: t("TITLES.flag") as ReactNode },
    { index: 2, field: "name", header: t("TITLES.name") as ReactNode, sortable: true },
    { index: 3, field: "phone_code", header: t("TITLES.phoneCode") as ReactNode },
    { index: 4, field: "phone_length", header: t("TITLES.phoneLimit") as ReactNode },
    { index: 5, field: "currency", header: t("TITLES.Currency") as ReactNode },
    { index: 6, field: "status", header: t("TITLES.status") as ReactNode },
    { index: 7, field: "actions", header: t("TITLES.actions") as ReactNode },
  ];

  const filterItems: FilterItem[] = [{ type: "text", key: "keyword", placeholder: "country", prependInputIcon: Search as any }];

  const fetchData = async () => {
    try {
      setLoading(true);
      const { page, keyword } = getQueryParams();
      const res = await api.get("countries", { params: { paginate: 1, page, search: keyword || undefined } });
      setData(normalizeResponse<Country>(res.data, "countries"));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const onPop = () => fetchData(); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  useEffect(() => { const close = () => setActiveMenu(null); const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(); window.addEventListener("click", close); window.addEventListener("keydown", onKey); return () => { window.removeEventListener("click", close); window.removeEventListener("keydown", onKey); }; }, []);

  const renderCell = (field: string, item: Country, index: number) => {
    switch (field) {
      case "index": return <span className="text-sm text-app-muted">#{index + 1}</span>;
      case "flag": return item.flag ? <ImagePreviewTrigger src={item.flag} alt={item.name} className="h-8 w-12 rounded-lg border border-border object-cover" wrapperClassName="rounded-lg" /> : <div className="flex h-8 w-12 items-center justify-center rounded-lg border border-border bg-slate-50 dark:bg-slate-800"><Earth size={16} className="text-app-muted" /></div>;
      case "name": return <span className="text-sm font-medium text-text">{item.name}</span>;
      case "phone_code": return <div className="flex items-center gap-1.5"><Phone size={13} className="text-app-muted" /><span className="text-sm text-text">+{item.phone_code}</span></div>;
      case "phone_length": return <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-text">{item.phone_length} {t("TITLES.digits")}</span>;
      case "currency": return <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-text">{item.currency ?? "—"}</span>;
      case "status": return <Switcher key={`status-${item.id}`} value={item.is_active} url={`/countries/${item.id}`} method="PUT" body={{ is_active: !item.is_active }} onReload={fetchData} />;
      case "actions": return (
        <div className="relative w-9" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setActiveMenu((cur) => (cur === item.id ? null : item.id))} className="flex size-9 items-center justify-center rounded-full border border-border bg-body text-app-muted hover:border-purple-400 hover:text-purple-600 transition-all"><MoreHorizontal size={16} /></button>
          {activeMenu === item.id && <ActionsMenu data={item} editUrl={`/countries/form/${item.id}`} deleteUrl={`/countries/${item.id}`} onReload={() => { setData((d) => ({ ...d, data: d.data.filter((c) => c.id !== item.id) })); setActiveMenu(null); }} />}
        </div>
      );
      default: return null;
    }
  };

  const renderQuickView = (item: Country) => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {item.flag ? <ImagePreviewTrigger src={item.flag} alt="flag" className="h-14 w-20 rounded-2xl border border-border object-cover" wrapperClassName="rounded-2xl" /> : <div className="flex h-14 w-20 items-center justify-center rounded-2xl border border-border bg-slate-50"><Earth size={28} className="text-app-muted" /></div>}
        <div><h2 className="text-lg font-bold text-text">{item.en?.name ?? item.name}</h2>{item.ar?.name && <p className="text-sm text-app-muted" dir="rtl">{item.ar.name}</p>}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border p-4">
        {[{ label: "Phone Code", value: `+${item.phone_code}` }, { label: "Phone Limit", value: `${item.phone_length} digits` }, { label: "Status", value: item.is_active ? "Active" : "Inactive" }, { label: "ID", value: String(item.id) }].map(({ label, value }) => (
          <div key={label}><p className="text-xs font-semibold uppercase tracking-wide text-app-muted mb-0.5">{label}</p><p className="text-sm text-text">{value}</p></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="countries" subtitle="countryDesc" icon={Earth} total={data.meta?.total ?? data.data.length} addHref="/countries/form" addLabel="country" path={[{ label: "home", href: "/", icon: LayoutDashboard }, { label: "countries", icon: Earth }]} />
      <Filter items={filterItems} />
      <UITable data={data} columns={columns} title="countries" loading={loading} renderCell={renderCell} renderQuickView={renderQuickView} />
    </div>
  );
}


