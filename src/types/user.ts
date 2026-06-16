import type { PaginationMeta } from "./common";

export interface User {
  id: number;
  name?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  bio?: string;
  image?: string;
  status?: "active" | "inactive" | string;
  phone_code: string;
  phone: string;
  is_active?: boolean;
  lastSeen?: string;
}

export interface UserMeta extends PaginationMeta {}
export interface UserData { data: User[]; meta?: UserMeta; }

export interface UserProduct {
  id: number; name: string; brand: string; image: string;
  category: { id: number; name: string };
  number_of_sold_item: number;
  karat: { id: number; karat: number };
  weight: { id: number; weight: number; weight_unit: string };
  purity: number; main_price: number; manufacturing_price: number;
  discount_amount: number; total_price_after_discount: number;
  total_price_before_discount: number;
  is_active: boolean; is_recomended: boolean; created_at: string;
}

export interface UserAddress {
  id: number;
  location: {
    country: { id: number; name: string };
    city: { id: number; name: string };
    district: { id: number; name: string };
    longitude: string; latitude: string;
  };
  description: string;
  contact: { phone_code: string; phone: string };
  is_default: boolean; created_at: string;
}

export interface UserDetail {
  id: number; full_name: string; first_name: string; last_name: string;
  email: string; phone_code: string; phone: string; image: string;
  gender: string; birth_date: string; role: { name: string } | null;
  is_active: boolean; is_ban: boolean; ban_reason: string | null;
  user_type: string; last_login_at: string | null;
  created_at: string; updated_at: string;
  addresses: UserAddress[];
  statistics: {
    last_5_ordered_products: UserProduct[];
    last_5_wishlist_products: UserProduct[];
  };
}

export interface UserFormValues {
  first_name: string; last_name: string; email: string;
  phone_code: string; phone: string;
  user_role: { id: number | string; name: string } | null;
  password: string; password_confirmation: string; is_active: boolean;
}
