import { getIconComponent } from "../Inputs/IconPicker";
import { normalizeBlockType } from "../../mocks/blockTemplatesMock";
import type { BlockTemplate } from "../../types/blocks";

export function getSectionMeta(
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

export { getIconComponent };