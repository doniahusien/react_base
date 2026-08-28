import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  MagnifyingGlassIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  RectangleStackIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSwitchInput } from "../../components/Inputs/BaseSwitchInput";
import { BaseFilesInput } from "../../components/Inputs/BaseFilesInput";
import type { FileOutputItem } from "../../components/Inputs/BaseFilesInput";
import { pagesService } from "../../services/pagesService";
import { toast } from "../../stores/toast";
import type { Page, PageType } from "../../types/pageBuilder";

export default function PagesShowAll() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = (i18n.language || "ar").startsWith("en") ? "en" : "ar";

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Modal State for Create / Edit Metadata
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [modalTab, setModalTab] = useState<"general" | "seo">("general");
  const [saving, setSaving] = useState(false);

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
      const data = await pagesService.list();
      setPages(data);
    } catch (err) {
      toast.error(t("ERRORS.fetch_failed", { defaultValue: "Failed to load pages" }));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
    setModalTab("general");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (page: Page) => {
    setEditingPage(page);
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
      keywords: page.seo?.keywords || "",
    });
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

      await pagesService.save(payload);
      toast.success(
        editingPage
          ? t("PAGES.pageUpdatedSuccess")
          : t("PAGES.pageCreatedSuccess")
      );
      setIsModalOpen(false);
      fetchPages();
    } catch (err) {
      toast.error("Error saving page");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (page: Page) => {
    const newStatus = await pagesService.toggleStatus(page.id);
    setPages((prev) =>
      prev.map((p) => (p.id === page.id ? { ...p, is_published: newStatus } : p))
    );
    toast.success(
      newStatus ? t("PAGES.pagePublished") : t("PAGES.pageMovedToDraft")
    );
  };

  const handleDeletePage = async (page: Page) => {
    if (page.type === "system") {
      toast.error(t("PAGES.systemPageCannotDelete"));
      return;
    }

    const pageTitle = currentLang === "ar" ? page.title.ar : page.title.en;
    const confirmMsg = `${t("PAGES.confirmDeletePage")} "${pageTitle}"?`;

    if (!window.confirm(confirmMsg)) return;

    await pagesService.remove(page.id);
    toast.success(t("PAGES.pageDeletedSuccess"));
    fetchPages();
  };

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchSearch =
        page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.title.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.title.en.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = filterType === "all" || page.type === filterType;
      return matchSearch && matchType;
    });
  }, [pages, searchQuery, filterType]);

  const typeLabels: Record<PageType, { badge: string }> = {
    system: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    custom: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
    policy: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  };

  const getTypeLabel = (type: PageType): string => {
    const labels: Record<PageType, string> = {
      system: t("PAGES.badgeSystemCore"),
      custom: t("PAGES.badgeCustom"),
      policy: t("PAGES.badgePolicyLegal"),
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="pages"
        subtitle="pagesDesc"
        icon={RectangleStackIcon}
        total={pages.length}
        path={[
          { label: "dashboard", href: "/", icon: Squares2X2Icon },
          { label: "pages", icon: RectangleStackIcon },
        ]}
        rightActions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            {t("TITLES.add", { count: t("TITLES.page") })}
          </Button>
        }
      />

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
          <input
            type="text"
            placeholder={t("PAGES.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pe-3 ps-9 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { key: "all", label: t("PAGES.all") },
            { key: "system", label: t("PAGES.system") },
            { key: "policy", label: t("PAGES.policies") },
            { key: "custom", label: t("PAGES.custom") },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterType === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl border border-border/70 bg-card p-5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredPages.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPages.map((page) => (
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

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">
                          {t("PAGES.pageType")}
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, type: e.target.value as PageType }))
                          }
                          className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                        >
                          <option value="custom">{t("PAGES.typeCustom")}</option>
                          <option value="landing">{t("PAGES.typeLanding")}</option>
                          <option value="policy">{t("PAGES.typePolicy")}</option>
                          <option value="system">{t("PAGES.typeSystem")}</option>
                        </select>
                      </div>
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

                    <BaseFilesInput
                      name="og_image"
                      label={t("PAGES.ogImage")}
                      multiple={false}
                      accept="image/*"
                      attachment={false}
                      value={formData.og_image ? { media: formData.og_image } : null}
                      onChange={(val) => {
                        const file = val as FileOutputItem | null;
                        setFormData((prev) => ({ 
                          ...prev, 
                          og_image: file?.str || "" 
                        }));
                      }}
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
