import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  GlobeAltIcon as Globe,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { Switcher } from "../../components/Shared/Switcher";
import { PageHeader } from "../../components/UI/PageHeader";
import { formatDate } from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { mediaUrl } from "../../lib/mediaUrl";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { Country } from "../../types/countries";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

export default function CountriesShowAll() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<Country>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "flag", header: t("TITLES.flag") },
      { index: 1, field: "name", header: t("TITLES.name") },
      { index: 2, field: "code", header: t("TITLES.code") },
      { index: 3, field: "phone_code", header: t("TITLES.phoneCode") },
      { index: 4, field: "phone_length", header: t("TITLES.phoneLimit") },
      { index: 5, field: "is_active", header: t("TITLES.status") },
      { index: 6, field: "created_at", header: t("TITLES.createdAt") },
      { index: 7, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchCountries"),
        prependInputIcon: Search as any,
      },
      {
        type: "radio",
        key: "is_active",
        label: t("TITLES.status"),
        options: [
          { id: "1", label: t("STATUS.active") },
          { id: "0", label: t("STATUS.inactive") },
        ],
      },
    ],
    [t]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const isActive = searchParams.get("is_active") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("countries", {
        params: {
          page,
          search: search || undefined,
          is_active: isActive !== "" ? isActive : undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<Country>(res.data));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadCountries"),
        e?.response?.data?.message
      );
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, isActive, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayName = (item: Country) =>
    lang === "ar"
      ? item.name_ar || item.name_en || item.name || "—"
      : item.name_en || item.name_ar || item.name || "—";

  const renderCell = (field: string, item: Country) => {
    switch (field) {
      case "flag": {
        const src = mediaUrl(item.flag) ?? item.flag;
        return src ? (
          <img
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            className="h-7 w-10 rounded-md object-cover ring-1 ring-border"
          />
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      }
      case "name":
        return (
          <Link
            to={`/countries/${item.id}`}
            className="min-w-0 block hover:text-primary"
          >
            <p className="truncate text-sm font-medium text-foreground hover:text-primary">
              {displayName(item)}
            </p>
            {item.phone_starts_with && (
              <p className="truncate text-xs text-muted-foreground">
                {t("TITLES.phoneStartsWith")}: {item.phone_starts_with}
              </p>
            )}
          </Link>
        );
      case "code":
        return (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {item.code || "—"}
          </span>
        );
      case "phone_code":
        return (
          <span className="text-sm tabular-nums text-foreground" dir="ltr">
            {item.phone_code || "—"}
          </span>
        );
      case "phone_length":
        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            {item.phone_length ?? "—"}
          </span>
        );
      case "is_active": {
        const flag = item.flag ?? "";
        const marker = "/uploads/";
        const idx = flag.indexOf(marker);
        const flagPath = idx >= 0 ? flag.slice(idx + 1) : flag;
        return (
          <Switcher
            value={!!item.is_active}
            url={`countries/${item.id}`}
            method="PUT"
            body={{
              name_ar: item.name_ar,
              name_en: item.name_en,
              code: item.code,
              phone_code: item.phone_code,
              phone_length: item.phone_length,
              phone_starts_with: item.phone_starts_with,
              flag: flagPath || null,
              is_active: !item.is_active,
            }}
            onReload={fetchData}
          />
        );
      }
      case "created_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.created_at)}
          </span>
        );
      case "actions":
        return (
          <div className="relative w-9 overflow-visible">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (openMenu?.id === item.id) {
                  setOpenMenu(null);
                  return;
                }
                setOpenMenu({ id: item.id, anchor: e.currentTarget });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
            >
              <MoreHorizontal width={16} height={16} />
            </button>
            {openMenu?.id === item.id && (
              <ActionsMenu
                anchorEl={openMenu.anchor}
                data={item}
                showUrl={`/countries/${item.id}`}
                editUrl={`/countries/${item.id}/edit`}
                deleteUrl={`countries/${item.id}`}
                onClose={() => setOpenMenu(null)}
                onReload={() => {
                  setOpenMenu(null);
                  fetchData();
                }}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="countries"
        subtitle="countryDesc"
        icon={Globe}
        total={data.meta?.total ?? data.data.length}
        addHref="/countries/create"
        addLabel="country"
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "countries", icon: Globe },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="countries"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
