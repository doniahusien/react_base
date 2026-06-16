import type { PaginationMeta } from "./common";

export interface Country {
  id: number; name: string; phone_code: string;
  phone_length: number; estimated_arrival_days?: number;
  currency?: string; flag?: string; is_active: boolean;
  created_at?: string;
  en?: { name?: string; currency?: string };
  ar?: { name?: string; currency?: string };
}

export interface CountryMeta extends PaginationMeta {}
export interface CountryData { data: Country[]; meta?: CountryMeta; }

export interface CountryFormValues {
  name_en: string; name_ar: string; phone_code: string;
  phone_length: string; currency_ar: string; currency_en: string;
  estimated_arrival_days: string;
}
