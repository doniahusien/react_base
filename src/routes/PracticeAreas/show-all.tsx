import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpenIcon as BookOpen,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  PencilIcon as Pencil,
  PlusIcon as Plus,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { Switcher } from "../../components/Shared/Switcher";
import { CatalogFormModal } from "../../components/Shared/CatalogFormModal";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { formatDate } from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { PracticeArea } from "../../types/catalog";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

export default function PracticeAreasShowAll() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<PracticeArea>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PracticeArea | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "name", header: t("TITLES.name") },
      { index: 1, field: "is_active", header: t("TITLES.status") },
      { index: 2, field: "created_at", header: t("TITLES.createdAt") },
      { index: 3, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchPracticeAreas"),
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
      const res = await api.get("practice-areas", {
        params: {
          page,
          search: search || undefined,
          is_active: isActive !== "" ? isActive : undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<PracticeArea>(res.data));
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadPracticeAreas"), e?.response?.data?.message);
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, isActive, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: PracticeArea) => {
    setEditing(item);
    setModalOpen(true);
    setOpenMenu(null);
  };

  const displayName = (item: PracticeArea) =>
    lang === "ar" ? item.name_ar || item.name_en : item.name_en || item.name_ar;

  const renderCell = (field: string, item: PracticeArea) => {
    switch (field) {
      case "name":
        return (
          <p className="text-sm font-medium text-foreground">{displayName(item)}</p>
        );
      case "is_active":
        return (
          <Switcher
            value={!!item.is_active}
            url={`practice-areas/${item.id}`}
            method="PUT"
            body={{
              name_ar: item.name_ar,
              name_en: item.name_en,
              is_active: !item.is_active,
            }}
            onReload={fetchData}
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
                deleteUrl={`practice-areas/${item.id}`}
                onClose={() => setOpenMenu(null)}
                onReload={() => {
                  setOpenMenu(null);
                  fetchData();
                }}
              >
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-primary hover:bg-primary/10"
                >
                  <span className="action-btn primary">
                    <Pencil className="size-4" />
                  </span>
                  {t("ACTIONS.edit")}
                </button>
              </ActionsMenu>
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
        title="practiceAreas"
        subtitle="practiceAreasDesc"
        icon={BookOpen}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "practiceAreas", icon: BookOpen },
        ]}
        rightActions={
          <Button type="button" onClick={openCreate}>
            <Plus width={16} height={16} />
            {t("TITLES.add", { count: t("TITLES.practiceArea") })}
          </Button>
        }
      />
      <UITable
        data={data}
        columns={columns}
        title="practiceAreas"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
      <CatalogFormModal
        open={modalOpen}
        item={editing}
        resource="practice-areas"
        titleKey="practiceArea"
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={fetchData}
      />
    </div>
  );
}
