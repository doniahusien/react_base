export type LawyerDeletionRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | string;

export interface LawyerDeletionPerson {
  id: number | null;
  name: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface LawyerDeletionRequest {
  id: number;
  reason: string | null;
  status: LawyerDeletionRequestStatus | null;
  lawyer: LawyerDeletionPerson | null;
  handled_by: LawyerDeletionPerson | null;
  rejection_reason?: string | null;
  created_at: string | null;
  updated_at: string | null;
}
