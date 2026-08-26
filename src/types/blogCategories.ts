export interface BlogCategoryArticle {
  id: number;
  title?: string | null;
  title_ar?: string | null;
  title_en?: string | null;
  slug?: string | null;
  image_url?: string | null;
  is_published?: boolean;
  published_at?: string | null;
}

export interface BlogCategory {
  id: number;
  name?: string | null;
  name_ar: string;
  name_en: string;
  slug?: string | null;
  is_active: boolean;
  articles_count?: number;
  articles?: BlogCategoryArticle[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BlogCategoryFormValues {
  name_ar: string;
  name_en: string;
  is_active: boolean;
}

export interface BlogCategoryPayload {
  name_ar: string;
  name_en: string;
  is_active: boolean;
}
