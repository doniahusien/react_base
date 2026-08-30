export type NotificationTargetSegment =
  | "all"
  | "clients"
  | "regular_lawyers"
  | "premium_lawyers";

export const NOTIFICATION_TARGET_SEGMENTS: NotificationTargetSegment[] = [
  "all",
  "clients",
  "regular_lawyers",
  "premium_lawyers",
];

export interface NotificationRecipient {
  id: number;
  full_name?: string | null;
  email?: string | null;
}

export interface NotificationSentByAdmin {
  id: number;
  full_name?: string | null;
}

export interface SystemNotificationPayload {
  type?: string | null;
  url?: string | null;
}

export interface SystemNotification {
  id: number;
  message: string;
  payload?: SystemNotificationPayload | null;
  is_read: boolean | 0 | 1 | "0" | "1";
  read_at?: string | null;
  created_at?: string | null;
}

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  target_segment?: NotificationTargetSegment | string | null;
  deep_link?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  recipient?: NotificationRecipient | null;
  sent_by_admin?: NotificationSentByAdmin | null;
}

export interface NotificationFormValues {
  title: string;
  body: string;
  target_segment: NotificationTargetSegment | "";
  channel_web_push: boolean;
  channel_sms: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  target_segment: string;
  channel_web_push: boolean;
  channel_sms: boolean;
}
