export type QuestionStatus = "submitted" | "answered" | "published" | string;

export interface QuestionPerson {
  id: number | null;
  name: string | null;
  email?: string | null;
}

export interface Question {
  id: number;
  question_text: string | null;
  status: QuestionStatus | null;
  admin_answer: string | null;
  client: QuestionPerson | null;
  answered_by: QuestionPerson | null;
  is_published: boolean;
  submitted_at: string | null;
  answered_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
