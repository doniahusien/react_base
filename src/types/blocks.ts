// ============================================================================
// Block Template & Input Shape Schema Definitions
// ============================================================================

export type FieldInputType =
  | "text"
  | "textarea"
  | "rich_text"
  | "image"
  | "icon"
  | "url"
  | "switch"
  | "repeater";

export interface FieldDefinition {
  key: string;
  label_ar: string;
  label_en: string;
  type: FieldInputType;
  placeholder_ar?: string;
  placeholder_en?: string;
  default_value?: any;
  required?: boolean;
  help_text_ar?: string;
  help_text_en?: string;
  // If type is "repeater", define sub-fields for each child item
  item_fields?: FieldDefinition[];
  item_label_ar?: string;
  item_label_en?: string;
  min_items?: number;
  max_items?: number;
}

export type BlockCategory =
  | "hero"
  | "content_media"
  | "cards_grid"
  | "workflow"
  | "quotes"
  | "support"
  | "legal";

export interface BlockTemplate {
  id: string; // unique slug / identifier (e.g., "title_desc_image_icon", "cards_grid", "faq_accordion")
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  category: BlockCategory;
  icon: string; // icon identifier (e.g. "Sparkles", "Scale", "RectangleStack")
  shape_tags: string[]; // e.g. ["title", "description", "image", "icon", "cta"]
  is_active: boolean;
  fields: FieldDefinition[];
  default_content: {
    ar: Record<string, any>;
    en: Record<string, any>;
  };
  created_at?: string;
  updated_at?: string;
}
