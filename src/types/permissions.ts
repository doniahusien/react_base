export interface CatalogPermission {
  id: number;
  code: string;
  name: string;
  name_ar?: string | null;
  name_en?: string | null;
  module?: string | null;
  target_routes?: string[] | null;
  created_at?: string;
}

export interface PermissionsCatalog {
  permissions: CatalogPermission[];
  available_routes?: string[];
}

export interface SubAdminCreator {
  id: number;
  full_name: string;
  email?: string;
}

export interface SubAdmin {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  admin_role: string;
  status: string;
  preferred_language: "ar" | "en" | string;
  created_by?: SubAdminCreator | null;
  permissions: CatalogPermission[];
  last_login_at: string | null;
  created_at: string;
  all_permissions?: CatalogPermission[];
  creator_details?: SubAdminCreator | null;
  updated_at?: string;
}

export interface SubAdminPayload {
  full_name: string;
  email: string;
  phone?: string | null;
  password?: string;
  preferred_language?: "ar" | "en" | string | null;
  permissions: string[];
}
