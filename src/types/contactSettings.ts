export interface ContactSocialLinks {
  twitter?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  [key: string]: string | null | undefined;
}

export interface ContactSettings {
  id: number;
  address_ar: string | null;
  address_en: string | null;
  phone: string | null;
  support_email: string | null;
  social_links: ContactSocialLinks | null;
}

export interface ContactSettingsUpdatePayload {
  phone?: string | null;
  support_email?: string | null;
  address_ar?: string | null;
  address_en?: string | null;
  social_links?: ContactSocialLinks | null;
}
