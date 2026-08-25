import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  EnvelopeIcon as Mail,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  PhoneIcon as Phone,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { PageHeader } from "../../components/UI/PageHeader";
import {
  Avatar,
  StatusBadge,
  displayName,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import type { Contact } from "../../types/contacts";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

export default function ContactsShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<Contact>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "name", header: t("TITLES.name") },
      { index: 1, field: "subject", header: t("TITLES.subject") },
      { index: 2, field: "is_read", header: t("TITLES.status") },
      { index: 3, field: "created_at", header: t("TITLES.createdAt") },
      { index: 4, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchContacts"),
        prependInputIcon: Search as any,
      },
      {
        type: "radio",
        key: "is_read",
        label: t("TITLES.status"),
        options: [
          { id: "0", label: t("STATUS.unread") },
          { id: "1", label: t("STATUS.read") },
        ],
      },
    ],
    [t]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const isRead = searchParams.get("is_read") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("contacts", {
        params: {
          page,
          search: search || undefined,
          is_read: isRead !== "" ? isRead : undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<Contact>(res.data));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadContacts"),
        e?.response?.data?.message
      );
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, isRead, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderCell = (field: string, item: Contact) => {
    switch (field) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            <Avatar name={item.name} />
            <div className="min-w-0">
              <p
                className={`text-sm text-foreground ${
                  item.is_read ? "font-medium" : "font-semibold"
                }`}
              >
                {displayName(item.name)}
              </p>
              {item.email ? (
                <a
                  href={`mailto:${item.email}`}
                  className="flex items-center gap-1 truncate text-xs text-primary hover:opacity-80"
                >
                  <Mail width={12} height={12} className="shrink-0" />
                  {item.email}
                </a>
              ) : null}
              {item.phone ? (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone width={12} height={12} className="shrink-0" />
                  <bdo dir="ltr">{item.phone}</bdo>
                </div>
              ) : null}
            </div>
          </div>
        );
      case "subject":
        return (
          <p
            className={`max-w-sm truncate text-sm ${
              item.is_read
                ? "font-normal text-muted-foreground"
                : "font-medium text-foreground"
            }`}
            title={item.subject ?? undefined}
          >
            {item.subject || "—"}
          </p>
        );
      case "is_read":
        return (
          <StatusBadge
            status={item.is_read ? "read" : "unread"}
            label={item.is_read ? t("STATUS.read") : t("STATUS.unread")}
          />
        );
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
                showUrl={`/contacts/${item.id}`}
                deleteUrl={`contacts/${item.id}`}
                onReload={fetchData}
                onClose={() => setOpenMenu(null)}
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
        title="contacts"
        subtitle="contactsDesc"
        icon={Mail}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "contacts", icon: Mail },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="contacts"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
