export type BlogSourceType = "admin_written" | string;

export interface BlogAuthorAdmin {
  id: number;
  name: string | null;
}

export interface BlogCategoryRef {
  id: number;
  name: string | null;
}

export interface Blog {
  id: number;
  title: string | null;
  title_ar: string | null;
  title_en: string | null;
  content: string | null;
  content_ar: string | null;
  content_en: string | null;
  category: BlogCategoryRef | null;
  image_url: string | null;
  is_published: boolean;
  source_type: BlogSourceType | null;
  published_at: string | null;
  author_admin: BlogAuthorAdmin | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BlogPayload {
  title_ar: string;
  title_en?: string | null;
  content_ar: string;
  content_en?: string | null;
  blog_category_id?: number | null;
  is_published?: boolean;
}
