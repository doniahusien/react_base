import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TicketIcon as Ticket,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  PlusIcon as Plus,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { GenerateCodesModal } from "../../components/Shared/GenerateCodesModal";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import {
  StatusBadge,
  displayName,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { buildDynamicFilterItems } from "../../lib/buildDynamicFilters";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import type { DiscountCode } from "../../types/codes";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

export default function CodesShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<DiscountCode>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "code", header: t("TITLES.code") },
      { index: 1, field: "discount_percentage", header: t("TITLES.discount") },
      { index: 2, field: "status", header: t("TITLES.status") },
      { index: 3, field: "generated_at", header: t("TITLES.generatedAt") },
      { index: 4, field: "used_at", header: t("TITLES.usedAt") },
      { index: 5, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems = useMemo(
    () =>
      buildDynamicFilterItems(t, data.meta?.filters, {
        placeholder: t("LABELS.searchCodes"),
        prependInputIcon: Search as any,
      }),
    [t, data.meta?.filters]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("codes", {
        params: {
          page,
          search: search || undefined,
          status: status || undefined,
          per_page: 25,
        },
      });
      setData(normalizeResponse<DiscountCode>(res.data, "codes"));
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadCodes"), e?.response?.data?.message);
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, status, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("MESSAGES.copied"));
    } catch {
      toast.error(t("MESSAGES.copyFailed"));
    }
  };

  const renderCell = (field: string, item: DiscountCode) => {
    switch (field) {
      case "code":
        return (
          <button
            type="button"
            onClick={() => copyCode(item.code)}
            className="font-mono text-sm font-semibold tracking-wide text-primary hover:underline"
            title={t("ACTIONS.copy")}
          >
            {item.code}
          </button>
        );
      case "discount_percentage":
        return (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {item.discount_percentage != null
              ? `${item.discount_percentage}%`
              : "—"}
          </span>
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
      case "generated_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.generated_at)}
          </span>
        );
      case "used_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.used_at)}
          </span>
        );
      case "generated_by":
        return (
          <span className="text-sm text-foreground">
            {displayName(
              item.generated_by?.name || item.generated_by?.full_name
            )}
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
                showUrl={`/codes/${item.id}`}
                deleteUrl={`codes/${item.id}`}
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
        title="codes"
        subtitle="codesDesc"
        icon={Ticket}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "codes", icon: Ticket },
        ]}
        rightActions={
          <Button type="button" onClick={() => setModalOpen(true)}>
            <Plus width={16} height={16} />
            {t("TITLES.generateCodes")}
          </Button>
        }
      />
      <UITable
        data={data}
        columns={columns}
        title="codes"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
      <GenerateCodesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGenerated={fetchData}
      />
    </div>
  );
}
