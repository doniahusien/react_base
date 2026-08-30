// ============================================================================
// Page Builder Types
//
// One content interface per canonical block in INITIAL_BLOCK_TEMPLATES.
// A block is a reusable shape: the same interface serves every page that uses
// that shape. Do not add a page-specific variant of an existing shape.
// ============================================================================

export type PageType = "system" | "landing" | "custom" | "policy";

/** Canonical block ids. Must stay in sync with INITIAL_BLOCK_TEMPLATES. */
export type BlockType =
  | "hero_header"
  | "page_header_banner"
  | "title_desc_image_features"
  | "title_desc_image_only"
  | "cards_grid_with_icons_images"
  | "steps_workflow_cards"
  | "dual_action_cta_cards"
  | "values_pillars_cards"
  | "statement_pillars_cards"
  | "numbered_legal_clauses"
  | "contact_channels_info"
  | "faq_accordion_categorized"
  | "blog_page_header";

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface PageSEO {
  meta_title?: LocalizedText;
  meta_description?: LocalizedText;
  meta_keywords?: LocalizedText;
  keywords?: string | LocalizedText | string[];
  og_image?: string;
  canonical_url?: string;
  no_index?: boolean;
}

// Sections render in the order they appear in the `sections` array. There is no
// sort_order column; the bulk save endpoint persists the array order.
//
// The builder edits section content generically, so the stored shape stays
// permissive. Use BlockContentMap to type a specific block's content.
export interface PageSection<T = any> {
  id: string;
  page_id: number;
  /** Stored as string so that legacy values can be migrated on read. */
  type: string;
  is_active: boolean;
  content: {
    ar: T;
    en: T;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Page {
  id: number;
  slug: string;
  title: LocalizedText;
  type: PageType;
  is_published: boolean;
  seo?: PageSEO;
  sections?: PageSection[];
  sections_count?: number;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Shared repeater item shapes
// ==========================================

/** Card in a grid: icon, background image, title, description. */
export interface CardItem {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
}

/** Numbered step in a workflow. */
export interface StepItem {
  id?: string;
  step_number?: string;
  title: string;
  description?: string;
  icon?: string;
}

/** Icon + title + description, with an optional small tag badge. */
export interface FeatureItem {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
  tag?: string;
}

/** One side of a dual-action CTA block. */
export interface ActionCard {
  title: string;
  description?: string;
  cta_text?: string;
  cta_link?: string;
  icon?: string;
  image?: string;
  note_text?: string;
}

/** One numbered clause in a legal document. */
export interface LegalClauseItem {
  id?: string;
  title: string;
  lead?: string;
  content?: string;
}

// ==========================================
// Block content — one interface per canonical block
// ==========================================

/** hero_header — home page top. Images come from the global slider. */
export interface HeroHeaderContent {
  badge?: string;
  title_line1: string;
  title_line2?: string;
  title_highlight: string;
  description: string;
  cta_text?: string;
  cta_link?: string;
  secondary_cta_text?: string;
  secondary_cta_link?: string;
}

/** page_header_banner — inner page header over the global slider. */
export interface PageHeaderBannerContent {
  badge?: string;
  title: string;
  description?: string;
  cta_text?: string;
  cta_link?: string;
}

/** title_desc_image_features — narrative section with image and feature list. */
export interface TitleDescImageFeaturesContent {
  badge?: string;
  title: string;
  description: string;
  image?: string;
  stats_label?: string;
  features?: FeatureItem[];
}

/** title_desc_image_only — heading, body text, one image. */
export interface TitleDescImageOnlyContent {
  badge?: string;
  title: string;
  description: string;
  image?: string;
}

/** cards_grid_with_icons_images — grid of cards with icons and images. */
export interface CardsGridContent {
  badge?: string;
  title?: string;
  description?: string;
  services: CardItem[];
}

/** steps_workflow_cards — numbered workflow steps. */
export interface StepsWorkflowContent {
  badge?: string;
  title: string;
  description?: string;
  steps: StepItem[];
}

/** dual_action_cta_cards — two conversion cards side by side. */
export interface DualActionCtaContent {
  badge?: string;
  title: string;
  subtitle?: string;
  client_option: ActionCard;
  lawyer_option: ActionCard;
}

/** values_pillars_cards — grid of values or principles with tags. */
export interface ValuesPillarsContent {
  badge?: string;
  title: string;
  subtitle?: string;
  values: FeatureItem[];
}

/** statement_pillars_cards — serves Vision, Mission, or any statement section. */
export interface StatementPillarsContent {
  badge?: string;
  title: string;
  statement: string;
  footer_quote?: string;
  pillars: FeatureItem[];
}

/** numbered_legal_clauses — terms, privacy, or any policy document. */
export interface NumberedLegalClausesContent {
  badge?: string;
  title: string;
  intro_title?: string;
  intro_content?: string;
  last_updated?: string;
  sections: LegalClauseItem[];
}

/** contact_channels_info — header texts only; channels come from the backend. */
export interface ContactChannelsContent {
  badge?: string;
  title: string;
  description?: string;
  /** Backend injects phone/email/address from contact settings. */
  data_source?: "contact_settings";
  complaint_title?: string;
  complaint_subtitle?: string;
}

/** faq_accordion_categorized — header texts only; questions come from the backend. */
export interface FaqAccordionContent {
  badge?: string;
  title: string;
  description?: string;
  /** Backend injects the question list. */
  data_source?: "questions_api";
  search_placeholder?: string;
}

/** blog_page_header — header texts only; articles come from the backend. */
export interface BlogPageHeaderContent {
  badge?: string;
  title: string;
  description?: string;
  /** Backend injects the article list. */
  data_source?: "blogs_api";
  articles_heading?: string;
  subscribers_badge?: string;
}

export type BlockContent =
  | HeroHeaderContent
  | PageHeaderBannerContent
  | TitleDescImageFeaturesContent
  | TitleDescImageOnlyContent
  | CardsGridContent
  | StepsWorkflowContent
  | DualActionCtaContent
  | ValuesPillarsContent
  | StatementPillarsContent
  | NumberedLegalClausesContent
  | ContactChannelsContent
  | FaqAccordionContent
  | BlogPageHeaderContent;

/** Maps each canonical block id to its content interface. */
export interface BlockContentMap {
  hero_header: HeroHeaderContent;
  page_header_banner: PageHeaderBannerContent;
  title_desc_image_features: TitleDescImageFeaturesContent;
  title_desc_image_only: TitleDescImageOnlyContent;
  cards_grid_with_icons_images: CardsGridContent;
  steps_workflow_cards: StepsWorkflowContent;
  dual_action_cta_cards: DualActionCtaContent;
  values_pillars_cards: ValuesPillarsContent;
  statement_pillars_cards: StatementPillarsContent;
  numbered_legal_clauses: NumberedLegalClausesContent;
  contact_channels_info: ContactChannelsContent;
  faq_accordion_categorized: FaqAccordionContent;
  blog_page_header: BlogPageHeaderContent;
}
