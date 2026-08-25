import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BanknotesIcon as Banknotes,
  MagnifyingGlassIcon as Search,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
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
import type { Payment } from "../../types/payments";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

function formatAmount(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function PaymentsShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<Payment>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "user", header: t("TITLES.user") },
      { index: 1, field: "amount", header: t("TITLES.amount") },
      { index: 2, field: "status", header: t("TITLES.status") },
      { index: 3, field: "payment_gateway", header: t("TITLES.paymentGateway") },
      { index: 4, field: "gateway_transaction_id", header: t("TITLES.transactionId") },
      { index: 5, field: "subscription_id", header: t("TITLES.subscription") },
      { index: 6, field: "paid_at", header: t("TITLES.paidAt") },
      { index: 7, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const statusOptions = useMemo(() => {
    const fromApi = data.meta?.available_statuses;
    const statuses =
      fromApi && fromApi.length
        ? fromApi
        : ["initiated", "success", "failed", "refunded"];
    return statuses.map((status) => ({
      id: status,
      label: t(`STATUS.${status}`, { defaultValue: status.replace(/_/g, " ") }),
    }));
  }, [data.meta?.available_statuses, t]);

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchPayments"),
        prependInputIcon: Search as any,
      },
      {
        type: "radio",
        key: "status",
        label: t("TITLES.status"),
        options: statusOptions,
      },
    ],
    [t, statusOptions]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("payments", {
        params: {
          page,
          search: search || undefined,
          status: status || undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<Payment>(res.data));
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadPayments"), e?.response?.data?.message);
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, status, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderCell = (field: string, item: Payment) => {
    switch (field) {
      case "user":
        return (
          <div className="flex items-center gap-3">
            <Avatar name={item.user?.full_name} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {displayName(item.user?.full_name)}
              </p>
              {item.user?.email ? (
                <a
                  href={`mailto:${item.user.email}`}
                  className="flex items-center gap-1 truncate text-xs text-primary hover:opacity-80"
                >
                  <Mail width={12} height={12} className="shrink-0" />
                  {item.user.email}
                </a>
              ) : null}
              {item.user?.phone ? (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone width={12} height={12} />
                  <bdo dir="ltr">{item.user.phone}</bdo>
                </div>
              ) : null}
            </div>
          </div>
        );
      case "amount":
        return (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatAmount(item.amount)}
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
      case "payment_gateway":
        return (
          <span className="text-sm text-foreground">
            {item.payment_gateway || "—"}
          </span>
        );
      case "gateway_transaction_id":
        return (
          <span className="font-mono text-xs text-muted-foreground">
            {item.gateway_transaction_id || "—"}
          </span>
        );
      case "subscription_id":
        return item.subscription_name ? (
          <span className="inline-flex max-w-44 items-center rounded-md bg-primary/10 px-2 py-1 text-start text-[11px] font-semibold leading-snug text-primary ring-1 ring-inset ring-primary/20">
            {item.subscription_name}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "paid_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.paid_at)}
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
                showUrl={`/payments/${item.id}`}
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
        title="payments"
        subtitle="paymentsDesc"
        icon={Banknotes}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "payments", icon: Banknotes },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="payments"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
