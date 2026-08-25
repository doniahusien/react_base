export interface CatalogItem {
  id: number;
  name_ar: string;
  name_en: string;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export type Language = CatalogItem;
export type PracticeArea = CatalogItem;
export type Region = CatalogItem;

export interface CatalogFormValues {
  name_ar: string;
  name_en: string;
  is_active: boolean;
}
