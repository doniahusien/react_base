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
import { pageBuilderMockService } from "../../mocks/pageBuilderMock";
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
      const data = await pageBuilderMockService.getPages();
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
      toast.error(
        currentLang === "ar"
          ? "يرجى كتابة مسار الصفحة والعنوان بالعربية"
          : "Please enter slug and Arabic title"
      );
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

      await pageBuilderMockService.savePage(payload);
      toast.success(
        editingPage
          ? currentLang === "ar"
            ? "تم تحديث بيانات الصفحة بنجاح"
            : "Page updated successfully"
          : currentLang === "ar"
          ? "تم إنشاء الصفحة بنجاح"
          : "Page created successfully"
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
    const newStatus = await pageBuilderMockService.togglePageStatus(page.id);
    setPages((prev) =>
      prev.map((p) => (p.id === page.id ? { ...p, is_published: newStatus } : p))
    );
    toast.success(
      currentLang === "ar"
        ? newStatus
          ? "تم نشر الصفحة"
          : "تم تحويل الصفحة إلى مسودة"
        : newStatus
        ? "Page published"
        : "Page moved to draft"
    );
  };

  const handleDeletePage = async (page: Page) => {
    if (page.type === "system") {
      toast.error(
        currentLang === "ar"
          ? "لا يمكن حذف الصفحات الأساسية للنظام"
          : "System pages cannot be deleted"
      );
      return;
    }

    const confirmMsg =
      currentLang === "ar"
        ? `هل أنت متأكد من حذف صفحة "${page.title.ar}"؟`
        : `Are you sure you want to delete "${page.title.en}"?`;

    if (!window.confirm(confirmMsg)) return;

    await pageBuilderMockService.deletePage(page.id);
    toast.success(
      currentLang === "ar" ? "تم حذف الصفحة بنجاح" : "Page deleted successfully"
    );
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

  const typeLabels: Record<PageType, { ar: string; en: string; badge: string }> = {
    system: { ar: "أساسية للنظام", en: "System Core", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    landing: { ar: "صفحة هبوط", en: "Landing Page", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
    custom: { ar: "مخصصة", en: "Custom", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
    policy: { ar: "شروط وسياسات", en: "Policy / Legal", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
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
            placeholder={
              currentLang === "ar"
                ? "ابحث باسم الصفحة أو الرابط..."
                : "Search page title or slug..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pe-3 ps-9 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { key: "all", label_ar: "الكل", label_en: "All" },
            { key: "system", label_ar: "أساسية", label_en: "System" },
            { key: "landing", label_ar: "صفحات هبوط", label_en: "Landing" },
            { key: "policy", label_ar: "سياسات", label_en: "Policies" },
            { key: "custom", label_ar: "مخصصة", label_en: "Custom" },
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
              {currentLang === "ar" ? tab.label_ar : tab.label_en}
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
            {currentLang === "ar" ? "لا توجد صفحات مطابقة" : "No matching pages found"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {currentLang === "ar"
              ? "جرّب تغيير كلمات البحث أو أنشئ صفحة جديدة لبدء التصميم."
              : "Try altering search terms or create a new dynamic page."}
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
                      {currentLang === "ar"
                        ? typeLabels[page.type]?.ar
                        : typeLabels[page.type]?.en}
                    </span>
                    <h3 className="text-lg font-bold text-foreground line-clamp-1">
                      {currentLang === "ar" ? page.title.ar : page.title.en}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(page)}
                    title={
                      page.is_published
                        ? currentLang === "ar"
                          ? "الصفحة منشورة (انقر للتعطيل)"
                          : "Published (Click to unpublish)"
                        : currentLang === "ar"
                        ? "مسودة (انقر للنشر)"
                        : "Draft (Click to publish)"
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
                        {currentLang === "ar" ? "منشور" : "Published"}
                      </>
                    ) : (
                      <>
                        <span className="size-1.5 rounded-full bg-zinc-400" />
                        {currentLang === "ar" ? "مسودة" : "Draft"}
                      </>
                    )}
                  </button>
                </div>

                {/* Slug Badge */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/40 rounded-md px-2.5 py-1 w-fit mb-4">
                  <GlobeAltIcon className="h-3.5 w-3.5 text-primary" />
                  <span>/{page.slug}</span>
                </div>

                {/* Subtitle / Language hint */}
                <p className="text-xs text-muted-foreground line-clamp-1 mb-4">
                  {currentLang === "ar" ? `EN: ${page.title.en}` : `AR: ${page.title.ar}`}
                </p>
              </div>

              {/* Footer Meta & Actions */}
              <div className="pt-4 border-t border-border/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <RectangleStackIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    {page.sections?.length ?? page.sections_count ?? 0}
                  </span>
                  <span>{currentLang === "ar" ? "أقسام/بلوكات" : "Blocks"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(page)}
                    title={currentLang === "ar" ? "تعديل بيانات وSEO الصفحة" : "Edit SEO & Info"}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>

                  {page.type !== "system" && (
                    <button
                      onClick={() => handleDeletePage(page)}
                      title={currentLang === "ar" ? "حذف الصفحة" : "Delete Page"}
                      className="p-1.5 rounded-lg border border-border hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors"
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
                    {currentLang === "ar" ? "إدارة المحتوى والأقسام" : "Manage Content"}
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
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <RectangleStackIcon className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-bold">
                  {editingPage
                    ? currentLang === "ar"
                      ? "إعدادات وبيانات الصفحة"
                      : "Page Settings & SEO"
                    : currentLang === "ar"
                    ? "إنشاء صفحة جديدة"
                    : "Create New Page"}
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
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <button
                type="button"
                onClick={() => setModalTab("general")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  modalTab === "general"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {currentLang === "ar" ? "البيانات الأساسية" : "General Info"}
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
                {currentLang === "ar" ? "محركات البحث (SEO)" : "SEO & Meta"}
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-4">
              {modalTab === "general" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <BaseTextInput
                      name="title_ar"
                      label={currentLang === "ar" ? "عنوان الصفحة (بالعربية) *" : "Title (Arabic) *"}
                      value={formData.title_ar}
                      onInput={(val) =>
                        setFormData((prev) => ({ ...prev, title_ar: val }))
                      }
                      placeholder="مثال: من نحن"
                    />
                    <BaseTextInput
                      name="title_en"
                      label={currentLang === "ar" ? "عنوان الصفحة (بالإنجليزية)" : "Title (English)"}
                      value={formData.title_en}
                      onInput={(val) =>
                        setFormData((prev) => ({ ...prev, title_en: val }))
                      }
                      placeholder="e.g. About Us"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <BaseTextInput
                      name="slug"
                      label={currentLang === "ar" ? "رابط الصفحة (Slug) *" : "Page Slug *"}
                      value={formData.slug}
                      onInput={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: val.toLowerCase().replace(/\s+/g, "-"),
                        }))
                      }
                      placeholder="e.g. black-friday-2026"
                    />

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        {currentLang === "ar" ? "نوع الصفحة" : "Page Type"}
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, type: e.target.value as PageType }))
                        }
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                      >
                        <option value="custom">{currentLang === "ar" ? "مخصصة" : "Custom"}</option>
                        <option value="landing">{currentLang === "ar" ? "صفحة هبوط" : "Landing"}</option>
                        <option value="policy">{currentLang === "ar" ? "سياسات وشروط" : "Policy / Legal"}</option>
                        <option value="system">{currentLang === "ar" ? "أساسية للنظام" : "System Core"}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-muted/20">
                    <div>
                      <p className="text-sm font-semibold">
                        {currentLang === "ar" ? "حالة النشر" : "Publish Status"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentLang === "ar"
                          ? "هل تظهر الصفحة لزوار الموقع الآن؟"
                          : "Make this page publicly accessible on website"}
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
                      label={currentLang === "ar" ? "عنوان Meta (بالعربية)" : "Meta Title (Arabic)"}
                      value={formData.meta_title_ar}
                      onInput={(val) =>
                        setFormData((prev) => ({ ...prev, meta_title_ar: val }))
                      }
                      placeholder="عنوان يظهر في نتائج بحث جوجل"
                    />
                    <BaseTextInput
                      name="meta_title_en"
                      label={currentLang === "ar" ? "عنوان Meta (بالإنجليزية)" : "Meta Title (English)"}
                      value={formData.meta_title_en}
                      onInput={(val) =>
                        setFormData((prev) => ({ ...prev, meta_title_en: val }))
                      }
                      placeholder="Page title in Google search"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <BaseTextInput
                      name="meta_description_ar"
                      label={currentLang === "ar" ? "وصف Meta (بالعربية)" : "Meta Description (Arabic)"}
                      value={formData.meta_description_ar}
                      onInput={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          meta_description_ar: val,
                        }))
                      }
                      placeholder="وصف مختصر لمحتوى الصفحة"
                    />
                    <BaseTextInput
                      name="meta_description_en"
                      label={currentLang === "ar" ? "وصف Meta (بالإنجليزية)" : "Meta Description (English)"}
                      value={formData.meta_description_en}
                      onInput={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          meta_description_en: val,
                        }))
                      }
                      placeholder="Short summary for search results"
                    />
                  </div>

                  <BaseTextInput
                    name="og_image"
                    label={currentLang === "ar" ? "رابط صورة المشاركة (OG Image)" : "Social Share Image (OG Image)"}
                    value={formData.og_image}
                    onInput={(val) =>
                      setFormData((prev) => ({ ...prev, og_image: val }))
                    }
                    placeholder="/images/og-share.jpg or https://..."
                  />

                  <BaseTextInput
                    name="keywords"
                    label={currentLang === "ar" ? "الكلمات المفتاحية (Keywords)" : "Keywords (Comma separated)"}
                    value={formData.keywords}
                    onInput={(val) =>
                      setFormData((prev) => ({ ...prev, keywords: val }))
                    }
                    placeholder="gold, silver, bullion, investment"
                  />
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  {currentLang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving
                    ? currentLang === "ar"
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : currentLang === "ar"
                    ? "حفظ الصفحة"
                    : "Save Page"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
