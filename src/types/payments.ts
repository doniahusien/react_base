export type PaymentStatus = "initiated" | "success" | "failed" | "refunded" | string;

export interface PaymentUser {
  id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface Payment {
  id: number;
  subscription_id: number | null;
  subscription_name?: string | null;
  user: PaymentUser | null;
  amount: number;
  payment_gateway: string | null;
  gateway_transaction_id: string | null;
  status: PaymentStatus | null;
  paid_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
