// ============================================================================
// Page Builder & Content Management Types (Matched with Nuxt Frontend)
// ============================================================================

export type PageType = "system" | "landing" | "custom" | "policy";

export type BlockType = string;

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

export interface PageSection<T = any> {
  id: string;
  page_id: number;
  type: BlockType;
  sort_order: number;
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
// Specific Block Content Interfaces
// ==========================================

export interface HomeHeaderContent {
  badge: string;
  title_line1: string;
  title_line2: string;
  title_highlight: string;
  description: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text?: string;
  secondary_cta_link?: string;
}

export interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  link?: string;
}

export interface HomeServicesContent {
  badge?: string;
  title?: string;
  description?: string;
  services: ServiceItem[];
}

export interface StepItem {
  id: string;
  step_number?: string;
  title: string;
  description: string;
  icon?: string;
}

export interface HowToWorkContent {
  badge: string;
  title: string;
  description: string;
  steps: StepItem[];
}

export interface HowToGetServiceOption {
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  icon?: string;
  image?: string;
  note_text?: string;
}

export interface HowToGetServiceContent {
  badge: string;
  title: string;
  subtitle: string;
  client_option: HowToGetServiceOption;
  lawyer_option: HowToGetServiceOption;
}

export interface AboutFeatureItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface AboutOurStoryContent {
  badge: string;
  title: string;
  description: string;
  image: string;
  stats_label?: string;
  features?: AboutFeatureItem[];
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  tag?: string;
}

export interface AboutValuesContent {
  badge: string;
  title: string;
  subtitle: string;
  values: ValueItem[];
}

export interface VisionPillar {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface AboutVisionContent {
  badge: string;
  title: string;
  statement: string;
  footer_quote: string;
  pillars: VisionPillar[];
}

export interface MissionPillar {
  id: string;
  title: string;
  description: string;
  tag: string;
  icon?: string;
}

export interface AboutMissionContent {
  badge: string;
  title: string;
  statement: string;
  pillars: MissionPillar[];
}

export interface TermsSectionItem {
  id: string;
  title: string;
  lead?: string;
  content?: string;
  points?: string[];
}

export interface AboutTermsContent {
  badge?: string;
  title: string;
  subtitle?: string;
  intro_title?: string;
  intro_content?: string;
  last_updated?: string;
  sections: TermsSectionItem[];
}

export interface ContactPageContent {
  badge: string;
  title: string;
  description: string;
  data_source?: string; // "contact_settings"
  complaint_title?: string;
  complaint_subtitle?: string;
  phone?: string;
  phone_icon?: string;
  email?: string;
  email_icon?: string;
  address?: string;
  address_icon?: string;
  address_label?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FAQAccordionContent {
  badge: string;
  title: string;
  description: string;
  data_source?: string; // "questions_api"
  search_placeholder?: string;
  faqs?: FAQItem[];
}

export interface BlogPageContent {
  badge: string;
  title: string;
  description: string;
  data_source?: string; // "blogs_api"
  articles_heading?: string;
  subscribers_badge?: string;
}

export interface PageHeaderBannerContent {
  badge: string;
  title: string;
  description: string;
  cta_text?: string;
  cta_link?: string;
}
