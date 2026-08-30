import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  BellIcon as Bell,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { NotificationForm } from "../../components/Shared/NotificationForm";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import {
  NOTIFICATION_TARGET_SEGMENTS,
  type NotificationPayload,
} from "../../types/notifications";

export default function NotificationCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [segments, setSegments] = useState<string[]>(
    NOTIFICATION_TARGET_SEGMENTS
  );

  useEffect(() => {
    const loadSegments = async () => {
      try {
        const res = await api.get("notifications", { params: { per_page: 1 } });
        const available = res.data?.meta?.available_target_segments;
        if (Array.isArray(available) && available.length) setSegments(available);
      } catch {
        setSegments(NOTIFICATION_TARGET_SEGMENTS);
      }
    };
    loadSegments();
  }, []);

  const onSubmit = async (payload: NotificationPayload) => {
    try {
      setSaving(true);
      const res = await api.post("notifications", payload);
      toast.success(t("MESSAGES.createdSuccess"), res.data?.message);
      const id = res.data?.data?.id;
      navigate(id ? `/notifications/${id}` : "/notifications?page=1");
    } catch (e: any) {
      toast.error(t("MESSAGES.createFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-0">
      <PageHeader
        title={t("TITLES.add", { entity: t("TITLES.notification") })}
        translateTitle={false}
        subtitle={t("LABELS.createNotificationDesc")}
        translateSubtitle={false}
        icon={Bell}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "notifications", href: "/notifications?page=1", icon: Bell },
          { label: t("ACTIONS.create"), translate: false, icon: Bell },
        ]}
      />
      <NotificationForm
        segments={segments}
        saving={saving}
        submitLabel={t("BUTTONS.send")}
        onCancel={() => navigate("/notifications?page=1")}
        onSubmit={onSubmit}
      />
    </div>
  );
}
