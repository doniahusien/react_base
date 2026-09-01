import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DocumentDuplicateIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
  Squares2X2Icon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  RectangleStackIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSwitchInput } from "../../components/Inputs/BaseSwitchInput";
import { BaseSelectInput } from "../../components/Inputs/BaseSelectInput";
import { ImageInput } from "../../components/Inputs/ImageInput";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { Pagination } from "../../components/UI/Table/Pagination";
import { pagesService } from "../../services/pagesService";
import { toast } from "../../stores/toast";
import type { Page, PageType } from "../../types/pageBuilder";

export default function PagesShowAll() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = (i18n.language || "ar").startsWith("en") ? "en" : "ar";

  const PER_PAGE = 12;

  const [pages, setPages] = useState<Page[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    current_page: 1,
    last_page: 1,
    per_page: PER_PAGE,
  });
  const [pageTypes, setPageTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = searchParams.get("type") ?? "all";
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const goToPage = (next: number) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(next));
      return p;
    });
  };

  // Modal State for Create / Edit Metadata
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [modalTab, setModalTab] = useState<"general" | "seo">("general");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState(false);
  /** Sent as `seo[og_image]`; null keeps whatever the page already has. */
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    slug: string;
    title_ar: string;
    title_en: string;
    type: PageType;
    is_published: boolean;
    meta_title_ar: string;
    meta_title_en: string;
    meta_description_ar: string;
    meta_description_en: string;
    og_image: string;
    keywords: string;
  }>({
    slug: "",
    title_ar: "",
    title_en: "",
    type: "custom",
    is_published: true,
    meta_title_ar: "",
    meta_title_en: "",
    meta_description_ar: "",
    meta_description_en: "",
    og_image: "",
    keywords: "",
  });

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pagesService.listPaged({
        page: currentPage,
        per_page: PER_PAGE,
        type: typeFilter,
      });
      setPages(res.data);
      setMeta(res.meta);
      if (res.categories.length) setPageTypes(res.categories);
    } catch {
      toast.error(t("ERRORS.fetch_failed", { defaultValue: "Failed to load pages" }));
    } finally {
      setLoading(false);
    }
  }, [t, currentPage, typeFilter]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleOpenCreate = () => {
    setEditingPage(null);
    setFormData({
      slug: "",
      title_ar: "",
      title_en: "",
      type: "custom",
      is_published: true,
      meta_title_ar: "",
      meta_title_en: "",
      meta_description_ar: "",
      meta_description_en: "",
      og_image: "",
      keywords: "",
    });
    setOgImageFile(null);
    setModalTab("general");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (page: Page) => {
    setEditingPage(page);
    const keywordsValue = page.seo?.keywords;
    let keywordsStr = "";
    if (typeof keywordsValue === "string") {
      keywordsStr = keywordsValue;
    } else if (Array.isArray(keywordsValue)) {
      keywordsStr = keywordsValue.join(", ");
    } else if (keywordsValue && typeof keywordsValue === "object") {
      keywordsStr = keywordsValue.ar || keywordsValue.en || "";
    }
    setFormData({
      slug: page.slug,
      title_ar: page.title.ar,
      title_en: page.title.en,
      type: page.type,
      is_published: page.is_published,
      meta_title_ar: page.seo?.meta_title?.ar || "",
      meta_title_en: page.seo?.meta_title?.en || "",
      meta_description_ar: page.seo?.meta_description?.ar || "",
      meta_description_en: page.seo?.meta_description?.en || "",
      og_image: page.seo?.og_image || "",
      keywords: keywordsStr,
    });
    setOgImageFile(null);
    setModalTab("general");
    setIsModalOpen(true);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug.trim() || !formData.title_ar.trim()) {
      toast.error(t("PAGES.pleaseEnterSlugAndTitle"));
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Page> & { id?: number } = {
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        title: {
          ar: formData.title_ar.trim(),
          en: formData.title_en.trim() || formData.title_ar.trim(),
        },
        type: formData.type,
        is_published: formData.is_published,
        seo: {
          meta_title: {
            ar: formData.meta_title_ar.trim(),
            en: formData.meta_title_en.trim(),
          },
          meta_description: {
            ar: formData.meta_description_ar.trim(),
            en: formData.meta_description_en.trim(),
          },
          og_image: formData.og_image.trim(),
          keywords: formData.keywords.trim(),
        },
      };

      if (editingPage) {
        payload.id = editingPage.id;
      }

      await pagesService.save(payload, ogImageFile);
      toast.success(
        editingPage
          ? t("PAGES.pageUpdatedSuccess")
          : t("PAGES.pageCreatedSuccess")
      );
      setIsModalOpen(false);
      fetchPages();
    } catch (err: any) {
      toast.error(t("MESSAGES.errorSavingPage"), err?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (page: Page) => {
    try {
      const newStatus = await pagesService.toggleStatus(page.id);
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, is_published: newStatus } : p))
      );
      toast.success(
        newStatus ? t("PAGES.pagePublished") : t("PAGES.pageMovedToDraft")
      );
    } catch (err: any) {
      toast.error(t("MESSAGES.errorSavingPage"), err?.response?.data?.message);
    }
  };

  /** DELETE /admin/pages/{id} — the API also rejects system pages. */
  const handleDeletePage = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "system") {
      toast.error(t("PAGES.systemPageCannotDelete"));
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await pagesService.remove(deleteTarget.id);
      toast.success(t("PAGES.pageDeletedSuccess"));
      setDeleteTarget(null);
      // Removing the last card of a page would otherwise leave an empty view.
      if (pages.length === 1 && currentPage > 1) goToPage(currentPage - 1);
      else fetchPages();
    } catch (err: any) {
      toast.error(t("MESSAGES.deletedFailed"), err?.response?.data?.message);
    } finally {
      setDeleting(false);
    }
  };

  const typeLabels: Record<PageType, { badge: string }> = {
    system: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    landing: { badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
    custom: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
    policy: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  };

  const getTypeLabel = (type: PageType): string => {
    const labels: Record<PageType, string> = {
      system: t("PAGES.badgeSystemCore"),
      landing: t("PAGES.badgeLanding"),
      custom: t("PAGES.badgeCustom"),
      policy: t("PAGES.badgePolicyLegal"),
    };
    return labels[type] || type;
  };

  const typeOptions = useMemo(
    () => (pageTypes.length ? pageTypes : Object.keys(typeLabels)),
    [pageTypes]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "radio",
        key: "type",
        label: t("PAGES.pageType"),
        prependInputIcon: RectangleStackIcon,
        options: [
          { id: "all", label: t("PAGES.all") },
          ...typeOptions.map((type) => ({
            id: type,
            label: getTypeLabel(type as PageType),
          })),
        ],
      },
    ],
    [t, typeOptions]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="pages"
        subtitle="pagesDesc"
        icon={RectangleStackIcon}
        total={meta.total}
        path={[
          { label: "dashboard", href: "/", icon: Squares2X2Icon },
          { label: "pages", icon: RectangleStackIcon },
        ]}
        rightActions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            {t("TITLES.add", { entity: t("TITLES.page") })}
          </Button>
        }
      />

      {/* Toolbar: Total + Filter dropdown */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl bg-card border border-border px-3 sm:px-5 py-3 sm:py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            {t("TITLES.pages")}
          </h2>
          <span className="rounded-full bg-primary px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-bold tabular-nums text-primary-foreground shadow-sm">
            {meta.total}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 sm:gap-2.5 w-full sm:w-auto ms-auto">
          <Filter items={filterItems} />
        </div>
      </div>

      {/* Pages Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl border border-border/70 bg-card p-5 animate-pulse"
            />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <DocumentTextIcon className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-base font-semibold">
            {t("PAGES.noMatchingPages")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {t("PAGES.noMatchingPagesDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pages.map((page) => (
            <div
              key={page.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/40"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        typeLabels[page.type]?.badge || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {getTypeLabel(page.type)}
                    </span>
                    <h3 className="text-lg font-bold text-foreground line-clamp-1">
                      {currentLang === "ar" ? page.title.ar : page.title.en}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(page)}
                    title={
                      page.is_published
                        ? t("PAGES.publishedClickToUnpublish")
                        : t("PAGES.draftClickToPublish")
                    }
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                      page.is_published
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200"
                    }`}
                  >
                    {page.is_published ? (
                      <>
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t("PAGES.published")}
                      </>
                    ) : (
                      <>
                        <span className="size-1.5 rounded-full bg-zinc-400" />
                        {t("PAGES.draft")}
                      </>
                    )}
                  </button>
                </div>

                {/* Slug Badge */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/40 rounded-md px-2.5 py-1 w-fit mb-4">
                  <GlobeAltIcon className="h-3.5 w-3.5 text-primary" />
                  <span>/{page.slug}</span>
                </div>
              </div>

              {/* Footer Meta & Actions */}
              <div className="pt-4 border-t border-border/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <RectangleStackIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    {page.sections?.length ?? page.sections_count ?? 0}
                  </span>
                  <span>{t("PAGES.blocks")}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(page)}
                    title={t("PAGES.editSeoInfo")}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>

                  {/* System pages are not deletable, server-side and here. */}
                  {page.type !== "system" && (
                    <button
                      onClick={() => setDeleteTarget(page)}
                      title={t("BUTTONS.delete")}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-900 dark:hover:bg-rose-950/30"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}


                  <Button
                    size="sm"
                    onClick={() => navigate(`/pages/${page.id}/builder`)}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <WrenchScrewdriverIcon className="h-3.5 w-3.5" />
                    {t("PAGES.manageContent")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && pages.length > 0 && (
        <Pagination meta={meta} page={meta.current_page} onPage={goToPage} />
      )}

      {/* Delete confirmation */}
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
              {t("PAGES.confirmDeletePage")} "
              {currentLang === "ar"
                ? deleteTarget.title.ar
                : deleteTarget.title.en}
              "
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
                onClick={handleDeletePage}
              >
                {t("BUTTONS.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Page Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="flex flex-col w-full max-w-xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <RectangleStackIcon className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-bold">
                  {editingPage
                    ? t("PAGES.pageSettings")
                    : t("PAGES.createNewPage")}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-border px-6 py-3 shrink-0">
              <button
                type="button"
                onClick={() => setModalTab("general")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  modalTab === "general"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t("PAGES.generalInfo")}
              </button>
              <button
                type="button"
                onClick={() => setModalTab("seo")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  modalTab === "seo"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t("PAGES.seoMeta")}
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form onSubmit={handleSavePage} className="space-y-4" id="page-form">
                {modalTab === "general" ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <BaseTextInput
                        name="title_ar"
                        label={t("PAGES.titleArabicRequired")}
                        value={formData.title_ar}
                        onInput={(val) =>
                          setFormData((prev) => ({ ...prev, title_ar: val }))
                        }
                        placeholder={t("PAGES.titleArabicPlaceholder")}
                      />
                      <BaseTextInput
                        name="title_en"
                        label={t("PAGES.titleEnglish")}
                        value={formData.title_en}
                        onInput={(val) =>
                          setFormData((prev) => ({ ...prev, title_en: val }))
                        }
                        placeholder={t("PAGES.titleEnglishPlaceholder")}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <BaseTextInput
                        name="slug"
                        label={t("PAGES.pageSlugRequired")}
                        value={formData.slug}
                        onInput={(val) =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: val.toLowerCase().replace(/\s+/g, "-"),
                          }))
                        }
                        placeholder={t("PAGES.pageSlugPlaceholder")}
                      />

                      <BaseSelectInput
                        name="type"
                        label={t("PAGES.pageType")}
                        items={[
                          { id: "custom", name: t("PAGES.typeCustom") },
                          { id: "landing", name: t("PAGES.typeLanding") },
                          { id: "policy", name: t("PAGES.typePolicy") },
                          { id: "system", name: t("PAGES.typeSystem") },
                        ]}
                        value={{ id: formData.type, name: t(`PAGES.type${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`) }}
                        onChange={(val) => setFormData((prev) => ({ ...prev, type: (val as { id: string }).id as PageType }))}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-muted/20">
                      <div>
                        <p className="text-sm font-semibold">
                          {t("PAGES.publishStatus")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("PAGES.publishStatusDesc")}
                        </p>
                      </div>
                      <BaseSwitchInput
                        name="is_published"
                        value={formData.is_published}
                        onChange={(checked) =>
                          setFormData((prev) => ({ ...prev, is_published: checked }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <BaseTextInput
                        name="meta_title_ar"
                        label={t("PAGES.metaTitleArabic")}
                        value={formData.meta_title_ar}
                        onInput={(val) =>
                          setFormData((prev) => ({ ...prev, meta_title_ar: val }))
                        }
                        placeholder={t("PAGES.metaTitleArabicPlaceholder")}
                      />
                      <BaseTextInput
                        name="meta_title_en"
                        label={t("PAGES.metaTitleEnglish")}
                        value={formData.meta_title_en}
                        onInput={(val) =>
                          setFormData((prev) => ({ ...prev, meta_title_en: val }))
                        }
                        placeholder={t("PAGES.metaTitleEnglishPlaceholder")}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <BaseTextInput
                        name="meta_description_ar"
                        label={t("PAGES.metaDescriptionArabic")}
                        value={formData.meta_description_ar}
                        onInput={(val) =>
                          setFormData((prev) => ({
                            ...prev,
                            meta_description_ar: val,
                          }))
                        }
                        placeholder={t("PAGES.metaDescriptionArabicPlaceholder")}
                      />
                      <BaseTextInput
                        name="meta_description_en"
                        label={t("PAGES.metaDescriptionEnglish")}
                        value={formData.meta_description_en}
                        onInput={(val) =>
                          setFormData((prev) => ({
                            ...prev,
                            meta_description_en: val,
                          }))
                        }
                        placeholder={t("PAGES.metaDescriptionEnglishPlaceholder")}
                      />
                    </div>

                    <ImageInput
                      label={t("PAGES.ogImage")}
                      value={formData.og_image}
                      onChange={(imgVal) =>
                        setFormData((prev) => ({ ...prev, og_image: imgVal }))
                      }
                      onFileSelect={setOgImageFile}
                      currentLang={currentLang}
                    />

                    <BaseTextInput
                      name="keywords"
                      label={t("PAGES.keywords")}
                      value={formData.keywords}
                      onInput={(val) =>
                        setFormData((prev) => ({ ...prev, keywords: val }))
                      }
                      placeholder={t("PAGES.keywordsPlaceholder")}
                    />
                  </>
                )}
              </form>
            </div>

            {/* Fixed Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                {t("PAGES.cancel")}
              </Button>
              <Button type="submit" form="page-form" disabled={saving}>
                {saving ? t("PAGES.saving") : t("PAGES.savePage")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
