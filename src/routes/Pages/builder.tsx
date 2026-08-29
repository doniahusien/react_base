import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowPathIcon,
  CheckIcon,
  PlusIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { pagesService } from "../../services/pagesService";
import { blockTemplatesService } from "../../services/blockTemplatesService";
import {
  getBlockDefaultContent,
  normalizeBlockType,
} from "../../mocks/blockTemplatesMock";
import { toast } from "../../stores/toast";
import { SectionsSidebar } from "../../components/PageBuilder/SectionsSidebar";
import { SectionEditorPanel } from "../../components/PageBuilder/SectionEditorPanel";
import { AddBlockModal } from "../../components/PageBuilder/AddBlockModal";
import type {
  Page,
  PageSection,
  BlockType,
} from "../../types/pageBuilder";
import type { BlockTemplate } from "../../types/blocks";

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
        {/* LEFT PANEL: SECTIONS LIST */}
        <SectionsSidebar
          sections={sections}
          selectedSectionId={selectedSectionId}
          templates={blockTemplates}
          currentLang={currentLang}
          onSelect={setSelectedSectionId}
          onToggleActive={handleToggleActive}
          onDuplicate={handleDuplicateSection}
          onDelete={handleDeleteSection}
          onAdd={() => setIsAddBlockOpen(true)}
        />

        {/* RIGHT MAIN AREA: SECTION CONTENT FORM */}
        <SectionEditorPanel
          section={selectedSection}
          templates={blockTemplates}
          currentLang={currentLang}
          contentLang={contentLang}
          onContentLangChange={setContentLang}
          onToggleActive={handleToggleActive}
          onDelete={handleDeleteSection}
          onChange={updateSelectedContent}
        />
      </div>

      {/* ==========================================
          ADD BLOCK MODAL
      ========================================== */}
      {isAddBlockOpen && (
        <AddBlockModal
          availableTemplates={availableBlockTemplates}
          blockSearch={blockSearch}
          onBlockSearchChange={setBlockSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          currentLang={currentLang}
          onAddBlock={handleAddBlock}
          onClose={() => setIsAddBlockOpen(false)}
        />
      )}
    </div>
  );
}