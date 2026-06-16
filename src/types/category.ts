import type { PaginationMeta } from "./common";

export interface CategoryTranslation { name: string; }

export interface Category {
  id: number; name?: string; image?: string; slug?: string;
  level?: number; type?: string; is_active: boolean;
  created_at?: string; updated_at?: string;
  en?: CategoryTranslation; ar?: CategoryTranslation;
}

export interface CategoryMeta extends PaginationMeta {}
export interface CategoryData { data: Category[]; meta?: CategoryMeta; }
