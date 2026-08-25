export interface Contact {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string | null;
}
