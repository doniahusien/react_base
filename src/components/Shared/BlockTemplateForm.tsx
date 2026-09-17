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

function asText(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function templateToFormData(tpl: BlockTemplate): BlockTemplateFormData {
  return {
    id: asText(tpl.id),
    name_ar: asText(tpl.name_ar),
    name_en: asText(tpl.name_en),
    // API may return null for optional description fields
    description_ar: asText(tpl.description_ar),
    description_en: asText(tpl.description_en),
    category: tpl.category,
    icon: asText(tpl.icon) || "Sparkles",
    shape_tags_str: (tpl.shape_tags ?? []).join(", "),
    is_active: tpl.is_active !== false,
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

  const nameAr = asText(formData.name_ar).trim();
  const nameEn = asText(formData.name_en).trim();
  const descriptionAr = asText(formData.description_ar).trim();
  const descriptionEn = asText(formData.description_en).trim();

  return {
    id: asText(formData.id).trim().toLowerCase().replace(/\s+/g, "_"),
    name_ar: nameAr,
    name_en: nameEn || nameAr,
    description_ar: descriptionAr,
    description_en: descriptionEn || descriptionAr,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            {t("LABELS.blockDescription")} (AR)
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
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            {t("LABELS.blockDescription")} (EN)
          </label>
          <textarea
            rows={2}
            value={formData.description_en}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description_en: e.target.value }))
            }
            placeholder={t("LABELS.blockDescriptionPlaceholder")}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
            dir="ltr"
          />
        </div>
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

        <div className="space-y-2.5 max-h-72 overflow-y-auto p-1">
          {formData.fields.map((field, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-2.5 text-xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="font-bold text-muted-foreground w-6 text-center shrink-0">
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => handleUpdateField(idx, { key: e.target.value })}
                  placeholder="field_key"
                  className="w-28 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono shrink-0"
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
                  className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg sm:ms-auto"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:ps-8">
                <input
                  type="text"
                  value={asText(field.label_ar)}
                  onChange={(e) =>
                    handleUpdateField(idx, { label_ar: e.target.value })
                  }
                  placeholder={t("LABELS.fieldLabelArabic", {
                    defaultValue: "Field label (Arabic)",
                  })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={asText(field.label_en)}
                  onChange={(e) =>
                    handleUpdateField(idx, { label_en: e.target.value })
                  }
                  placeholder={t("LABELS.fieldLabelEnglish", {
                    defaultValue: "Field label (English)",
                  })}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                  dir="ltr"
                />
              </div>
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
