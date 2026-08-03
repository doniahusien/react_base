import { useEffect, useRef, useState } from "react";
import { GlobeAltIcon as Earth, MagnifyingGlassIcon as Search, PhoneIcon as Phone, EllipsisHorizontalIcon as MoreHorizontal, Squares2X2Icon as LayoutDashboard } from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Filter, type FilterSection } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { Switcher } from "../../components/Shared/Switcher";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { InlineAddRow } from "../../components/UI/InlineAddRow";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import type { Country, CountryData } from "../../types/country";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import { showToast } from "../../stores/toast";

function getQueryParams() { const p = new URLSearchParams(window.location.search); return { page: p.get("page") ?? "1", keyword: p.get("keyword") ?? "" }; }

export default function CountriesShowAll() {
  const { t } = useTranslation();
  const [data, setData] = useState<CountryData>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const anchorRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const columns: TableColumn[] = [
    { index: 0, field: "flag", header: t("TITLES.flag") as ReactNode },
    { index: 1, field: "name", header: t("TITLES.name") as ReactNode, sortable: true },
    { index: 2, field: "phone_code", header: t("TITLES.phoneCode") as ReactNode },
    { index: 3, field: "phone_length", header: t("TITLES.phoneLimit") as ReactNode },
    { index: 4, field: "currency", header: t("TITLES.Currency") as ReactNode },
    { index: 5, field: "status", header: t("TITLES.status") as ReactNode },
    { index: 6, field: "actions", header: t("TITLES.actions") as ReactNode },
  ];

  const filterSections: FilterSection[] = [
    { 
      key: "keyword", 
      label: t("TITLES.search", { count: 1 }),
      icon: Search,
      type: "text",
      placeholder: t("TITLES.search", { count: 1 }),
      defaultOpen: true
    }
  ];

  const inlineAddFields = [
    { key: "name_en", label: t("FIELDS.name_en"), type: "text" as const, placeholder: "Enter English name", required: true },
    { key: "name_ar", label: t("FIELDS.name_ar"), type: "text" as const, placeholder: "Enter Arabic name", required: true },
    { key: "phone_code", label: t("FIELDS.phone_code"), type: "number" as const, placeholder: "e.g. 966", required: true },
    { key: "phone_length", label: t("FIELDS.phone_length"), type: "number" as const, placeholder: "e.g. 9", required: true },
    { key: "currency_en", label: t("FIELDS.currency_en"), type: "text" as const, placeholder: "e.g. SAR" },
    { key: "currency_ar", label: t("FIELDS.currency_ar"), type: "text" as const, placeholder: "e.g. ريال" },
    { key: "estimated_arrival_days", label: t("FIELDS.estimated_arrival_days"), type: "number" as const, placeholder: "e.g. 7" },
    { key: "flag", label: t("FIELDS.flag"), type: "file" as const },
  ];

  const handleInlineAdd = async (formData: Record<string, any>) => {
    const payload = new FormData();
    
    // Add text fields
    payload.append("name[en]", formData.name_en || "");
    payload.append("name[ar]", formData.name_ar || "");
    payload.append("phone_code", formData.phone_code || "");
    payload.append("phone_length", formData.phone_length || "");
    
    if (formData.currency_en) payload.append("currency[en]", formData.currency_en);
    if (formData.currency_ar) payload.append("currency[ar]", formData.currency_ar);
    if (formData.estimated_arrival_days) payload.append("estimated_arrival_days", formData.estimated_arrival_days);
    if (formData.flag) payload.append("flag", formData.flag);
    
    try {
      await api.post("countries", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      showToast({ type: "success", message: t("MESSAGES.createdSuccess") });
      fetchData();
    } catch (error) {
      showToast({ type: "error", message: t("MESSAGES.createFailed") });
      throw error;
    }
  };

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
      case "flag": return item.flag ? <ImagePreviewTrigger src={item.flag} alt={item.name} className="h-8 w-12 rounded-lg border border-border object-cover" wrapperClassName="rounded-lg" /> : <div className="flex h-8 w-12 items-center justify-center rounded-lg border border-border  "><Earth width={16} height={16} className="text-muted" /></div>;
      case "name": return <span className="text-sm font-medium text-text">{item.name}</span>;
      case "phone_code": return <div className="flex items-center gap-1.5"><Phone width={13} height={13} className="text-muted" /><span className="text-sm text-text">+{item.phone_code}</span></div>;
      case "phone_length": return <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-text">{item.phone_length} {t("TITLES.digits")}</span>;
      case "currency": return <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-text">{item.currency ?? "—"}</span>;
      case "status": return <Switcher key={`status-${item.id}`} value={item.is_active} url={`/countries/${item.id}`} method="PUT" body={{ is_active: !item.is_active }} onReload={fetchData} />;
      case "actions": return (
        <div className="relative w-9 overflow-visible" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            ref={(el) => { anchorRefs.current[String(item.id)] = el; }}
            onClick={() => setActiveMenu((cur) => (cur === item.id ? null : item.id))}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
          ><MoreHorizontal width={16} height={16} /></button>
          {activeMenu === item.id && <ActionsMenu anchorEl={anchorRefs.current[String(item.id)]} data={item} editUrl={`/countries/form/${item.id}`} deleteUrl={`/countries/${item.id}`} onReload={() => { setData((d) => ({ ...d, data: d.data.filter((c) => c.id !== item.id) })); setActiveMenu(null); }} />}
        </div>
      );
      default: return null;
    }
  };

  const renderQuickView = (item: Country) => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {item.flag ? <ImagePreviewTrigger src={item.flag} alt="flag" className="h-14 w-20 rounded-2xl border border-border object-cover" wrapperClassName="rounded-2xl" /> : <div className="flex h-14 w-20 items-center justify-center rounded-2xl border border-border  "><Earth width={28} height={28} className="text-muted-foreground" /></div>}
        <div><h2 className="text-lg font-bold text-foreground">{item.en?.name ?? item.name}</h2>{item.ar?.name && <p className="text-sm text-muted-foreground" dir="rtl">{item.ar.name}</p>}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border p-4">
        {[{ label: "Phone Code", value: `+${item.phone_code}` }, { label: "Phone Limit", value: `${item.phone_length} digits` }, { label: "Status", value: item.is_active ? "Active" : "Inactive" }, { label: "ID", value: String(item.id) }].map(({ label, value }) => (
          <div key={label}><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p><p className="text-sm text-foreground">{value}</p></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="countries" subtitle="countryDesc" icon={Earth} total={data.meta?.total ?? data.data.length} addHref="/countries/form" addLabel="country" path={[{ label: "home", href: "/", icon: LayoutDashboard }, { label: "countries", icon: Earth }]} />
      
      {/* Inline Add Row */}
      <InlineAddRow fields={inlineAddFields} onSave={handleInlineAdd} />
      
      <UITable data={data} columns={columns} title="countries" loading={loading} renderCell={renderCell} renderQuickView={renderQuickView} />
    </div>
  );
}


