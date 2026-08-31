import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  SquaresPlusIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
  TagIcon,
  CheckBadgeIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentDuplicateIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { Filter, type FilterSection } from "../../components/Filter/Filter";
import { Pagination } from "../../components/UI/Table/Pagination";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSwitchInput } from "../../components/Inputs/BaseSwitchInput";
import { BaseSelectInput } from "../../components/Inputs/BaseSelectInput";
import { IconPicker, getIconComponent } from "../../components/Inputs/IconPicker";
import { blockTemplatesService } from "../../services/blockTemplatesService";
import { toast } from "../../stores/toast";
import type { BlockTemplate, BlockCategory, FieldDefinition, FieldInputType } from "../../types/blocks";

/**
 * `default_content` is required on write and seeds a section's content when the
 * block is added to a page, so it is derived from the field schema.
 */
function buildDefaultContent(fields: FieldDefinition[]) {
  const shape: Record<string, any> = {};
  for (const field of fields) {
    shape[field.key] = field.type === "repeater" ? [] : field.default_value ?? "";
  }
  return { ar: { ...shape }, en: { ...shape } };
}

const CATEGORY_TITLE_KEYS: Record<string, string> = {
  content_media: "TITLES.blockCatContentMedia",
  cards_grid: "TITLES.blockCatCardsGrid",
  workflow: "TITLES.blockCatWorkflow",
  quotes: "TITLES.blockCatQuotes",
  support: "TITLES.blockCatSupport",
  legal: "TITLES.blockCatLegal",
  hero: "TITLES.blockCatHero",
};

