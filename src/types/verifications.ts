import type { VerificationStatus } from "./accounts";

export type VerificationEntityType = "lawyer" | "law_firm";

export interface VerificationListItem {
  id: number;
  type: VerificationEntityType | string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  subtype: string | null;
  license_number: string | null;
  license_document: string | null;
  verification_status: VerificationStatus | null;
  rejection_reason: string | null;
  city: string | null;
  created_at: string | null;
}

export interface VerificationNamedItem {
  id: number;
  name: string;
  code?: string | null;
}

export interface VerificationRegion {
  id: number;
  name_ar: string;
  name_en: string;
}

export interface VerificationUser {
  id: number | null;
  email: string | null;
  phone_number: string | null;
  status: string | null;
  preferred_language: string | null;
  created_at: string | null;
}

export interface VerificationDetail {
  id: number;
  type: VerificationEntityType | string;
  full_name: string | null;
  account_subtype: string | null;
  license_number: string | null;
  license_document_url: string | null;
  qualification_degree: string | null;
  specialization_text: string | null;
  experience_text: string | null;
  city: string | null;
  region?: VerificationRegion | null;
  membership_type: string | null;
  verification_status: VerificationStatus | null;
  rejection_reason: string | null;
  user?: VerificationUser | null;
  languages?: VerificationNamedItem[];
  practice_areas?: VerificationNamedItem[];
  created_at: string | null;
  updated_at: string | null;
}
