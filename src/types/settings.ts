export interface AppSettings {
  id: number;
  temporary_chat_duration_hours: number;
  free_requests_limit: number;
  updated_at?: string;
  created_at?: string;
}

export interface AppSettingsUpdatePayload {
  temporary_chat_duration_hours: number;
  free_requests_limit: number;
}
