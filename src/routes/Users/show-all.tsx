import { useEffect, useState } from "react";
import { Users, Search, Mail, Phone, MoreHorizontal, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { PageHeader } from "../../components/UI/PageHeader";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import type { User, UserData } from "../../types/user";
import { ImagePreviewTrigger } from "../../components/UI/ImagePreview";
import type { TableColumn } from "../../components/UI/ModifyColumns";

function getQueryParams() { const p = new URLSearchParams(window.location.search); return { page: p.get("page") ?? "1", keyword: p.get("keyword") ?? "" }; }

function Avatar({ src, name }: { src?: string; name?: string }) {
  const initials = (name || "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  if (src) return <ImagePreviewTrigger src={src} alt={name} className="h-10 w-10 rounded-full border-2 border-border object-cover" wrapperClassName="rounded-full" />;
  return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-primary/10 text-xs font-bold text-primary">{initials}</span>;
}

export default function UsersShowAll() {
  const { t } = useTranslation();
  const [data, setData] = useState<UserData>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const columns: TableColumn[] = [
    { index: 0, field: "name", header: t("TITLES.user") },
    { index: 1, field: "email", header: t("TITLES.email"), sortable: true },
    { index: 2, field: "phone", header: t("TITLES.phone") },
    { index: 3, field: "actions", header: t("TITLES.actions") },
  ];

  const filterItems: FilterItem[] = [{ type: "text", key: "keyword", placeholder: "users", prependInputIcon: Search as any }];

  const fetchData = async () => {
    try {
      setLoading(true);
      const { page, keyword } = getQueryParams();
      const res = await api.get("/users", { params: { paginate: 1, page, search: keyword || undefined } });
      setData(normalizeResponse<User>(res.data));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const onPop = () => fetchData(); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  useEffect(() => { const close = () => setActiveMenu(null); window.addEventListener("click", close); return () => window.removeEventListener("click", close); }, []);

  const renderCell = (field: string, item: User, index: number) => {
    switch (field) {
      case "name": return (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0"><Avatar src={item.image} name={item.full_name || item.name} /><span className="absolute -bottom-0.5 -inset-e-0.5 h-3 w-3 rounded-full border-2 border-body bg-green-500" /></div>
          <p className="text-sm font-medium text-text">{item.full_name}</p>
        </div>
      );
      case "email": return <div className="flex items-center gap-1.5"><Mail size={14} className="shrink-0 text-muted" /><a href={`mailto:${item.email}`} className="text-sm text-primary hover:opacity-80 transition-colors">{item.email}</a></div>;
      case "phone": return item.phone ? <a href={`tel:${item.phone_code}${item.phone}`} className="flex items-center gap-1.5"><Phone size={14} className="shrink-0 text-muted" /><bdo dir="ltr" className="text-sm text-text">+{item.phone_code} {item.phone}</bdo></a> : <span className="text-sm text-muted">—</span>;
      case "actions": return (
        <div className="relative w-9" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setActiveMenu((cur) => (cur === item.id ? null : item.id))} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-body text-muted hover:border-primary/50 hover:text-primary transition-all"><MoreHorizontal size={16} /></button>
          {activeMenu === item.id && <ActionsMenu data={item} showUrl={`/users/${item.id}`} editUrl={`/users/form/${item.id}`} deleteUrl={`/users/${item.id}`} onReload={() => { setData((d) => ({ ...d, data: d.data.filter((u) => u.id !== item.id) })); setActiveMenu(null); }} />}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="users" subtitle="userDesc" icon={Users} total={data.meta?.total ?? data.data.length} addHref="/users/form" addLabel="user" path={[{ label: "home", href: "/", icon: LayoutDashboard }, { label: "users", icon: Users }]} />
      <Filter items={filterItems} />
      <UITable data={data} columns={columns} title="users" loading={loading} renderCell={renderCell} />
    </div>
  );
}


