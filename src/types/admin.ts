export interface AdminPermission {
  id: number;
  code: string;
  name: string;
}

export interface AdminProfile {
  id: number;
  admin_id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  user_type: string;
  admin_role: string;
  status: string;
  preferred_language: "ar" | "en" | string;
  last_login_at: string | null;
  permissions?: AdminPermission[];
}

export interface AdminLoginData extends AdminProfile {
  token: string;
  token_type: string;
}
