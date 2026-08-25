export type ComplaintStatus = "open" | "closed" | string;
export type ComplaintType =
  | "inappropriate_behavior"
  | "delayed_response"
  | "technical_issue"
  | "other"
  | string;

export interface ComplaintPerson {
  id: number;
  name: string | null;
  type?: string | null;
}

export interface Complaint {
  id: number;
  status: ComplaintStatus | null;
  type: ComplaintType | null;
  description: string | null;
  attachment_url: string | null;
  admin_response: string | null;
  resolved_at: string | null;
  created_at: string | null;
  submitted_by: ComplaintPerson | null;
  target_lawyer: ComplaintPerson | null;
  legal_request: unknown | null;
  resolved_by: ComplaintPerson | null;
}

export interface ComplaintFiltersMeta {
  statuses?: Array<{ key: string; label: string }>;
  types?: Array<{ key: string; label: string }>;
  counts?: {
    total?: number;
    open?: number;
    closed?: number;
  };
}
