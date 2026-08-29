import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SquaresPlusIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
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
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSwitchInput } from "../../components/Inputs/BaseSwitchInput";
import { IconPicker, getIconComponent } from "../../components/Inputs/IconPicker";
import { blockTemplatesService } from "../../services/blockTemplatesService";
import { toast } from "../../stores/toast";
import type { BlockTemplate, BlockCategory, FieldDefinition, FieldInputType } from "../../types/blocks";

export default function BlocksShowAll() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || "ar").startsWith("en") ? "en" : "ar";

  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BlockTemplate | null>(null);
  const [saving, setSaving] = useState(false);

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
      const data = await blockTemplatesService.list();
      setTemplates(data);
    } catch {
      toast.error(t("MESSAGES.failedToLoadBlocks"));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
        description_en: formData.description_en.trim(),
        category: formData.category,
        icon: formData.icon,
        shape_tags: tags,
        is_active: formData.is_active,
        fields: formData.fields,
      };

      await blockTemplatesService.save(payload, !editingTemplate);
      toast.success(
        editingTemplate
          ? t("MESSAGES.blockTemplateUpdated")
          : t("MESSAGES.blockTemplateCreated")
      );
      setIsModalOpen(false);
      fetchTemplates();
    } catch {
      toast.error(t("MESSAGES.blockTemplateSaveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (tpl: BlockTemplate) => {
    const newStatus = await blockTemplatesService.toggleStatus(tpl.id);
    setTemplates((prev) =>
      prev.map((t) => (t.id === tpl.id ? { ...t, is_active: newStatus } : t))
    );
    toast.success(
      newStatus ? t("MESSAGES.blockEnabled") : t("MESSAGES.blockDisabled")
    );
  };

  const handleDeleteTemplate = async (tpl: BlockTemplate) => {
    if (
      !window.confirm(
        t("MESSAGES.confirmDeleteBlockTemplate", {
          name: currentLang === "ar" ? tpl.name_ar : tpl.name_en,
        })
      )
    )
      return;

    await blockTemplatesService.remove(tpl.id);
    toast.success(t("MESSAGES.blockTemplateDeleted"));
    fetchTemplates();
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchSearch =
        t.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description_ar.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = categoryFilter === "all" || t.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [templates, searchQuery, categoryFilter]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="blocks"
        subtitle="blocksDesc"
        icon={SquaresPlusIcon}
        total={templates.length}
        path={[
          { label: "dashboard", href: "/", icon: Squares2X2Icon },
          { label: "blocks", icon: SquaresPlusIcon },
        ]}
        rightActions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            {t("TITLES.add", { count: t("TITLES.block") })}
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
          <input
            type="text"
            placeholder={t("LABELS.searchBlocks")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pe-3 ps-9 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
{[ 
            { key: "all", label: "TITLES.all" },
            { key: "content_media", label: "TITLES.blockCatContentMedia" },
            { key: "cards_grid", label: "TITLES.blockCatCardsGrid" },
            { key: "workflow", label: "TITLES.blockCatWorkflow" },
            { key: "quotes", label: "TITLES.blockCatQuotes" },
            { key: "support", label: "TITLES.blockCatSupport" },
            { key: "legal", label: "TITLES.blockCatLegal" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategoryFilter(tab.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                categoryFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Block Templates */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl border border-border/70 bg-card p-5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tpl) => {
            const IconComp = getIconComponent(tpl.icon);
            return (
              <div
                key={tpl.id}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition-all hover:shadow-md ${
                  tpl.is_active
                    ? "border-border/80 bg-card hover:border-primary/40"
                    : "border-border/40 bg-muted/20 opacity-70"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon + Category + Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase font-mono">
                          {tpl.category}
                        </span>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {tpl.id}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(tpl)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                        tpl.is_active
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {tpl.is_active ? (
                        <>
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {t("STATUS.available")}
                        </>
                      ) : (
                        <>
                          <span className="size-1.5 rounded-full bg-zinc-400" />
                          {t("STATUS.disabled")}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {currentLang === "ar" ? tpl.name_ar : tpl.name_en}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {currentLang === "ar" ? tpl.description_ar : tpl.description_en}
                    </p>
                  </div>

                  {/* Shape Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tpl.shape_tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-primary/5 text-primary border border-primary/15 px-2 py-0.5 text-[10px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Fields Count Indicator */}
                  <div className="text-[11px] font-bold text-muted-foreground pt-1 border-t border-border/50 flex items-center justify-between">
                    <span>
                      {t("TITLES.inputFieldsCount", { count: tpl.fields?.length || 0 })}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {tpl.fields?.map((f) => f.type).join(" • ")}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-border/60">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(tpl)}
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    {t("LABELS.editShape")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTemplate(tpl)}
                    className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title={t("BUTTONS.delete")}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================
          ADD / EDIT BLOCK TEMPLATE MODAL
      ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
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

            <form onSubmit={handleSaveTemplate} className="space-y-4">
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
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {t("TITLES.category")}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value as BlockCategory }))
                    }
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                  >
                    <option value="content_media">{t("TITLES.blockCatContentMedia")}</option>
                    <option value="cards_grid">{t("TITLES.blockCatCardsGrid")}</option>
                    <option value="workflow">{t("TITLES.blockCatWorkflow")}</option>
                    <option value="quotes">{t("TITLES.blockCatQuotes")}</option>
                    <option value="support">{t("TITLES.blockCatSupport")}</option>
                    <option value="legal">{t("TITLES.blockCatLegal")}</option>
                    <option value="hero">{t("TITLES.blockCatHero")}</option>
                  </select>
                </div>
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
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleUpdateField(idx, { type: e.target.value as FieldInputType })
                        }
                        className="w-28 rounded-lg border border-border bg-background p-1.5 text-xs font-semibold"
                      >
                        <option value="text">{t("LABELS.fieldTypeText")}</option>
                        <option value="textarea">{t("LABELS.fieldTypeTextarea")}</option>
                        <option value="image">{t("LABELS.fieldTypeImage")}</option>
                        <option value="icon">{t("LABELS.fieldTypeIcon")}</option>
                        <option value="url">{t("LABELS.fieldTypeUrl")}</option>
                        <option value="repeater">{t("LABELS.fieldTypeRepeater")}</option>
                      </select>
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