export default function BlocksShowAll() {
  const { t, i18n } = useTranslation();
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

  const goToPage = (next: number) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(next));
      return p;
    });
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BlockTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlockTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    category: BlockCategory;
    icon: string;
    shape_tags_str: string;
    is_active: boolean;
    fields: FieldDefinition[];
  }>({
    id: "",
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    category: "content_media",
    icon: "Sparkles",
    shape_tags_str: "title, description, image, icon",
    is_active: true,
    fields: [],
  });

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

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      id: `custom_block_${Date.now()}`,
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      category: "content_media",
      icon: "Sparkles",
      shape_tags_str: "title, description, image",
      is_active: true,
      fields: [
        { key: "badge", label_ar: "الوسم (Badge)", label_en: "Badge", type: "text" },
        { key: "title", label_ar: "العنوان الرئيسي", label_en: "Main Title", type: "text", required: true },
        { key: "description", label_ar: "الوصف", label_en: "Description", type: "textarea", required: true },
        { key: "image", label_ar: "رابط الصورة", label_en: "Image URL", type: "image", default_value: "/images/slider1.webp" },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tpl: BlockTemplate) => {
    setEditingTemplate(tpl);
    setFormData({
      id: tpl.id,
      name_ar: tpl.name_ar,
      name_en: tpl.name_en,
      description_ar: tpl.description_ar,
      description_en: tpl.description_en,
      category: tpl.category,
      icon: tpl.icon,
      shape_tags_str: tpl.shape_tags.join(", "),
      is_active: tpl.is_active,
      fields: JSON.parse(JSON.stringify(tpl.fields || [])),
    });
    setIsModalOpen(true);
  };

  const handleAddField = () => {
    setFormData((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          key: `field_${Date.now()}`,
          label_ar: "حقل جديد",
          label_en: "New Field",
          type: "text" as FieldInputType,
          required: false,
        },
      ],
    }));
  };

  const handleRemoveField = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateField = (idx: number, patch: Partial<FieldDefinition>) => {
    setFormData((prev) => {
      const arr = [...prev.fields];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, fields: arr };
    });
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_ar.trim() || !formData.id.trim()) {
      toast.error(t("MESSAGES.blockNameAndIdRequired"));
      return;
    }

    setSaving(true);
    try {
      const tags = formData.shape_tags_str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Partial<BlockTemplate> & { id: string } = {
        id: formData.id.trim().toLowerCase().replace(/\s+/g, "_"),
        name_ar: formData.name_ar.trim(),
        name_en: formData.name_en.trim() || formData.name_ar.trim(),
        description_ar: formData.description_ar.trim(),
        description_en:
          formData.description_en.trim() || formData.description_ar.trim(),
        category: formData.category,
        icon: formData.icon,
        shape_tags: tags,
        is_active: formData.is_active,
        fields: formData.fields,
        default_content:
          editingTemplate?.default_content ?? buildDefaultContent(formData.fields),
      };

      await blockTemplatesService.save(payload, !editingTemplate);
      toast.success(
        editingTemplate
          ? t("MESSAGES.blockTemplateUpdated")
          : t("MESSAGES.blockTemplateCreated")
      );
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err: any) {
      toast.error(
        t("MESSAGES.blockTemplateSaveFailed"),
        err?.response?.data?.message
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (tpl: BlockTemplate) => {
    try {
      const newStatus = await blockTemplatesService.toggleStatus(tpl.id);
      setTemplates((prev) =>
        prev.map((t) => (t.id === tpl.id ? { ...t, is_active: newStatus } : t))
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

  // The API refuses to delete a block that page sections still use.
  const handleDeleteTemplate = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await blockTemplatesService.remove(deleteTarget.id);
      toast.success(t("MESSAGES.blockTemplateDeleted"));
      setDeleteTarget(null);
      // Removing the last card of a page would otherwise leave an empty view.
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

  const filterSections: FilterSection[] = useMemo(
    () => [
      {
        type: "select",
        key: "category",
        label: t("TITLES.category"),
        placeholder: t("TITLES.all"),
        icon: TagIcon,
        items: categoryOptions.map((cat) => ({
          id: cat,
          name: t(CATEGORY_TITLE_KEYS[cat] || cat),
        })),
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
          <Button onClick={handleOpenCreate} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            {t("TITLES.add", { entity: t("TITLES.block") })}
          </Button>
        }
      />

      {/* Toolbar: Total + Filter dropdown */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-foreground">
            {t("TITLES.blocks")}
          </h2>
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold tabular-nums text-primary-foreground shadow-sm">
            {meta.total}
          </span>
        </div>
        <Filter sections={filterSections} />
      </div>

      {/* Grid of Block Templates */}
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
          <Button onClick={handleOpenCreate} className="mt-4 gap-2 text-xs">
            <PlusIcon className="h-4 w-4" />
            {t("LABELS.createTemplate")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tpl) => {
            const IconComp = getIconComponent(tpl.icon);
            return (
              <section
                key={tpl.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
                  tpl.is_active
                    ? "border-border/70 hover:border-primary/40"
                    : "border-border/40 bg-muted/20 opacity-75 hover:opacity-100"
                }`}
              >
                {/* Top accent bar */}
                <div
                  className={`h-1 w-full bg-linear-to-r transition-colors ${
                    tpl.is_active
                      ? "from-primary via-secondary to-transparent"
                      : "from-muted-foreground/20 to-transparent"
                  }`}
                />

                {/* Header: Icon + Category + Status */}
                <div className="flex items-start justify-between gap-4 px-5 pt-5">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 transition-transform group-hover:scale-105 group-hover:rotate-3 ${
                        tpl.is_active
                          ? "bg-linear-to-br from-primary/15 to-secondary/10 text-primary ring-primary/20"
                          : "bg-muted text-muted-foreground ring-border/50"
                      }`}
                    >
                      <IconComp className="h-6 w-6" />
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

                  {/* Status toggle pill */}
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

                {/* Title & Description */}
                <div className="flex flex-1 flex-col px-5 pb-2 pt-4">
                  <h3 className="text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {currentLang === "ar" ? tpl.name_ar : tpl.name_en}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                    {currentLang === "ar" ? tpl.description_ar : tpl.description_en}
                  </p>

                  {/* Shape Tags */}
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

                {/* Footer: Fields + Actions */}
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
                      onClick={() => handleOpenEdit(tpl)}
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

      {/* ==========================================
          ADD / EDIT BLOCK TEMPLATE MODAL
      ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <SquaresPlusIcon className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-bold">
                    {editingTemplate
                      ? t("LABELS.editBlockTemplate")
                      : t("LABELS.createBlockTemplate")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("LABELS.blockTemplateModalDesc")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseTextInput
                  name="name_ar"
                  label={t("LABELS.blockTemplateNameArabic")}
                  value={formData.name_ar}
                  onInput={(val) => setFormData((prev) => ({ ...prev, name_ar: val }))}
                  placeholder={t("LABELS.blockTemplateNameArabicPlaceholder")}
                />
                <BaseTextInput
                  name="name_en"
                  label={t("LABELS.blockTemplateNameEnglish")}
                  value={formData.name_en}
                  onInput={(val) => setFormData((prev) => ({ ...prev, name_en: val }))}
                  placeholder={t("LABELS.blockTemplateNameEnglishPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseTextInput
                  name="id"
                  label={t("LABELS.blockTypeSlug")}
                  value={formData.id}
                  onInput={(val) => setFormData((prev) => ({ ...prev, id: val }))}
                  placeholder={t("LABELS.blockTypeSlugPlaceholder")}
                  disabled={!!editingTemplate}
                />
                <BaseSelectInput
                  name="category"
                  label={t("TITLES.category")}
                  items={[
                    { id: "content_media", name: t("TITLES.blockCatContentMedia") },
                    { id: "cards_grid", name: t("TITLES.blockCatCardsGrid") },
                    { id: "workflow", name: t("TITLES.blockCatWorkflow") },
                    { id: "quotes", name: t("TITLES.blockCatQuotes") },
                    { id: "support", name: t("TITLES.blockCatSupport") },
                    { id: "legal", name: t("TITLES.blockCatLegal") },
                    { id: "hero", name: t("TITLES.blockCatHero") },
                  ]}
                  value={{ id: formData.category, name: t(CATEGORY_TITLE_KEYS[formData.category] || formData.category) }}
                  onChange={(val) => {
                    if (val && !Array.isArray(val)) {
                      setFormData((prev) => ({ ...prev, category: val.id as BlockCategory }));
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IconPicker
                  label={t("LABELS.blockTemplateIcon")}
                  value={formData.icon}
                  onChange={(iconKey) => setFormData((prev) => ({ ...prev, icon: iconKey }))}
                  currentLang={currentLang}
                />
                <BaseTextInput
                  name="shape_tags_str"
                  label={t("LABELS.blockShapeTags")}
                  value={formData.shape_tags_str}
                  onInput={(val) => setFormData((prev) => ({ ...prev, shape_tags_str: val }))}
                  placeholder={t("LABELS.blockShapeTagsPlaceholder")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {t("LABELS.blockDescription")}
                </label>
                <textarea
                  rows={2}
                  value={formData.description_ar}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description_ar: e.target.value }))
                  }
                  placeholder={t("LABELS.blockDescriptionPlaceholder")}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              {/* Dynamic Field Builder (Input Shapes) */}
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {t("LABELS.blockFieldsSchema")}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {t("LABELS.blockFieldsSchemaDesc")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddField}
                    className="gap-1.5 text-xs font-bold text-primary"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    {t("LABELS.addField")}
                  </Button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
                  {formData.fields.map((field, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-xl border border-border bg-muted/20 p-2.5 text-xs"
                    >
                      <span className="font-bold text-muted-foreground w-6 text-center">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => handleUpdateField(idx, { key: e.target.value })}
                        placeholder="field_key"
                        className="w-28 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={field.label_ar}
                        onChange={(e) => handleUpdateField(idx, { label_ar: e.target.value })}
                        placeholder="تسمية الحقل (عربي)"
                        className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                      />
                      <BaseSelectInput
                        name={`field_type_${idx}`}
                        items={[
                          { id: "text", name: t("LABELS.fieldTypeText") },
                          { id: "textarea", name: t("LABELS.fieldTypeTextarea") },
                          { id: "image", name: t("LABELS.fieldTypeImage") },
                          { id: "icon", name: t("LABELS.fieldTypeIcon") },
                          { id: "url", name: t("LABELS.fieldTypeUrl") },
                          { id: "repeater", name: t("LABELS.fieldTypeRepeater") },
                        ]}
                        value={{ id: field.type, name: t(`LABELS.fieldType${field.type.charAt(0).toUpperCase() + field.type.slice(1)}`) }}
                        onChange={(val) => {
                          if (val && !Array.isArray(val)) {
                            handleUpdateField(idx, { type: val.id as FieldInputType });
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t("BUTTONS.cancel")}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? t("BUTTONS.saving") : t("LABELS.saveBlockTemplate")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
