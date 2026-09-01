export interface AppSettings {
  id: number;
  temporary_chat_duration_hours: number;
  request_duration: number;
  updated_at?: string;
  created_at?: string;
}

export interface AppSettingsUpdatePayload {
  temporary_chat_duration_hours: number;
  request_duration: number;
}
