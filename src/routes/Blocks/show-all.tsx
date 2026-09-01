import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  SquaresPlusIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { Pagination } from "../../components/UI/Table/Pagination";
import { getIconComponent, isImageIcon } from "../../components/Inputs/IconPicker";
import { mediaUrl } from "../../lib/mediaUrl";
import { CATEGORY_TITLE_KEYS } from "../../components/Shared/BlockTemplateForm";
import { blockTemplatesService } from "../../services/blockTemplatesService";
import { toast } from "../../stores/toast";
import type { BlockTemplate } from "../../types/blocks";

export default function BlocksShowAll() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = (i18n.language || "ar").startsWith("en") ? "en" : "ar";

  const PER_PAGE = 12;

  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    current_page: 1,
    last_page: 1,
    per_page: PER_PAGE,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") ?? "all";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [deleteTarget, setDeleteTarget] = useState<BlockTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const goToPage = (next: number) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(next));
      return p;
    });
  };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blockTemplatesService.listPaged({
        page,
        per_page: PER_PAGE,
        category: categoryFilter,
      });
      setTemplates(res.data);
      setMeta(res.meta);
      if (res.categories.length) setCategories(res.categories);
    } catch {
      toast.error(t("MESSAGES.failedToLoadBlocks"));
    } finally {
      setLoading(false);
    }
  }, [t, page, categoryFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleToggleStatus = async (tpl: BlockTemplate) => {
    try {
      const newStatus = await blockTemplatesService.toggleStatus(tpl.id);
      setTemplates((prev) =>
        prev.map((item) => (item.id === tpl.id ? { ...item, is_active: newStatus } : item))
      );
      toast.success(
        newStatus ? t("MESSAGES.blockEnabled") : t("MESSAGES.blockDisabled")
      );
    } catch (err: any) {
      toast.error(
        t("MESSAGES.blockTemplateSaveFailed"),
        err?.response?.data?.message
      );
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await blockTemplatesService.remove(deleteTarget.id);
      toast.success(t("MESSAGES.blockTemplateDeleted"));
      setDeleteTarget(null);
      if (templates.length === 1 && page > 1) goToPage(page - 1);
      else fetchTemplates();
    } catch (err: any) {
      toast.error(t("MESSAGES.deletedFailed"), err?.response?.data?.message);
    } finally {
      setDeleting(false);
    }
  };

  const categoryOptions = useMemo(
    () => (categories.length ? categories : Object.keys(CATEGORY_TITLE_KEYS)),
    [categories]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "radio",
        key: "category",
        label: t("TITLES.category"),
        prependInputIcon: TagIcon,
        options: [
          { id: "all", label: t("TITLES.all") },
          ...categoryOptions.map((cat) => ({
            id: cat,
            label: t(CATEGORY_TITLE_KEYS[cat] || cat),
          })),
        ],
      },
    ],
    [t, categoryOptions]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="blocks"
        subtitle="blocksDesc"
        icon={SquaresPlusIcon}
        total={meta.total}
        path={[
          { label: "dashboard", href: "/", icon: Squares2X2Icon },
          { label: "blocks", icon: SquaresPlusIcon },
        ]}
        rightActions={
          <Button onClick={() => navigate("/blocks/create")} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            {t("TITLES.add", { entity: t("TITLES.block") })}
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl bg-card border border-border px-3 sm:px-5 py-3 sm:py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            {t("TITLES.blocks")}
          </h2>
          <span className="rounded-full bg-primary px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-bold tabular-nums text-primary-foreground shadow-sm">
            {meta.total}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 sm:gap-2.5 w-full sm:w-auto ms-auto">
          <Filter items={filterItems} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-52 rounded-2xl border border-border/70 bg-card p-5 animate-pulse"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <SquaresPlusIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-bold text-foreground">
            {t("LABELS.noBlockTemplates")}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {t("LABELS.noBlockTemplatesDesc")}
          </p>
          <Button
            onClick={() => navigate("/blocks/create")}
            className="mt-4 gap-2 text-xs"
          >
            <PlusIcon className="h-4 w-4" />
            {t("LABELS.createTemplate")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tpl) => {
            const IconComp = getIconComponent(tpl.icon);
            const iconIsImage = isImageIcon(tpl.icon);
            const iconSrc = iconIsImage ? mediaUrl(tpl.icon) ?? tpl.icon : null;
            return (
              <section
                key={tpl.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
                  tpl.is_active
                    ? "border-border/70 hover:border-primary/40"
                    : "border-border/40 bg-muted/20 opacity-75 hover:opacity-100"
                }`}
              >
                <div
                  className={`h-1 w-full bg-linear-to-r transition-colors ${
                    tpl.is_active
                      ? "from-primary via-secondary to-transparent"
                      : "from-muted-foreground/20 to-transparent"
                  }`}
                />

                <div className="flex items-start justify-between gap-4 px-5 pt-5">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 transition-transform group-hover:scale-105 group-hover:rotate-3 ${
                        tpl.is_active
                          ? "bg-linear-to-br from-primary/15 to-secondary/10 text-primary ring-primary/20"
                          : "bg-muted text-muted-foreground ring-border/50"
                      }`}
                    >
                      {iconIsImage && iconSrc ? (
                        <img
                          src={iconSrc}
                          alt=""
                          className="h-6 w-6 object-contain"
                        />
                      ) : (
                        <IconComp className="h-6 w-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        <span
                          className={`size-1 rounded-full ${
                            tpl.is_active ? "bg-primary" : "bg-muted-foreground/40"
                          }`}
                        />
                        {t(CATEGORY_TITLE_KEYS[tpl.category] || tpl.category)}
                      </span>
                      <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground/70">
                        {tpl.id}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(tpl)}
                    title={tpl.is_active ? t("STATUS.disabled") : t("STATUS.available")}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-xs ring-1 transition-all hover:opacity-90 active:scale-95 ${
                      tpl.is_active
                        ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400"
                        : "bg-zinc-500/10 text-zinc-500 ring-zinc-500/20"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        tpl.is_active ? "animate-pulse bg-emerald-500" : "bg-zinc-400"
                      }`}
                    />
                    {tpl.is_active ? t("STATUS.available") : t("STATUS.disabled")}
                  </button>
                </div>

                <div className="flex flex-1 flex-col px-5 pb-2 pt-4">
                  <h3 className="text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {currentLang === "ar" ? tpl.name_ar : tpl.name_en}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                    {currentLang === "ar" ? tpl.description_ar : tpl.description_en}
                  </p>

                  {tpl.shape_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3">
                      {tpl.shape_tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-primary/10 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/50 bg-muted/10 px-5 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <Squares2X2Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {t("TITLES.inputFieldsCount", { count: tpl.fields?.length || 0 })}
                    </span>
                    {tpl.fields?.length ? (
                      <span className="hidden truncate font-mono text-[10px] text-muted-foreground sm:inline">
                        {tpl.fields.map((f) => f.type).join(" • ")}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/blocks/${tpl.id}/edit`)}
                      className="gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5" />
                      {t("LABELS.editShape")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(tpl)}
                      className="px-3 py-1.5 text-muted-foreground hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-900 dark:hover:bg-rose-950/30"
                      title={t("BUTTONS.delete")}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!loading && templates.length > 0 && (
        <Pagination meta={meta} page={meta.current_page} onPage={goToPage} />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-background p-6 shadow-2xl shadow-foreground/20">
            <h3 className="mb-2 text-base font-semibold text-foreground">
              {t("TITLES.confirmDelete")}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {t("MESSAGES.confirmDeleteBlockTemplate", {
                name:
                  currentLang === "ar"
                    ? deleteTarget.name_ar
                    : deleteTarget.name_en,
              })}
            </p>
            <div className="flex items-center gap-3">
              <Button
                reverse
                className="max-w-full flex-1"
                onClick={() => setDeleteTarget(null)}
              >
                {t("BUTTONS.cancel")}
              </Button>
              <Button
                className="max-w-full flex-1 !bg-destructive text-destructive-foreground hover:!bg-destructive/90"
                loading={deleting}
                onClick={handleDeleteTemplate}
              >
                {t("BUTTONS.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
