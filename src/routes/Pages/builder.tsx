import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  RectangleStackIcon,
  SquaresPlusIcon,
  SparklesIcon,
  BriefcaseIcon,
  QueueListIcon,
  UserPlusIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  FlagIcon,
  DocumentTextIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  PhotoIcon,
  ArrowTopRightOnSquareIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSwitchInput } from "../../components/Inputs/BaseSwitchInput";
import { IconPicker, getIconComponent } from "../../components/Inputs/IconPicker";
import { ImageInput } from "../../components/Inputs/ImageInput";
import { pagesService } from "../../services/pagesService";
import { blockTemplatesService } from "../../services/blockTemplatesService";
import {
  getBlockDefaultContent,
  normalizeBlockType,
} from "../../mocks/blockTemplatesMock";
import { toast } from "../../stores/toast";
import type {
  Page,
  PageSection,
  BlockType,
} from "../../types/pageBuilder";
import type { BlockTemplate, BlockCategory } from "../../types/blocks";

function getSectionMeta(
  type: string,
  templates: BlockTemplate[],
  lang: "ar" | "en"
) {
  const canonical = normalizeBlockType(type);
  const tpl = templates.find((t) => t.id === canonical);
  if (tpl) {
    return {
      name: lang === "ar" ? tpl.name_ar : tpl.name_en,
      description: lang === "ar" ? tpl.description_ar : tpl.description_en,
      icon: tpl.icon,
      category: tpl.category,
      shape_tags: tpl.shape_tags,
    };
  }
  return {
    name: type,
    description: "",
    icon: "Sparkles",
    category: "content_media",
    shape_tags: [],
  };
}

// ==========================================
// Section Layer Item
// ==========================================
interface SectionItemProps {
  section: PageSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggleActive: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  currentLang: "ar" | "en";
  templates: BlockTemplate[];
}

function SectionItem({
  section,
  isSelected,
  onSelect,
  onToggleActive,
  onDuplicate,
  onDelete,
  currentLang,
  templates,
}: SectionItemProps) {
  const meta = getSectionMeta(section.type, templates, currentLang);
  const IconComp = getIconComponent(meta.icon);

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between gap-2.5 rounded-xl border p-3 transition-all cursor-pointer select-none ${
        isSelected
          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
          : "border-border/80 bg-card hover:bg-muted/40"
      } ${!section.is_active ? "opacity-60 bg-muted/30" : ""}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <IconComp className="h-3.5 w-3.5" />
        </div>

        <div className="truncate min-w-0">
          <p className="text-xs sm:text-sm font-bold text-foreground truncate">
            {meta.name}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono truncate">
            {section.type}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visibility */}
        <button
          onClick={onToggleActive}
          title={section.is_active ? "Visible on website" : "Hidden"}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {section.is_active ? (
            <EyeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <EyeSlashIcon className="h-4 w-4 text-rose-500" />
          )}
        </button>

        {/* Duplicate */}
        <button
          onClick={onDuplicate}
          title="Duplicate section"
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <DocumentDuplicateIcon className="h-4 w-4" />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          title="Delete section"
          className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// Main Content Manager Workspace
