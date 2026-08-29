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
  const { t } = useTranslation();
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
          title={section.is_active ? t("TITLES.visible") : t("TITLES.hidden")}
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
          title={t("TITLES.duplicateSection")}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <DocumentDuplicateIcon className="h-4 w-4" />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          title={t("TITLES.deleteSection")}
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
  const [contentLang, setContentLang] = useState<"ar" | "en">(currentLang);

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
          toast.error(t("MESSAGES.pageNotFound"));
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
    toast.success(t("MESSAGES.sectionDuplicated"));
  };

  // Delete Section
  const handleDeleteSection = (secId: string) => {
    if (!window.confirm(t("MESSAGES.confirmDeleteSection"))) return;

    setSections((prev) => {
      const next = prev.filter((s) => s.id !== secId);
      if (selectedSectionId === secId) {
        setSelectedSectionId(next[0]?.id || null);
      }
      return next;
    });
    setHasUnsavedChanges(true);
    toast.success(t("MESSAGES.sectionRemoved"));
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
    toast.success(t("MESSAGES.blockAdded"));
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
      toast.success(t("MESSAGES.pageSaved"));
    } catch (e) {
      toast.error(t("MESSAGES.errorSavingPage"));
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
            {t("TITLES.loadingPageContent")}
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
              {sections.length} {t("TITLES.sectionsConfigured")}
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
              {t("TITLES.unsavedChanges")}
            </span>
          )}

          <Button
            variant="outline"
            onClick={() => setIsAddBlockOpen(true)}
            className="gap-1.5 text-xs"
          >
            <PlusIcon className="h-4 w-4" />
              {t("BUTTONS.addSection")}
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
            {saving ? t("BUTTONS.saving") : t("BUTTONS.saveChanges")}
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
                {t("TITLES.pageSections")}
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
                  {t("TITLES.noSectionsYet")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t("LABELS.noSectionsDesc")}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddBlockOpen(true)}
                  className="mt-3 text-xs"
                >
{t("BUTTONS.addFirstSection")}
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
              {t("BUTTONS.addNewSection")}
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
                                ? t("TITLES.activeOnWebsite")
                                : t("TITLES.disabledHidden")}
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
                              {t("BUTTONS.hideSection")}
                            </>
                          ) : (
                            <>
                              <EyeIcon className="h-4 w-4 text-emerald-600" />
                              {t("BUTTONS.showSection")}
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
                          {t("BUTTONS.delete")}
                        </Button>
                  </div>
                </div>

                    {/* Content Language Switcher */}
                    <div className="flex items-center justify-between bg-muted/30 p-2 rounded-xl border border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground ps-2">
                          {t("TITLES.editContentFieldsIn")}
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
                          {t("TITLES.languageArabic")}
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
                          {t("TITLES.languageEnglish")}
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
                {t("TITLES.selectSectionToManage")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {t("LABELS.selectSectionToManageDesc")}
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
                    {t("TITLES.blocksLibraryTitle")}
                  </h2>
                  <Link
                    to="/blocks"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-md"
                  >
                    <span>{t("BUTTONS.manageBlocks")}</span>
                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("LABELS.blocksLibraryDesc")}
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
                placeholder={t("LABELS.searchBlockTemplates")}
                value={blockSearch}
                onChange={(e) => setBlockSearch(e.target.value)}
                className="w-full sm:w-80 rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
              />

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
                {[
                  { key: "all", tKey: "TITLES.all" },
                  { key: "content_media", tKey: "TITLES.blockCatContentMedia" },
                  { key: "cards_grid", tKey: "TITLES.blockCatCardsGrid" },
                  { key: "workflow", tKey: "TITLES.blockCatWorkflow" },
                  { key: "quotes", tKey: "TITLES.blockCatQuotes" },
                  { key: "support", tKey: "TITLES.blockCatSupport" },
                  { key: "legal", tKey: "TITLES.blockCatLegal" },
                  { key: "hero", tKey: "TITLES.blockCatHero" },
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
                    {t(cat.tKey)}
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
                    {t("LABELS.noMatchingBlockTemplates")}
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
                          {t("STATUS.available")}
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
                          {t("TITLES.inputFieldsCount", { count: tpl.fields.length })}
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
                {t("BUTTONS.close")}
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
  const { i18n } = useTranslation();
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <PhotoIcon className="h-5 w-5 text-primary" />
          <h4 className="text-xs font-bold text-foreground">
            {i18n.t("TITLES.sliderGlobalTitle", { lng: lang })}
          </h4>
        </div>
        <Link
          to="/sliders"
          target="_blank"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
        >
          <span>{i18n.t("BUTTONS.manageSliderImages", { lng: lang })}</span>
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {i18n.t("LABELS.sliderGlobalDesc", { lng: lang })}
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
  const { t, i18n } = useTranslation();
  const ct = (key: string, opts?: Record<string, any>) => {
    const translated = i18n.t(key, { lng: currentUiLang, ...opts });
    return key.startsWith("FIELDS.")
      ? `${translated} (${lang.toUpperCase()})`
      : translated;
  };
  const contentT = (key: string, opts?: Record<string, any>) =>
    i18n.t(key, { lng: lang, ...opts });
  const content = section.content[lang] || {};

  switch (section.type) {
    // 1. Home Header (Hero Carousel)
    case "hero_header": {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.topBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.titleLine1")}
              value={content.title_line1 || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title_line1: e.target.value }))}
            />
              </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.titleLine2")}
              value={content.title_line2 || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title_line2: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.highlightText")}
              value={content.title_highlight || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title_highlight: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {ct("FIELDS.mainDescription")}
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
              label={ct("FIELDS.primaryCtaText")}
              value={content.cta_text || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, cta_text: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.primaryCtaLink")}
              value={content.cta_link || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, cta_link: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.secondaryCtaText")}
              value={content.secondary_cta_text || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, secondary_cta_text: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.secondaryCtaLink")}
              value={content.secondary_cta_link || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, secondary_cta_link: e.target.value }))}
            />
          </div>

          <GlobalSliderNotice lang={currentUiLang} />
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
                {ct("TITLES.servicesCards")}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {ct("LABELS.servicesCardsDesc")}
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
                      title: contentT("TITLES.newService"),
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
              <span>{ct("BUTTONS.addServiceCard")}</span>
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
                      {item.title || (ct("TITLES.serviceNumber", { count: idx + 1 }))}
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
                    title={ct("TITLES.deleteCard")}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <BaseTextInput
                    label={ct("FIELDS.serviceTitle")}
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
                    label={ct("FIELDS.serviceIcon")}
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
                    label={ct("FIELDS.cardBackgroundImage")}
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
                      {ct("FIELDS.hoverDescription")}
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
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.sectionTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
                    </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {ct("FIELDS.subtitleDescription")}
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
                {ct("TITLES.workflowSteps")} ({steps.length})
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
                        title: contentT("TITLES.newStep"),
                        description: "",
                      },
                    ],
                  }))
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                + {ct("BUTTONS.addStep")}
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
                    label={ct("FIELDS.stepNumber")}
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
                      label={ct("FIELDS.stepTitle")}
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
                  label={ct("FIELDS.stepIcon")}
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
                    {ct("FIELDS.stepDescription")}
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
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.sectionTitleMain")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
              </div>

          <BaseTextInput
            label={ct("FIELDS.subtitle")}
            value={content.subtitle || ""}
            onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
          />

          {/* Client Option Card Form */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase">
              {ct("TITLES.clientActionCard")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BaseTextInput
                label={ct("FIELDS.cardTitle")}
                value={clientOpt.title || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), title: e.target.value },
                  }))
                }
              />
          <BaseTextInput
                label={ct("FIELDS.waitingLawyersNote")}
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
                label={ct("FIELDS.clientActionIcon")}
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
                label={ct("FIELDS.clientCardImage")}
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
                {ct("FIELDS.description")}
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
                label={ct("FIELDS.ctaButtonText")}
                value={clientOpt.cta_text || ""}
            onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), cta_text: e.target.value },
                  }))
            }
          />
          <BaseTextInput
                label={ct("FIELDS.ctaButtonLink")}
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
              {ct("TITLES.lawyerActionCard")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BaseTextInput
                label={ct("FIELDS.cardTitle")}
                value={lawyerOpt.title || ""}
            onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), title: e.target.value },
                  }))
            }
          />
          <BaseTextInput
                label={ct("FIELDS.opportunitiesNote")}
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
                label={ct("FIELDS.lawyerActionIcon")}
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
                label={ct("FIELDS.lawyerCardImage")}
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
                {ct("FIELDS.description")}
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
                label={ct("FIELDS.ctaButtonText")}
                value={lawyerOpt.cta_text || ""}
            onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), cta_text: e.target.value },
                  }))
            }
          />
            <BaseTextInput
                label={ct("FIELDS.ctaButtonLink")}
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
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.mainTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {ct("FIELDS.narrativeStoryDesc")}
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
              label={ct("FIELDS.storyPortraitImage")}
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
              label={ct("FIELDS.statsBadgeLabel")}
              value={content.stats_label || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, stats_label: e.target.value }))}
            />
          </div>

          {/* Features Repeater */}
          {features.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                  {ct("TITLES.featuresList")} ({features.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                      features: [
                        ...(prev.features || []),
                        {
                          title: contentT("TITLES.newFeature"),
                          description: "",
                          icon: "ShieldCheck",
                      },
                    ],
                  }))
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                  + {ct("BUTTONS.addFeature")}
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
                      label={ct("FIELDS.featureTitle")}
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
                      label={ct("FIELDS.featureIcon")}
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
                      {ct("FIELDS.featureDescription")}
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
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
          />
          <BaseTextInput
              label={ct("FIELDS.titleOnlyMainTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {ct("FIELDS.bodyContent")}
            </label>
            <textarea
              rows={4}
            value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none leading-relaxed"
            />
          </div>

          <ImageInput
            label={ct("FIELDS.featuredImage")}
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
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.sectionTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <BaseTextInput
            label={ct("FIELDS.subtitleExplanation")}
            value={content.subtitle || ""}
            onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
          />

          {/* Values Repeater */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {ct("TITLES.coreValuesList")} ({values.length})
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
                        title: contentT("TITLES.newValue"),
                        description: "",
                        icon: "ShieldCheckIcon",
                      },
                    ],
                  }))
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                + {ct("BUTTONS.addValue")}
              </button>
            </div>

            {values.map((val: any, idx: number) => (
              <div
                key={val.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {ct("TITLES.valueNumber", { count: idx + 1 })}
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
                    label={ct("FIELDS.valueName")}
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
                    label={ct("FIELDS.valueIcon")}
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
                    {ct("FIELDS.valueDescription")}
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
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.headingVisionMission")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {ct("FIELDS.mainStatement")}
            </label>
            <textarea
              rows={3}
              value={content.statement || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, statement: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <BaseTextInput
            label={ct("FIELDS.footerQuote")}
            value={content.footer_quote || ""}
            onChange={(e) => onChange((prev) => ({ ...prev, footer_quote: e.target.value }))}
          />

          {/* Pillars Repeater */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {ct("TITLES.pillarCards")} ({pillars.length})
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
                        title: contentT("TITLES.newPillar"),
                        description: "",
                        tag: "",
                        icon: "Sparkles",
                      },
                    ],
                  }))
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                + {ct("BUTTONS.addPillar")}
              </button>
            </div>

            {pillars.map((pil: any, idx: number) => (
              <div
                key={pil.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {ct("TITLES.pillarNumber", { count: idx + 1 })}
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
                    label={ct("FIELDS.pillarTitle")}
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
                    label={ct("FIELDS.bottomTag")}
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
                    label={ct("FIELDS.pillarIcon")}
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
                    {ct("FIELDS.pillarDescription")}
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
              label={ct("FIELDS.badge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.pageMainTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.introHeading")}
              value={content.intro_title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, intro_title: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.introContent")}
              value={content.intro_content || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, intro_content: e.target.value }))}
            />
          </div>

          {/* Legal Sections List Repeater */}
          <div className="space-y-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {ct("TITLES.legalClauses")} ({sections.length})
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
                        title: contentT("TITLES.newClause"),
                        lead: "",
                        content: "",
                        points: [],
                      },
                    ],
                  }))
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                + {ct("BUTTONS.addClause")}
              </button>
            </div>

            {sections.map((secItem: any, idx: number) => (
              <div
                key={secItem.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {ct("TITLES.clauseNumber", { count: idx + 1 })}
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
                  label={ct("FIELDS.clauseTitle")}
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
                  label={ct("FIELDS.clauseLead")}
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
                    {ct("FIELDS.clauseBody")}
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
              label={ct("FIELDS.badge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.pageMainTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {ct("FIELDS.descriptionSubtitle")}
            </label>
            <textarea
              rows={2}
              value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <GlobalSliderNotice lang={currentUiLang} />

          {/* Dynamic Backend Data Integration Card */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <PhoneIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {ct("TITLES.dynamicContactData")}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {ct("LABELS.dynamicContactDataDesc")}
                  </p>
                </div>
              </div>
              <Link
                to="/contact-settings"
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors shrink-0"
              >
                <span>{ct("BUTTONS.editContactSettings")}</span>
                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Complaint Form Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
            <BaseTextInput
              label={ct("FIELDS.complaintSectionTitle")}
              value={content.complaint_title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, complaint_title: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.complaintSectionSubtitle")}
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
              label={ct("FIELDS.badge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.faqSectionTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {ct("FIELDS.faqSubtitleDesc")}
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
              label={ct("FIELDS.searchInputPlaceholder")}
              value={content.search_placeholder || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, search_placeholder: e.target.value }))}
            />
          </div>

          <GlobalSliderNotice lang={currentUiLang} />

          {/* Dynamic Backend Data Integration Card */}
          <div className="rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {ct("TITLES.dynamicFaqs")}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {ct("LABELS.dynamicFaqsDesc")}
                  </p>
                </div>
              </div>
              <Link
                to="/questions"
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition-colors shrink-0"
              >
                <span>{ct("BUTTONS.manageQuestions")}</span>
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
              label={ct("FIELDS.badge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.blogPageTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {ct("FIELDS.blogDescription")}
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
              label={ct("FIELDS.articlesSectionHeading")}
              value={content.articles_heading || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, articles_heading: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.subscribersBadge")}
              value={content.subscribers_badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, subscribers_badge: e.target.value }))}
            />
          </div>

          <GlobalSliderNotice lang={currentUiLang} />

          {/* Dynamic Backend Data Integration Card */}
          <div className="rounded-xl border border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/20 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
                  <DocumentTextIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {ct("TITLES.dynamicBlogs")}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {ct("LABELS.dynamicBlogsDesc")}
                  </p>
                </div>
              </div>
              <Link
                to="/blogs"
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition-colors shrink-0"
              >
                <span>{ct("BUTTONS.manageBlogs")}</span>
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
              label={ct("FIELDS.badge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.pageHeroTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {ct("FIELDS.heroDescriptionSubtitle")}
            </label>
            <textarea
              rows={2}
              value={content.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <GlobalSliderNotice lang={currentUiLang} />
        </div>
      );
    }

    default:
      return (
        <div className="text-xs text-muted-foreground p-4 text-center">
          {t("LABELS.noFieldBlocks")}
        </div>
      );
  }
}
