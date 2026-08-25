import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheckIcon as ShieldCheck,
  MagnifyingGlassIcon as Search,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  CheckIcon as Check,
  XMarkIcon as X,
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
import type { VerificationListItem } from "../../types/verifications";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

export default function VerificationsShowAll() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<VerificationListItem>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: string;
    anchor: HTMLElement;
  } | null>(null);

  const rowKey = (item: VerificationListItem) => `${item.type}-${item.id}`;

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "name", header: t("TITLES.name") },
      { index: 1, field: "type", header: t("TITLES.type") },
      { index: 2, field: "email", header: t("TITLES.email") },
      { index: 3, field: "phone", header: t("TITLES.phone") },
      { index: 4, field: "city", header: t("TITLES.city") },
      { index: 5, field: "license_number", header: t("TITLES.licenseNumber") },
      { index: 6, field: "verification_status", header: t("TITLES.verification") },
      { index: 7, field: "created_at", header: t("TITLES.createdAt") },
      { index: 8, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchVerifications"),
        prependInputIcon: Search as any,
      },
      {
        type: "radio",
        key: "type",
        label: t("TITLES.type"),
        options: [
          { id: "all", label: t("TITLES.all") },
          { id: "lawyer", label: t("TITLES.lawyer") },
          { id: "law_firm", label: t("TITLES.lawFirm") },
        ],
      },
      {
        type: "radio",
        key: "status",
        label: t("TITLES.status"),
        options: [
          { id: "active", label: t("STATUS.active") },
          { id: "suspended", label: t("STATUS.suspended") },
          { id: "pending", label: t("STATUS.pending") },
          { id: "approved", label: t("STATUS.approved") },
          { id: "rejected", label: t("STATUS.rejected") },
        ],
      },
    ],
    [t]
  );

  const page = searchParams.get("page") ?? "1";
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("verifications", {
        params: {
          page,
          type,
          search: search || undefined,
          status: status && status !== "all" ? status : undefined,
        },
      });
      setData(
        (() => {
          const normalized = normalizeResponse<VerificationListItem>(res.data);
          return {
            ...normalized,
            data: normalized.data.map((row, index) => ({
              ...row,
              _rowKey: `${row.type}-${row.id}-${index}`,
            })),
          };
        })()
      );
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadVerifications"), e?.response?.data?.message);
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, type, search, status, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const approve = async (item: VerificationListItem) => {
    try {
      const res = await api.put(`verifications/${item.id}/approve`, {
        type: item.type,
      });
      toast.success(t("MESSAGES.verificationApproved"), res.data?.message);
      setOpenMenu(null);
      fetchData();
    } catch (e: any) {
      toast.error(t("MESSAGES.verificationApproveFailed"), e?.response?.data?.message);
    }
  };

  const renderCell = (field: string, item: VerificationListItem) => {
    const key = rowKey(item);
    switch (field) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            <Avatar name={item.name} />
            <p className="text-sm font-medium text-foreground">
              {displayName(item.name)}
            </p>
          </div>
        );
      case "type":
        return (
          <span className="text-sm capitalize text-foreground">
            {item.type === "law_firm"
              ? t("TITLES.lawFirm")
              : item.type === "lawyer"
                ? t("TITLES.lawyer")
                : item.type || "—"}
          </span>
        );
      case "email":
        return item.email ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <Mail width={14} height={14} className="shrink-0 text-muted-foreground" />
            <a href={`mailto:${item.email}`} title={item.email} className="min-w-0 truncate text-sm text-primary hover:opacity-80">
              {item.email}
            </a>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "phone":
        return item.phone_number ? (
          <bdo dir="ltr" className="flex items-center gap-1.5 text-sm">
            <Phone width={14} height={14} className="text-muted-foreground" />
            {item.phone_number}
          </bdo>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "city":
        return (
          <span className="text-sm text-foreground">{item.city || "—"}</span>
        );
      case "license_number":
        return (
          <span className="text-sm text-foreground">
            {item.license_number || "—"}
          </span>
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
      case "created_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.created_at)}
          </span>
        );
      case "actions": {
        const isPending = item.verification_status === "pending";
        return (
          <div className="relative w-9 overflow-visible">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (openMenu?.id === key) {
                  setOpenMenu(null);
                  return;
                }
                setOpenMenu({ id: key, anchor: e.currentTarget });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
            >
              <MoreHorizontal width={16} height={16} />
            </button>
            {openMenu?.id === key && (
              <ActionsMenu
                anchorEl={openMenu.anchor}
                data={item}
                showUrl={`/verifications/${item.type}/${item.id}`}
                onClose={() => setOpenMenu(null)}
                onReload={() => {
                  setOpenMenu(null);
                  fetchData();
                }}
              >
                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => approve(item)}
                      className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-foreground hover:bg-muted"
                    >
                      <span className="action-btn primary">
                        <Check className="size-4" />
                      </span>
                      {t("ACTIONS.approve")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        navigate(`/verifications/${item.type}/${item.id}?reject=1`);
                      }}
                      className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-foreground hover:bg-muted"
                    >
                      <span className="action-btn">
                        <X className="size-4" />
                      </span>
                      {t("ACTIONS.reject")}
                    </button>
                  </>
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
        title="verifications"
        subtitle="verificationsDesc"
        icon={ShieldCheck}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "verifications", icon: ShieldCheck },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="verifications"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