// ==========================================
export default function PageContentManagerWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || "ar").startsWith("en") ? "en" : "ar";

  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Content Language Tab for Form editing
  const [contentLang, setContentLang] = useState<"ar" | "en">("ar");

  // Add Block Modal
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [blockSearch, setBlockSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [blockTemplates, setBlockTemplates] = useState<BlockTemplate[]>([]);

  const fetchBlockTemplates = useCallback(async () => {
    try {
      const tpls = await blockTemplatesService.list();
      setBlockTemplates(tpls);
    } catch (e) {
      console.error("Failed to load block templates", e);
    }
  }, []);

  useEffect(() => {
    fetchBlockTemplates();
  }, [fetchBlockTemplates]);

  // Load Page Data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    pagesService
      .get(Number(id))
      .then((data) => {
        if (data) {
          setPage(data);
          const secs = data.sections || [];
          setSections(secs);
          if (secs.length > 0) {
            setSelectedSectionId(secs[0].id);
          }
        } else {
          toast.error("Page not found");
          navigate("/pages");
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Keyboard shortcut for saving (Ctrl+S or Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSavePage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Selected Section
  const selectedSection = useMemo(() => {
    return sections.find((s) => s.id === selectedSectionId) || null;
  }, [sections, selectedSectionId]);

  // Toggle Active
  const handleToggleActive = (secId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, is_active: !s.is_active } : s))
    );
    setHasUnsavedChanges(true);
  };

  // Duplicate Section
  const handleDuplicateSection = (sec: PageSection) => {
    const newId = `sec-${Date.now()}`;
    const duplicated: PageSection = {
      ...JSON.parse(JSON.stringify(sec)),
      id: newId,
    };
    setSections((prev) => [...prev, duplicated]);
    setSelectedSectionId(newId);
    setHasUnsavedChanges(true);
    toast.success(
      currentLang === "ar" ? "تم تكرار القسم بنجاح" : "Section duplicated"
    );
  };

  // Delete Section
  const handleDeleteSection = (secId: string) => {
    if (
      !window.confirm(
        currentLang === "ar" ? "هل أنت متأكد من حذف هذا القسم من الصفحة؟" : "Delete this section?"
      )
    )
      return;

    setSections((prev) => {
      const next = prev.filter((s) => s.id !== secId);
      if (selectedSectionId === secId) {
        setSelectedSectionId(next[0]?.id || null);
      }
      return next;
    });
    setHasUnsavedChanges(true);
    toast.success(currentLang === "ar" ? "تم حذف القسم" : "Section removed");
  };

  // Add Block to Page
  const handleAddBlock = (templateOrType: BlockTemplate | BlockType) => {
    if (!page) return;
    const newId = `sec-${Date.now()}`;

    let blockType: string;
    let defaultContent: any;

    if (typeof templateOrType === "string") {
      blockType = normalizeBlockType(templateOrType);
      const foundTpl = blockTemplates.find((t) => t.id === blockType);
      if (foundTpl && foundTpl.default_content) {
        defaultContent = JSON.parse(JSON.stringify(foundTpl.default_content));
      } else {
        defaultContent = getBlockDefaultContent(blockType);
      }
    } else {
      blockType = templateOrType.id;
      defaultContent = JSON.parse(
        JSON.stringify(templateOrType.default_content || { ar: {}, en: {} })
      );
    }

    const newSection: PageSection = {
      id: newId,
      page_id: page.id,
      type: blockType,
      is_active: true,
      content: defaultContent,
    };

    setSections((prev) => [...prev, newSection]);
    setSelectedSectionId(newId);
    setIsAddBlockOpen(false);
    setHasUnsavedChanges(true);
    toast.success(
      currentLang === "ar" ? "تمت إضافة البلوك إلى الصفحة" : "Block added to page"
    );
  };

  // Update Selected Section Content
  const updateSelectedContent = (updater: (prevContent: any) => any) => {
    if (!selectedSectionId) return;
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === selectedSectionId) {
          const currentLangContent = sec.content[contentLang] || {};
          const updatedLangContent = updater(
            JSON.parse(JSON.stringify(currentLangContent))
          );
          return {
            ...sec,
            content: {
              ...sec.content,
              [contentLang]: updatedLangContent,
            },
          };
        }
        return sec;
      })
    );
    setHasUnsavedChanges(true);
  };

  // Save Page Sections
  const handleSavePage = async () => {
    if (!page) return;
    setSaving(true);
    try {
      await pagesService.saveSections(page.id, sections);
      setHasUnsavedChanges(false);
      toast.success(
        currentLang === "ar"
          ? "تم حفظ وتحديث محتوى الصفحة بنجاح!"
          : "Page content saved successfully!"
      );
    } catch (e) {
      toast.error("Error saving page");
    } finally {
      setSaving(false);
    }
  };

  // Filtered Dynamic Block Templates for Modal
  const availableBlockTemplates = useMemo(() => {
    return blockTemplates.filter((tpl) => {
      const matchQuery =
        tpl.name_ar.toLowerCase().includes(blockSearch.toLowerCase()) ||
        tpl.name_en.toLowerCase().includes(blockSearch.toLowerCase()) ||
        tpl.id.toLowerCase().includes(blockSearch.toLowerCase()) ||
        (tpl.description_ar &&
          tpl.description_ar.toLowerCase().includes(blockSearch.toLowerCase())) ||
        (tpl.description_en &&
          tpl.description_en.toLowerCase().includes(blockSearch.toLowerCase())) ||
        (tpl.shape_tags &&
          tpl.shape_tags.some((t) =>
            t.toLowerCase().includes(blockSearch.toLowerCase())
          ));
      const matchCat = categoryFilter === "all" || tpl.category === categoryFilter;
      return matchQuery && matchCat;
    });
  }, [blockTemplates, blockSearch, categoryFilter]);

  if (loading || !page) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">
            {currentLang === "ar" ? "جاري تحميل محتوى الصفحة..." : "Loading page content..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Standard Dashboard PageHeader */}
      <PageHeader
        title={page.title[currentLang] || page.title.ar}
        translateTitle={false}
        subtitle={
          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <span className="font-mono font-semibold text-primary">/{page.slug}</span>
            <span>•</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
              {page.type}
            </span>
            <span>•</span>
            <span>
              {sections.length}{" "}
              {currentLang === "ar" ? "أقسام معرفة في هذه الصفحة" : "sections configured"}
              </span>
            </div>
        }
        translateSubtitle={false}
        icon={RectangleStackIcon}
        path={[
          { label: "dashboard", href: "/", icon: Squares2X2Icon },
          { label: "pages", href: "/pages", icon: RectangleStackIcon },
          {
            label: page.title[currentLang] || page.title.ar,
            icon: WrenchScrewdriverIcon,
            translate: false,
          },
        ]}
        rightActions={
          <div className="flex items-center gap-2.5">
          {hasUnsavedChanges && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900 animate-pulse">
                <span className="size-1.5 rounded-full bg-amber-500" />
              {currentLang === "ar" ? "تغييرات غير محفوظة" : "Unsaved changes"}
            </span>
          )}

          <Button
            variant="outline"
            onClick={() => setIsAddBlockOpen(true)}
            className="gap-1.5 text-xs"
          >
            <PlusIcon className="h-4 w-4" />
              {currentLang === "ar" ? "إضافة قسم" : "Add Section"}
          </Button>

          <Button
            onClick={handleSavePage}
            disabled={saving}
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            {saving ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
            {saving
              ? currentLang === "ar"
                ? "جاري الحفظ..."
                : "Saving..."
              : currentLang === "ar"
              ? "حفظ التغييرات"
              : "Save Changes"}
          </Button>
        </div>
        }
      />

      {/* ==========================================
          2-PANEL WORKSPACE BODY (Responsive Grid)
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ==========================================
            LEFT PANEL: SECTIONS LIST
        ========================================== */}
        <aside className="lg:col-span-4 xl:col-span-4 rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-border p-3.5 bg-muted/20">
            <div className="flex items-center gap-2">
              <RectangleStackIcon className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {currentLang === "ar" ? "أقسام الصفحة" : "Page Sections"}
              </h2>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              {sections.length}
            </span>
          </div>

          {/* Sections List */}
          <div className="p-3 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <SquaresPlusIcon className="h-10 w-10 mb-2 text-muted-foreground/50" />
                <p className="text-xs font-bold text-foreground">
                  {currentLang === "ar" ? "لا توجد أقسام في الصفحة" : "No sections yet"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {currentLang === "ar"
                    ? "أضف أقساماً لتنظيم محتوى هذه الصفحة"
                    : "Add modular blocks to build page content"}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddBlockOpen(true)}
                  className="mt-3 text-xs"
                >
                  {currentLang === "ar" ? "إضافة أول قسم" : "Add First Section"}
                </Button>
              </div>
            ) : (
              sections.map((section) => (
                <SectionItem
                  key={section.id}
                  section={section}
                  isSelected={selectedSectionId === section.id}
                  onSelect={() => setSelectedSectionId(section.id)}
                  onToggleActive={() => handleToggleActive(section.id)}
                  onDuplicate={() => handleDuplicateSection(section)}
                  onDelete={() => handleDeleteSection(section.id)}
                  currentLang={currentLang}
                  templates={blockTemplates}
                />
              ))
            )}
          </div>

          {/* Bottom Add Trigger */}
          <div className="p-3 border-t border-border bg-muted/10">
            <Button
              variant="outline"
              onClick={() => setIsAddBlockOpen(true)}
              className="w-full gap-2 text-xs border-dashed hover:border-primary font-semibold"
            >
              <PlusIcon className="h-4 w-4 text-primary" />
              {currentLang === "ar" ? "إضافة قسم جديد" : "Add New Section"}
            </Button>
          </div>
        </aside>

        {/* ==========================================
            RIGHT MAIN AREA: SECTION CONTENT FORM
        ========================================== */}
        <main className="lg:col-span-8 xl:col-span-8 space-y-4">
          {selectedSection ? (
            <div className="w-full space-y-5">
              {/* Section Header Card */}
              {(() => {
                const meta = getSectionMeta(selectedSection.type, blockTemplates, currentLang);
                const IconComp = getIconComponent(meta.icon);
                return (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 mt-0.5">
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary font-mono">
                              {selectedSection.type}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                selectedSection.is_active
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  selectedSection.is_active ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              {selectedSection.is_active
                                ? currentLang === "ar"
                                  ? "مفعل في الموقع"
                                  : "Active on website"
                                : currentLang === "ar"
                                ? "معطل / مخفي"
                                : "Disabled / Hidden"}
              </span>
            </div>

                          <h2 className="text-lg font-bold text-foreground mt-1.5">
                            {meta.name}
                          </h2>
                          {meta.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {meta.description}
                            </p>
                          )}
                    </div>
            </div>

                      {/* Section Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                      onClick={() => handleToggleActive(selectedSection.id)}
                          className="text-xs gap-1.5"
                    >
                      {selectedSection.is_active ? (
                            <>
                              <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
                              {currentLang === "ar" ? "إخفاء القسم" : "Hide Section"}
                            </>
                          ) : (
                            <>
                              <EyeIcon className="h-4 w-4 text-emerald-600" />
                              {currentLang === "ar" ? "تفعيل القسم" : "Show Section"}
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                      onClick={() => handleDeleteSection(selectedSection.id)}
                          className="text-xs gap-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <TrashIcon className="h-4 w-4" />
                          {currentLang === "ar" ? "حذف" : "Delete"}
                        </Button>
                  </div>
                </div>

                    {/* Content Language Switcher */}
                    <div className="flex items-center justify-between bg-muted/30 p-2 rounded-xl border border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground ps-2">
                          {currentLang === "ar" ? "تعديل نصوص الحقول باللغة:" : "Edit content fields in:"}
                        </span>
              </div>
                      <div className="flex items-center gap-1.5">
                <button
                  type="button"
                          onClick={() => setContentLang("ar")}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            contentLang === "ar"
                              ? "bg-primary text-primary-foreground shadow-xs scale-102"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          العربية (Arabic)
                </button>
                <button
                  type="button"
                          onClick={() => setContentLang("en")}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            contentLang === "en"
                              ? "bg-primary text-primary-foreground shadow-xs scale-102"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          English (الإنجليزية)
                </button>
              </div>
                      </div>
                    </div>
                );
              })()}

              {/* Dedicated Block Form Fields */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <BlockSpecificContentForm
                      section={selectedSection}
                  lang={contentLang}
                      onChange={updateSelectedContent}
                      currentUiLang={currentLang}
                  templates={blockTemplates}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-xs flex flex-col items-center justify-center">
              <AdjustmentsHorizontalIcon className="h-12 w-12 mb-3 opacity-40 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                {currentLang === "ar" ? "حدد قسماً لإدارة وتعديل محتواه" : "Select a section to manage its content"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {currentLang === "ar"
                  ? "انقر على أي قسم من القائمة الجانبية لتعديل نصوصه وصوره وعناصره."
                  : "Click any section from the left sidebar to edit texts, images and repeated items."}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ==========================================
          ADD BLOCK MODAL
      ========================================== */}
      {isAddBlockOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                    {currentLang === "ar" ? "مكتبة قوالب وبلوكات المنصة" : "Platform Block Shapes & Templates"}
                </h2>
                  <Link
                    to="/blocks"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-md"
                  >
                    <span>{currentLang === "ar" ? "إدارة قوالب البلوكات" : "Manage Blocks CRUD"}</span>
                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentLang === "ar"
                    ? "اختر شكل وهيكل البلوك الذي تريده (نصوص، صور، أيقونات، بطاقات، خطوات) لإضافته وتعبئة محتواه"
                    : "Choose the block shape/template (title, desc, image, icon, cards) to add and fill with content"}
                </p>
              </div>
              <button
                onClick={() => setIsAddBlockOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <input
                type="text"
                placeholder={currentLang === "ar" ? "ابحث عن قالب بلوك بالاسم أو الوسم أو الحقول..." : "Search block templates by name, tags, or fields..."}
                value={blockSearch}
                onChange={(e) => setBlockSearch(e.target.value)}
                className="w-full sm:w-80 rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
              />

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
                {[
                  { key: "all", label_ar: "الكل", label_en: "All" },
                  { key: "content_media", label_ar: "محتوى وصور", label_en: "Content & Media" },
                  { key: "cards_grid", label_ar: "شبكة كروت", label_en: "Cards Grid" },
                  { key: "workflow", label_ar: "خطوات ومسارات", label_en: "Workflow" },
                  { key: "quotes", label_ar: "رؤية ورسالة", label_en: "Quotes & Vision" },
                  { key: "support", label_ar: "دعم وتواصل", label_en: "Support & FAQs" },
                  { key: "legal", label_ar: "شروط وبنود", label_en: "Legal" },
                  { key: "hero", label_ar: "هيدر رئيسي", label_en: "Hero Header" },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategoryFilter(cat.key)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      categoryFilter === cat.key
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {currentLang === "ar" ? cat.label_ar : cat.label_en}
                  </button>
                ))}
              </div>
            </div>

            {/* Block Catalog Grid - Matching Blocks CRUD definitions */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-1 max-h-[60vh]">
              {availableBlockTemplates.length === 0 ? (
                <div className="sm:col-span-2 flex flex-col items-center justify-center p-10 text-center text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border">
                  <SparklesIcon className="h-10 w-10 mb-2 opacity-40 text-primary" />
                  <p className="text-xs font-bold text-foreground">
                    {currentLang === "ar" ? "لا توجد قوالب بلوكات مطابقة للبحث" : "No matching block templates found"}
                  </p>
                </div>
              ) : (
                availableBlockTemplates.map((tpl) => {
                  const IconComp = getIconComponent(tpl.icon);
                return (
                  <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleAddBlock(tpl)}
                      className="flex flex-col text-start p-4 rounded-2xl border border-border/80 bg-card hover:bg-primary/5 hover:border-primary hover:shadow-md transition-all duration-200 group relative"
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                            <IconComp className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md">
                            {tpl.category}
                      </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          {currentLang === "ar" ? "متاح للإدراج" : "Available"}
                      </span>
                    </div>

                      {/* Title & ID */}
                      <div className="space-y-0.5 mb-1.5">
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {currentLang === "ar" ? tpl.name_ar : tpl.name_en}
                        </h4>
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          {tpl.id}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {currentLang === "ar" ? tpl.description_ar : tpl.description_en}
                      </p>

                      {/* Shape Tags */}
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {tpl.shape_tags.map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            className="rounded-md bg-muted/60 border border-border/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer fields summary */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[10px] text-muted-foreground mt-auto w-full">
                        <span>
                          {currentLang === "ar"
                            ? `عدد الحقول: ${tpl.fields.length}`
                            : `Input fields: ${tpl.fields.length}`}
                        </span>
                        <span className="font-mono truncate max-w-[150px]">
                          {tpl.fields.map((f) => f.type).join(" • ")}
                        </span>
                      </div>
                  </button>
                );
                })
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button variant="outline" onClick={() => setIsAddBlockOpen(false)}>
                {currentLang === "ar" ? "إغلاق" : "Close"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// GLOBAL SLIDER NOTICE (shared by all header / banner blocks)
// ============================================================================
function GlobalSliderNotice({ lang }: { lang: "ar" | "en" }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <PhotoIcon className="h-5 w-5 text-primary" />
          <h4 className="text-xs font-bold text-foreground">
            {lang === "ar"
              ? "صور السلايدر تُدار من مكتبة السلايدر العامة"
              : "Slider images come from the global slider library"}
          </h4>
        </div>
        <Link
          to="/banners"
          target="_blank"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
        >
          <span>{lang === "ar" ? "إدارة صور السلايدر" : "Manage Slider Images"}</span>
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {lang === "ar"
          ? "هنا تتحكم في نصوص الهيدر/البانر لهذه الصفحة فقط. أما الصور فيرجعها الباك إند تلقائياً كمصفوفة صور (sliders) مع استجابة كل صفحة من مكتبة صور السلايدر العامة."
          : "Here you only manage this page's header/banner texts. Images are returned automatically by the backend as a `sliders` images array with every page response, from the global slider library."}
      </p>
    </div>
  );
}

// ============================================================================
// DEDICATED BLOCK SPECIFIC CONTENT FORM
// ============================================================================
interface BlockSpecificContentFormProps {
  section: PageSection;
  lang: "ar" | "en";
  onChange: (updater: (prev: any) => any) => void;
  currentUiLang: "ar" | "en";
  templates?: BlockTemplate[];
}

function BlockSpecificContentForm({
  section,
  lang,
  onChange,
  currentUiLang,
  templates = [],
}: BlockSpecificContentFormProps) {
  const content = section.content[lang] || {};

  switch (section.type) {
    // 1. Home Header (Hero Carousel)
    case "hero_header": {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "الوسم / البادج العلوي (Badge)" : "Top Badge Text"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "سطر العنوان الأول" : "Title Line 1"}
              value={content.title_line1 || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title_line1: e.target.value }))}
            />
              </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "سطر العنوان الثاني" : "Title Line 2"}
              value={content.title_line2 || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title_line2: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "الكلمة المميزة بلون رئيسي (Highlight)" : "Highlighted Text"}
              value={content.title_highlight || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title_highlight: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {lang === "ar" ? "الوصف التوضيحي الرئيسي" : "Main Description"}
            </label>
            <textarea
              rows={3}
              value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "نص الزر الأساسي (Primary CTA Text)" : "Primary Button Text"}
              value={content.cta_text || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, cta_text: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "رابط الزر الأساسي (Primary CTA Link)" : "Primary Button Link URL"}
              value={content.cta_link || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, cta_link: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "نص الزر الثانوي (Secondary CTA Text)" : "Secondary Button Text"}
              value={content.secondary_cta_text || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, secondary_cta_text: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "رابط الزر الثانوي (Secondary CTA Link)" : "Secondary Button Link URL"}
              value={content.secondary_cta_link || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, secondary_cta_link: e.target.value }))}
            />
          </div>

          <GlobalSliderNotice lang={lang} />
        </div>
      );
    }

    // 2. Home Services Grid (Expanding Cards)
    case "cards_grid_with_icons_images": {
      const services = content.services || [];
      return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {lang === "ar" ? "بطاقات خدمات المنصة (Services Cards)" : "Platform Services Cards"}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {lang === "ar"
                  ? "تظهر هذه البطاقات الـ 3 التفاعلية مباشرة في الصفحة الرئيسية مع خلفية وأيقونة ووصف يظهر عند التمرير."
                  : "Interactive expanding cards rendered on homepage with background image, icon, and hover description."}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  services: [
                    ...(prev.services || []),
                    {
                      id: `serv-${Date.now()}`,
                      title: lang === "ar" ? "خدمة جديدة" : "New Service",
                      description: "",
                      icon: "Scale",
                      image: "/images/service1.webp",
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-colors shrink-0"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>{lang === "ar" ? "إضافة بطاقة خدمة" : "Add Service Card"}</span>
            </button>
          </div>

          <div className="space-y-3">
            {services.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {item.title || (lang === "ar" ? `الخدمة ${idx + 1}` : `Service ${idx + 1}`)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        services: (prev.services || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="p-1 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors"
                    title={lang === "ar" ? "حذف البطاقة" : "Delete Card"}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <BaseTextInput
                    label={lang === "ar" ? "عنوان كرت الخدمة" : "Service Title"}
                    value={item.title || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.services || [])];
                        arr[idx] = { ...arr[idx], title: e.target.value };
                        return { ...prev, services: arr };
                      })
                    }
                  />
                  <IconPicker
                    label={lang === "ar" ? "أيقونة الخدمة (رمز أو صورة)" : "Service Icon (Vector / Image)"}
                    value={item.icon || "Scale"}
                    onChange={(iconVal) =>
                      onChange((prev) => {
                        const arr = [...(prev.services || [])];
                        arr[idx] = { ...arr[idx], icon: iconVal };
                        return { ...prev, services: arr };
                      })
                    }
                    currentLang={lang}
                  />
                </div>

                <div className="space-y-3">
                  <ImageInput
                    label={lang === "ar" ? "صورة خلفية كرت الخدمة" : "Card Background Image"}
                    value={item.image || ""}
                    onChange={(imgVal) =>
                      onChange((prev) => {
                        const arr = [...(prev.services || [])];
                        arr[idx] = { ...arr[idx], image: imgVal };
                        return { ...prev, services: arr };
                      })
                    }
                    currentLang={lang}
                    presetImages={[
                      "/images/service1.webp",
                      "/images/service2.webp",
                      "/images/service3.webp",
                      "/images/slider1.webp",
                      "/images/about.webp",
                    ]}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      {lang === "ar" ? "الوصف التعريفي (يظهر عند التمرير Hover)" : "Hover Description"}
                    </label>
                    <textarea
                      rows={2}
                      value={item.description || ""}
                      onChange={(e) =>
                        onChange((prev) => {
                          const arr = [...(prev.services || [])];
                          arr[idx] = { ...arr[idx], description: e.target.value };
                          return { ...prev, services: arr };
                        })
                      }
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. How To Work (Steps)
    case "steps_workflow_cards": {
      const steps = content.steps || [];
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Section Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "عنوان القسم" : "Section Title"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
                    </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {lang === "ar" ? "الوصف الفرعي" : "Subtitle / Description"}
            </label>
            <textarea
              rows={2}
              value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
                  </div>

          {/* Steps Repeater */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {lang === "ar" ? "خطوات مسار العمل" : "Workflow Steps"} ({steps.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    steps: [
                      ...(prev.steps || []),
                      {
                        id: `step-${Date.now()}`,
                        step_number: `0${(prev.steps?.length || 0) + 1}`,
                        title: lang === "ar" ? "خطوة جديدة" : "New Step",
                        description: "",
                      },
                    ],
                  }))
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                + {lang === "ar" ? "إضافة خطوة" : "Add Step"}
              </button>
                </div>

            {steps.map((step: any, idx: number) => (
              <div
                key={step.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                      {step.step_number || `0${idx + 1}`}
                </span>
                    <span className="text-xs font-bold text-foreground">{step.title}</span>
              </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        steps: (prev.steps || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="text-muted-foreground hover:text-rose-500 text-xs"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <BaseTextInput
                    label={lang === "ar" ? "رقم الخطوة" : "Step Number (e.g. 01)"}
                    value={step.step_number || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.steps || [])];
                        arr[idx] = { ...arr[idx], step_number: e.target.value };
                        return { ...prev, steps: arr };
                      })
                    }
                  />
                  <div className="sm:col-span-2">
                    <BaseTextInput
                      label={lang === "ar" ? "عنوان الخطوة" : "Step Title"}
                      value={step.title || ""}
                      onChange={(e) =>
                        onChange((prev) => {
                          const arr = [...(prev.steps || [])];
                          arr[idx] = { ...arr[idx], title: e.target.value };
                          return { ...prev, steps: arr };
                        })
                      }
                    />
          </div>
        </div>

                <IconPicker
                  label={lang === "ar" ? "أيقونة الخطوة (رمز أو صورة)" : "Step Icon (Vector / Image)"}
                  value={step.icon || "Sparkles"}
                  onChange={(iconVal) =>
                    onChange((prev) => {
                      const arr = [...(prev.steps || [])];
                      arr[idx] = { ...arr[idx], icon: iconVal };
                      return { ...prev, steps: arr };
                    })
                  }
                  currentLang={lang}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "شرح الخطوة" : "Step Description"}
                  </label>
                  <textarea
                    rows={2}
                    value={step.description || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.steps || [])];
                        arr[idx] = { ...arr[idx], description: e.target.value };
                        return { ...prev, steps: arr };
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                  />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      );
    }

    // 4. How To Get Service (Dual Option Cards)
    case "dual_action_cta_cards": {
      const clientOpt = content.client_option || {};
      const lawyerOpt = content.lawyer_option || {};
      return (
          <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Section Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "عنوان القسم الرئيسي" : "Section Title"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
              </div>

          <BaseTextInput
            label={lang === "ar" ? "العنوان الفرعي" : "Subtitle"}
            value={content.subtitle || ""}
            onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
          />

          {/* Client Option Card Form */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase">
              {lang === "ar" ? "بطاقة مسار العملاء (طلب استشارة/قضية)" : "Client Action Card"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BaseTextInput
                label={lang === "ar" ? "عنوان البطاقة" : "Card Title"}
                value={clientOpt.title || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), title: e.target.value },
                  }))
                }
              />
          <BaseTextInput
                label={lang === "ar" ? "ملاحظة / بادج المحامين بالانتظار" : "Waiting Lawyers Note"}
                value={clientOpt.note_text || ""}
            onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), note_text: e.target.value },
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <IconPicker
                label={lang === "ar" ? "أيقونة مسار العميل" : "Client Action Icon"}
                value={clientOpt.icon || "Users"}
                onChange={(iconVal) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), icon: iconVal },
                  }))
                }
                currentLang={lang}
              />
              <ImageInput
                label={lang === "ar" ? "صورة توضيحية للعميل" : "Client Card Image"}
                value={clientOpt.image || ""}
                onChange={(imgVal) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), image: imgVal },
                  }))
                }
                currentLang={lang}
              />
            </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
                {lang === "ar" ? "الوصف" : "Description"}
            </label>
            <textarea
                rows={2}
                value={clientOpt.description || ""}
              onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), description: e.target.value },
                  }))
              }
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BaseTextInput
                label={lang === "ar" ? "نص الزر" : "CTA Button Text"}
                value={clientOpt.cta_text || ""}
            onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), cta_text: e.target.value },
                  }))
            }
          />
          <BaseTextInput
                label={lang === "ar" ? "رابط الزر" : "CTA Button Link"}
                value={clientOpt.cta_link || ""}
            onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), cta_link: e.target.value },
                  }))
            }
          />
        </div>
          </div>

          {/* Lawyer Option Card Form */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase">
              {lang === "ar" ? "بطاقة مسار المحامين (الانضمام للمنصة)" : "Lawyer Action Card"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BaseTextInput
                label={lang === "ar" ? "عنوان البطاقة" : "Card Title"}
                value={lawyerOpt.title || ""}
            onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), title: e.target.value },
                  }))
            }
          />
          <BaseTextInput
                label={lang === "ar" ? "ملاحظة / بادج الفرص المتاحة" : "Opportunities Note"}
                value={lawyerOpt.note_text || ""}
            onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), note_text: e.target.value },
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <IconPicker
                label={lang === "ar" ? "أيقونة مسار المحامي" : "Lawyer Action Icon"}
                value={lawyerOpt.icon || "Briefcase"}
                onChange={(iconVal) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), icon: iconVal },
                  }))
                }
                currentLang={lang}
              />
              <ImageInput
                label={lang === "ar" ? "صورة توضيحية للمحامي" : "Lawyer Card Image"}
                value={lawyerOpt.image || ""}
                onChange={(imgVal) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), image: imgVal },
                  }))
                }
                currentLang={lang}
              />
            </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
                {lang === "ar" ? "الوصف" : "Description"}
            </label>
            <textarea
                rows={2}
                value={lawyerOpt.description || ""}
              onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), description: e.target.value },
                  }))
              }
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BaseTextInput
                label={lang === "ar" ? "نص الزر" : "CTA Button Text"}
                value={lawyerOpt.cta_text || ""}
            onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), cta_text: e.target.value },
                  }))
            }
          />
            <BaseTextInput
                label={lang === "ar" ? "رابط الزر" : "CTA Button Link"}
                value={lawyerOpt.cta_link || ""}
              onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), cta_link: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </div>
      );
    }

    // 5. About Our Story / Title Desc Image Features
    case "title_desc_image_features": {
      const features = content.features || [];
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Section Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "العنوان الرئيسي" : "Section Title"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {lang === "ar" ? "نص النبذة والقصة" : "Narrative Story Description"}
            </label>
            <textarea
              rows={4}
              value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageInput
              label={lang === "ar" ? "الصورة الجانبية لقصة المنصة" : "Our Story Portrait Image"}
              value={content.image || ""}
              onChange={(val) => onChange((prev) => ({ ...prev, image: val }))}
              currentLang={lang}
              presetImages={[
                "/images/about.webp",
                "/images/slider1.webp",
                "/images/slider5.webp",
              ]}
            />
            <BaseTextInput
              label={lang === "ar" ? "نص شارة الاعتماد / الإحصائية" : "Stats Badge Label"}
              value={content.stats_label || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, stats_label: e.target.value }))}
            />
          </div>

          {/* Features Repeater */}
          {features.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                  {lang === "ar" ? "قائمة المميزات ونقاط القوة" : "Features List"} ({features.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                      features: [
                        ...(prev.features || []),
                        {
                          title: lang === "ar" ? "ميزة جديدة" : "New Feature",
                          description: "",
                          icon: "ShieldCheck",
                      },
                    ],
                  }))
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                  + {lang === "ar" ? "إضافة ميزة" : "Add Feature"}
              </button>
            </div>

              {features.map((feat: any, idx: number) => (
              <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                          features: (prev.features || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                      className="text-muted-foreground hover:text-rose-500 text-xs"
                  >
                      <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <BaseTextInput
                      label={lang === "ar" ? "عنوان الميزة" : "Feature Title"}
                      value={feat.title || ""}
                  onChange={(e) =>
                    onChange((prev) => {
                          const arr = [...(prev.features || [])];
                          arr[idx] = { ...arr[idx], title: e.target.value };
                          return { ...prev, features: arr };
                    })
                  }
                />
                    <IconPicker
                      label={lang === "ar" ? "أيقونة الميزة" : "Feature Icon"}
                      value={feat.icon || "ShieldCheck"}
                      onChange={(iconVal) =>
                    onChange((prev) => {
                          const arr = [...(prev.features || [])];
                          arr[idx] = { ...arr[idx], icon: iconVal };
                          return { ...prev, features: arr };
                        })
                      }
                      currentLang={lang}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">
                      {lang === "ar" ? "شرح وتفاصيل الميزة" : "Description"}
                    </label>
                    <textarea
                      rows={2}
                      value={feat.description || ""}
                  onChange={(e) =>
                    onChange((prev) => {
                          const arr = [...(prev.features || [])];
                          arr[idx] = { ...arr[idx], description: e.target.value };
                          return { ...prev, features: arr };
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
              </div>
            ))}
          </div>
          )}
        </div>
      );
    }

    // Title + Desc + Image Only
    case "title_desc_image_only": {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Section Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
          />
          <BaseTextInput
              label={lang === "ar" ? "العنوان الرئيسي" : "Main Title"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {lang === "ar" ? "نص المحتوى والمقال" : "Body Content"}
            </label>
            <textarea
              rows={4}
            value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none leading-relaxed"
            />
          </div>

          <ImageInput
            label={lang === "ar" ? "الصورة المرفقة" : "Featured Image"}
            value={content.image || ""}
            onChange={(imgVal) => onChange((prev) => ({ ...prev, image: imgVal }))}
            currentLang={lang}
            presetImages={[
              "/images/slider1.webp",
              "/images/slider5.webp",
              "/images/slider6.webp",
              "/images/about.webp",
            ]}
          />
        </div>
      );
    }

    // 6. About Values
    case "values_pillars_cards": {
      const values = content.values || [];
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Section Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "عنوان القسم" : "Section Title"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <BaseTextInput
            label={lang === "ar" ? "العنوان الفرعي" : "Subtitle / Explanation"}
            value={content.subtitle || ""}
            onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
          />

          {/* Values Repeater */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {lang === "ar" ? "بطاقات القيم والمبادئ" : "Core Values List"} ({values.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    values: [
                      ...(prev.values || []),
                      {
                        id: `val-${Date.now()}`,
                        title: lang === "ar" ? "قيمة جديدة" : "New Value",
                        description: "",
                        icon: "ShieldCheckIcon",
                      },
                    ],
                  }))
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                + {lang === "ar" ? "إضافة قيمة" : "Add Value"}
              </button>
            </div>

            {values.map((val: any, idx: number) => (
              <div
                key={val.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {lang === "ar" ? `القيمة #${idx + 1}` : `Value #${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        values: (prev.values || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="text-muted-foreground hover:text-rose-500 text-xs"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <BaseTextInput
                    label={lang === "ar" ? "اسم القيمة" : "Value Name"}
                    value={val.title || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.values || [])];
                        arr[idx] = { ...arr[idx], title: e.target.value };
                        return { ...prev, values: arr };
                      })
                    }
                  />
                  <IconPicker
                    label={lang === "ar" ? "أيقونة القيمة (رمز أو صورة)" : "Value Icon (Vector / Image)"}
                    value={val.icon || "ShieldCheck"}
                    onChange={(iconVal) =>
                      onChange((prev) => {
                        const arr = [...(prev.values || [])];
                        arr[idx] = { ...arr[idx], icon: iconVal };
                        return { ...prev, values: arr };
                      })
                    }
                    currentLang={lang}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "شرح القيمة" : "Value Description"}
                  </label>
                  <textarea
                    rows={2}
                    value={val.description || ""}
                  onChange={(e) =>
                    onChange((prev) => {
                        const arr = [...(prev.values || [])];
                        arr[idx] = { ...arr[idx], description: e.target.value };
                        return { ...prev, values: arr };
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 7. About Vision
    case "statement_pillars_cards": {
      const pillars = content.pillars || [];
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Section Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "العنوان (رؤية / رسالة / بيان)" : "Heading (Vision / Mission / Statement)"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {lang === "ar" ? "نص البيان الأساسي (Statement)" : "Main Statement"}
            </label>
            <textarea
              rows={3}
              value={content.statement || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, statement: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <BaseTextInput
            label={lang === "ar" ? "الاقتباس السفلي (اختياري)" : "Footer Quote (optional)"}
            value={content.footer_quote || ""}
            onChange={(e) => onChange((prev) => ({ ...prev, footer_quote: e.target.value }))}
          />

          {/* Pillars Repeater */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {lang === "ar" ? "بطاقات الركائز أو الأهداف" : "Pillar / Objective Cards"} ({pillars.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    pillars: [
                      ...(prev.pillars || []),
                      {
                        id: `pil-${Date.now()}`,
                        title: lang === "ar" ? "ركيزة جديدة" : "New Pillar",
                        description: "",
                        tag: "",
                        icon: "Sparkles",
                      },
                    ],
                  }))
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                + {lang === "ar" ? "إضافة ركيزة" : "Add Pillar"}
              </button>
            </div>

            {pillars.map((pil: any, idx: number) => (
              <div
                key={pil.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {lang === "ar" ? `الركيزة #${idx + 1}` : `Pillar #${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        pillars: (prev.pillars || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="text-muted-foreground hover:text-rose-500 text-xs"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <BaseTextInput
                    label={lang === "ar" ? "عنوان الركيزة" : "Pillar Title"}
                    value={pil.title || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.pillars || [])];
                        arr[idx] = { ...arr[idx], title: e.target.value };
                        return { ...prev, pillars: arr };
                      })
                    }
                  />
                  <BaseTextInput
                    label={lang === "ar" ? "الوسم السفلي (اختياري)" : "Bottom Tag (optional)"}
                    value={pil.tag || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.pillars || [])];
                        arr[idx] = { ...arr[idx], tag: e.target.value };
                        return { ...prev, pillars: arr };
                      })
                    }
                  />
                  <IconPicker
                    label={lang === "ar" ? "أيقونة الركيزة (رمز أو صورة)" : "Pillar Icon (Vector / Image)"}
                    value={pil.icon || "Sparkles"}
                    onChange={(iconVal) =>
                      onChange((prev) => {
                        const arr = [...(prev.pillars || [])];
                        arr[idx] = { ...arr[idx], icon: iconVal };
                        return { ...prev, pillars: arr };
                      })
                    }
                    currentLang={lang}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "شرح الركيزة" : "Pillar Description"}
                  </label>
                  <textarea
                    rows={2}
                    value={pil.description || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.pillars || [])];
                        arr[idx] = { ...arr[idx], description: e.target.value };
                        return { ...prev, pillars: arr };
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 9. Legal Clauses
    case "numbered_legal_clauses": {
      const sections = content.sections || [];
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "عنوان الصفحة الرئيسي" : "Main Title"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "عنوان المقدمة" : "Intro Heading"}
              value={content.intro_title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, intro_title: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "نص المقدمة التمهيدي" : "Intro Content"}
              value={content.intro_content || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, intro_content: e.target.value }))}
            />
          </div>

          {/* Legal Sections List Repeater */}
          <div className="space-y-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {lang === "ar" ? "البنود والفقرات القانونية" : "Legal Clauses & Articles"} ({sections.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    sections: [
                      ...(prev.sections || []),
                      {
                        id: `sec-${Date.now()}`,
                        title: lang === "ar" ? "بند قانوني جديد" : "New Clause",
                        lead: "",
                        content: "",
                        points: [],
                      },
                    ],
                  }))
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                + {lang === "ar" ? "إضافة بند قانوني" : "Add Clause"}
              </button>
            </div>

            {sections.map((secItem: any, idx: number) => (
              <div
                key={secItem.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {lang === "ar" ? `البند #${idx + 1}` : `Clause #${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        sections: (prev.sections || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="text-muted-foreground hover:text-rose-500 text-xs"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <BaseTextInput
                  label={lang === "ar" ? "عنوان البند / الفقرة" : "Clause Title"}
                  value={secItem.title || ""}
                  onChange={(e) =>
                    onChange((prev) => {
                      const arr = [...(prev.sections || [])];
                      arr[idx] = { ...arr[idx], title: e.target.value };
                      return { ...prev, sections: arr };
                    })
                  }
                />

                <BaseTextInput
                  label={lang === "ar" ? "السطر التمهيدي للبند (Lead Text)" : "Lead / Intro Text"}
                  value={secItem.lead || ""}
                  onChange={(e) =>
                    onChange((prev) => {
                      const arr = [...(prev.sections || [])];
                      arr[idx] = { ...arr[idx], lead: e.target.value };
                      return { ...prev, sections: arr };
                    })
                  }
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "نص البند الكامل" : "Clause Body Text"}
                  </label>
                  <textarea
                    rows={3}
                    value={secItem.content || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.sections || [])];
                        arr[idx] = { ...arr[idx], content: e.target.value };
                        return { ...prev, sections: arr };
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 10. Contact Page & Channels (Header, Banner & Dynamic Backend Integration)
    case "contact_channels_info": {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "عنوان الصفحة الرئيسي" : "Page Title"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {lang === "ar" ? "الوصف الفرعي والتمهيدي" : "Description Subtitle"}
            </label>
            <textarea
              rows={2}
              value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <GlobalSliderNotice lang={lang} />

          {/* Dynamic Backend Data Integration Card */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <PhoneIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "الربط التلقائي ببيانات التواصل (Dynamic Contact Data)" : "Dynamic Contact Data Source"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ar"
                      ? "يتم جلب قنوات التواصل (البريد، الهاتف الموحد، العنوان الجغرافي، الروابط الاجتماعية) تلقائياً من الباك إند."
                      : "Official phone numbers, emails, addresses, and social links are automatically retrieved from backend Contact Settings."}
                  </p>
                </div>
              </div>
              <Link
                to="/contact-settings"
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors shrink-0"
              >
                <span>{lang === "ar" ? "تعديل بيانات التواصل" : "Edit Contact Settings"}</span>
                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Complaint Form Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
            <BaseTextInput
              label={lang === "ar" ? "عنوان قسم الشكاوى والمقترحات" : "Complaint Section Title"}
              value={content.complaint_title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, complaint_title: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "وصف وتوضيح قسم الشكاوى" : "Complaint Section Subtitle"}
              value={content.complaint_subtitle || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, complaint_subtitle: e.target.value }))}
            />
          </div>
        </div>
      );
    }

    // 11. FAQ Accordion & Questions (Header, Banner & Dynamic Backend Questions)
    case "faq_accordion_categorized": {
  return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "عنوان صفحة الأسئلة الشائعة" : "FAQ Section Title"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {lang === "ar" ? "الوصف التعريفي" : "Subtitle / Description"}
            </label>
            <textarea
              rows={2}
              value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "نص تلميح حقل البحث" : "Search Input Placeholder"}
              value={content.search_placeholder || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, search_placeholder: e.target.value }))}
            />
          </div>

          <GlobalSliderNotice lang={lang} />

          {/* Dynamic Backend Data Integration Card */}
          <div className="rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "الربط التلقائي ببنك الأسئلة (Dynamic FAQs Repository)" : "Dynamic FAQs Data Source"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ar"
                      ? "يقوم الباك إند بجلب كافة الأسئلة والأجوبة المصنفة تلقائياً من بنك الأسئلة والاستفسارات (/questions) ودمجها مع الصفحة."
                      : "The backend automatically injects published questions and categorizations from the Questions repository (/questions)."}
                  </p>
                </div>
              </div>
              <Link
                to="/questions"
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition-colors shrink-0"
              >
                <span>{lang === "ar" ? "إدارة بنك الأسئلة" : "Manage Questions CRUD"}</span>
                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // 12. Blog Page Header & Dynamic Articles Integration
    case "blog_page_header": {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "عنوان صفحة المدونة" : "Blog Page Title"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {lang === "ar" ? "الوصف التعريفي للمدونة" : "Blog Description"}
            </label>
            <textarea
              rows={2}
              value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "عنوان قسم المقالات" : "Articles Section Heading"}
              value={content.articles_heading || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, articles_heading: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "نص شارة المشتركين" : "Subscribers Badge Text"}
              value={content.subscribers_badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, subscribers_badge: e.target.value }))}
            />
          </div>

          <GlobalSliderNotice lang={lang} />

          {/* Dynamic Backend Data Integration Card */}
          <div className="rounded-xl border border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/20 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
                  <DocumentTextIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "الربط التلقائي بالمقالات والتصنيفات (Dynamic Blogs Integration)" : "Dynamic Blogs & Categories"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ar"
                      ? "يقوم الباك إند بجلب كافة المقالات المنشورة وتصنيفاتها وفلاتر البحث تلقائياً من نظام المدونة (/blogs)."
                      : "The backend automatically injects published blog articles, categories, and pagination from the Blogs module (/blogs)."}
                  </p>
                </div>
              </div>
              <Link
                to="/blogs"
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition-colors shrink-0"
              >
                <span>{lang === "ar" ? "إدارة المقالات والمدونة" : "Manage Blogs & Categories"}</span>
                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // 13. General Page Hero Banner Header
    case "page_header_banner": {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={lang === "ar" ? "الوسم (Badge)" : "Badge"}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={lang === "ar" ? "عنوان الهيدر الرئيسي" : "Page Title"}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {lang === "ar" ? "الوصف التوضيحي" : "Description / Subtitle"}
            </label>
            <textarea
              rows={2}
              value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <GlobalSliderNotice lang={lang} />
        </div>
      );
    }

    default:
      return (
        <div className="text-xs text-muted-foreground p-4 text-center">
          {currentUiLang === "ar"
            ? "لا توجد حقول محددة لهذا البلوك."
            : "No specific fields defined for this block type."}
        </div>
      );
  }
}
