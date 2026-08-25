import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ScaleIcon as Scale,
  MagnifyingGlassIcon as Search,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  ArrowPathIcon as Restore,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter } from "../../components/Filter/Filter";
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
import { buildDynamicFilterItems } from "../../lib/buildDynamicFilters";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import type { LawyerListItem } from "../../types/accounts";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

export default function LawyersShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<LawyerListItem>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "full_name", header: t("TITLES.name") },
      { index: 1, field: "email", header: t("TITLES.email"), sortable: true },
      { index: 2, field: "phone", header: t("TITLES.phone") },
      { index: 3, field: "status", header: t("TITLES.status") },
      { index: 4, field: "verification_status", header: t("TITLES.verification") },
      { index: 5, field: "membership_type", header: t("TITLES.membership") },
      { index: 6, field: "joined_at", header: t("TITLES.joinedAt") },
      { index: 7, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems = useMemo(
    () =>
      buildDynamicFilterItems(t, data.meta?.filters, {
        placeholder: t("LABELS.searchLawyers"),
        prependInputIcon: Search as any,
      }),
    [t, data.meta?.filters]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const verificationStatus = searchParams.get("verification_status") ?? "";
  const membershipType = searchParams.get("membership_type") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("lawyers", {
        params: {
          page,
          search: search || undefined,
          status: status || undefined,
          verification_status: verificationStatus || undefined,
          membership_type: membershipType || undefined,
        },
      });
      setData(normalizeResponse<LawyerListItem>(res.data));
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadLawyers"), e?.response?.data?.message);
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, status, verificationStatus, membershipType, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const restore = async (id: number) => {
    try {
      const res = await api.put(`lawyers/${id}/restore`);
      toast.success(t("MESSAGES.restoredSuccess"), res.data?.message);
      setOpenMenu(null);
      fetchData();
    } catch (e: any) {
      toast.error(t("MESSAGES.restoreFailed"), e?.response?.data?.message);
    }
  };

  const renderCell = (field: string, item: LawyerListItem) => {
    switch (field) {
      case "full_name":
        return (
          <div className="flex items-center gap-3">
            <Avatar name={item.full_name} />
            <p className="text-sm font-medium text-foreground">
              {displayName(item.full_name)}
            </p>
          </div>
        );
      case "email":
        return item.email ? (
          <div className="flex items-center gap-1.5">
            <Mail width={14} height={14} className="shrink-0 text-muted-foreground" />
            <a href={`mailto:${item.email}`} className="text-sm text-primary hover:opacity-80">
              {item.email}
            </a>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "phone":
        return item.phone ? (
          <bdo dir="ltr" className="flex items-start gap-1.5 text-sm">
            <Phone width={14} height={14} className="text-muted-foreground" />
            {item.phone}
          </bdo>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "status":
        return (
          <StatusBadge
            status={item.status}
            label={
              item.status
                ? t(`STATUS.${item.status}`, {
                    defaultValue: item.status.replace(/_/g, " "),
                  })
                : undefined
            }
          />
        );
      case "verification_status":
        return (
          <StatusBadge
            status={item.verification_status}
            label={
              item.verification_status
                ? t(`STATUS.${item.verification_status}`, {
                    defaultValue: item.verification_status.replace(/_/g, " "),
                  })
                : undefined
            }
          />
        );
      case "membership_type":
        return item.membership_type ? (
          <span className="text-sm capitalize text-foreground">
            {t(`STATUS.${item.membership_type}`, {
              defaultValue: item.membership_type,
            })}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "joined_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.joined_at)}
          </span>
        );
      case "actions": {
        const isSuspended = item.status === "suspended";
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
                showUrl={`/lawyers/${item.id}`}
                deleteUrl={!isSuspended ? `lawyers/${item.id}` : undefined}
                deleteLabel={t("ACTIONS.suspend")}
                onClose={() => setOpenMenu(null)}
                onReload={() => {
                  setOpenMenu(null);
                  fetchData();
                }}
              >
                {isSuspended && (
                  <button
                    type="button"
                    onClick={() => restore(item.id)}
                    className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-foreground hover:bg-muted"
                  >
                    <span className="action-btn primary">
                      <Restore className="size-4" />
                    </span>
                    {t("ACTIONS.restore")}
                  </button>
                )}
              </ActionsMenu>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="lawyers"
        subtitle="lawyersDesc"
        icon={Scale}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "lawyers", icon: Scale },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="lawyers"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
