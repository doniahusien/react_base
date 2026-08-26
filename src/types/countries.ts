export interface Country {
  id: number;
  name?: string | null;
  name_ar: string;
  name_en: string;
  code: string;
  phone_code: string;
  phone_length: number | null;
  phone_starts_with: string | null;
  flag: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CountryFormValues {
  name_ar: string;
  name_en: string;
  code: string;
  phone_code: string;
  phone_length: string;
  phone_starts_with: string;
  flag: string;
  is_active: boolean;
}

export interface CountryPayload {
  name_ar: string;
  name_en: string;
  code: string;
  phone_code: string;
  phone_length: number;
  phone_starts_with: string;
  flag?: string | null;
  is_active: boolean;
}
