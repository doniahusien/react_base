export type CodeStatus = "available" | "used" | string;

export interface CodeAdminRef {
  admin_id?: number | null;
  id?: number | null;
  name?: string | null;
  full_name?: string | null;
}

export interface CodeUserRef {
  id?: number | null;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface DiscountCode {
  id: number;
  code: string;
  discount_percentage: number;
  status: CodeStatus | null;
  used_at: string | null;
  generated_at: string | null;
  used_by: CodeUserRef | null;
  generated_by: CodeAdminRef | null;
}
