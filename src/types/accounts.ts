export type AccountStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_review"
  | string;

export type VerificationStatus =
  | "pending"
  | "approved"
  | "verified"
  | "rejected"
  | string;

export interface FilterOption {
  value: string;
  label: string;
}

export interface ClientListItem {
  id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: AccountStatus | null;
  gender: string | null;
  joined_at: string | null;
}

export interface ClientSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  discount_code_id: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientDetail extends ClientListItem {
  lawyer_gender_preference?: string | null;
  subscription?: ClientSubscription | null;
  payments?: unknown;
  legal_requests_count?: number;
}

export interface LawyerListItem {
  id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: AccountStatus | null;
  verification_status: VerificationStatus | null;
  membership_type: string | null;
  commercial_registry_verified: boolean;
  joined_at: string | null;
}

export interface NamedLocale {
  id: number;
  name_ar: string;
  name_en: string;
}

export interface LawyerDetail extends LawyerListItem {
  qualification_degree?: string | null;
  official_name?: string | null;
  license_number?: string | null;
  bio?: string | null;
  address?: string | null;
  subscription?: ClientSubscription | null;
  payments?: unknown[];
  languages?: NamedLocale[];
  practice_areas?: NamedLocale[];
  price_offers_count?: number;
  ratings_count?: number;
  avg_rating?: number;
  account_subtype?: string | null;
}

export interface LawFirmListItem {
  id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: AccountStatus | null;
  verification_status: VerificationStatus | null;
  membership_type: string | null;
  commercial_registry_verified: boolean;
  joined_at: string | null;
  account_subtype?: string | null;
}

export type LawFirmDetail = LawyerDetail;
