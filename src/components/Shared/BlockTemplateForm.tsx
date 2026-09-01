import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { BaseTextInput } from "../Inputs/BaseTextInput";
import { BaseSelectInput } from "../Inputs/BaseSelectInput";
import { IconPicker } from "../Inputs/IconPicker";
import { Button } from "../UI/Button";
import { useAppStore } from "../../store";
import type {
  BlockTemplate,
  BlockCategory,
  FieldDefinition,
  FieldInputType,
} from "../../types/blocks";

export const CATEGORY_TITLE_KEYS: Record<string, string> = {
  content_media: "TITLES.blockCatContentMedia",
  cards_grid: "TITLES.blockCatCardsGrid",
  workflow: "TITLES.blockCatWorkflow",
  quotes: "TITLES.blockCatQuotes",
  support: "TITLES.blockCatSupport",
  legal: "TITLES.blockCatLegal",
  hero: "TITLES.blockCatHero",
};

function buildDefaultContent(fields: FieldDefinition[]) {
  const shape: Record<string, any> = {};
  for (const field of fields) {
    shape[field.key] = field.type === "repeater" ? [] : field.default_value ?? "";
  }
  return { ar: { ...shape }, en: { ...shape } };
}

export type BlockTemplateFormData = {
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
};

function emptyFormData(): BlockTemplateFormData {
  return {
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
      {
        key: "title",
        label_ar: "العنوان الرئيسي",
        label_en: "Main Title",
        type: "text",
        required: true,
      },
      {
        key: "description",
        label_ar: "الوصف",
        label_en: "Description",
        type: "textarea",
        required: true,
      },
      {
        key: "image",
        label_ar: "رابط الصورة",
        label_en: "Image URL",
        type: "image",
        default_value: "/images/slider1.webp",
      },
    ],
  };
}

function templateToFormData(tpl: BlockTemplate): BlockTemplateFormData {
  return {
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
  };
}

export function buildBlockTemplatePayload(
  formData: BlockTemplateFormData,
  editingTemplate?: BlockTemplate | null
): Partial<BlockTemplate> & { id: string } {
  const tags = formData.shape_tags_str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: formData.id.trim().toLowerCase().replace(/\s+/g, "_"),
    name_ar: formData.name_ar.trim(),
    name_en: formData.name_en.trim() || formData.name_ar.trim(),
    description_ar: formData.description_ar.trim(),
    description_en: formData.description_en.trim() || formData.description_ar.trim(),
    category: formData.category,
    icon: formData.icon,
    shape_tags: tags,
    is_active: formData.is_active,
    fields: formData.fields,
    default_content:
      editingTemplate?.default_content ?? buildDefaultContent(formData.fields),
  };
}

interface BlockTemplateFormProps {
  initial?: BlockTemplate | null;
  saving?: boolean;
  onSubmit: (formData: BlockTemplateFormData) => void | Promise<void>;
  onCancel: () => void;
}

export function BlockTemplateForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: BlockTemplateFormProps) {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const currentLang = lang === "en" ? "en" : "ar";
  const editingTemplate = initial ?? null;

  const [formData, setFormData] = useState<BlockTemplateFormData>(() =>
    initial ? templateToFormData(initial) : emptyFormData()
  );

  useEffect(() => {
    setFormData(initial ? templateToFormData(initial) : emptyFormData());
  }, [initial]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-8">
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
          value={{
            id: formData.category,
            name: t(CATEGORY_TITLE_KEYS[formData.category] || formData.category),
          }}
          onChange={(val) => {
            if (val && !Array.isArray(val)) {
              setFormData((prev) => ({
                ...prev,
                category: val.id as BlockCategory,
              }));
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
                onChange={(e) =>
                  handleUpdateField(idx, { label_ar: e.target.value })
                }
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
                value={{
                  id: field.type,
                  name: t(
                    `LABELS.fieldType${field.type.charAt(0).toUpperCase() + field.type.slice(1)}`
                  ),
                }}
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

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("BUTTONS.cancel")}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? t("BUTTONS.saving") : t("LABELS.saveBlockTemplate")}
        </Button>
      </div>
    </form>
  );
}
