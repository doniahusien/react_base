import { useEffect, useState } from "react";
import {
  Squares2X2Icon as LayoutDashboard,
  Cog6ToothIcon as Cog,
  ChatBubbleLeftRightIcon as Chat,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import { Skeleton } from "../../components/UI/Skeleton";
import { Button } from "../../components/UI/Button";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { SectionCard } from "../../components/Shared/SectionCard";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type {
  AppSettings,
  AppSettingsUpdatePayload,
} from "../../types/settings";

interface FormValues {
  temporary_chat_duration_hours: string;
  free_requests_limit: string;
}

function toForm(data: AppSettings | null): FormValues {
  return {
    temporary_chat_duration_hours:
      data?.temporary_chat_duration_hours != null
        ? String(data.temporary_chat_duration_hours)
        : "",
    free_requests_limit:
      data?.free_requests_limit != null
        ? String(data.free_requests_limit)
        : "",
  };
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<FormValues>(() => toForm(null));

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("settings");
      const data = (res.data?.data ?? null) as AppSettings | null;
      setValues(toForm(data));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadSettings"),
        e?.response?.data?.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const setField =
    (key: keyof FormValues) =>
    (v: string) =>
      setValues((prev) => ({ ...prev, [key]: v }));

  const submit = async () => {
    const duration = Number(values.temporary_chat_duration_hours);
    const freeLimit = Number(values.free_requests_limit);

    if (
      values.temporary_chat_duration_hours.trim() === "" ||
      Number.isNaN(duration) ||
      duration < 0
    ) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.minValue", {
          min: 0,
          field: t("TITLES.temporaryChatDurationHours"),
        })
      );
      return;
    }

    if (
      values.free_requests_limit.trim() === "" ||
      Number.isNaN(freeLimit) ||
      freeLimit < 0
    ) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.minValue", {
          min: 0,
          field: t("TITLES.freeRequestsLimit"),
        })
      );
      return;
    }

    const payload: AppSettingsUpdatePayload = {
      temporary_chat_duration_hours: Math.round(duration),
      free_requests_limit: Math.round(freeLimit),
    };

    try {
      setSaving(true);
      const res = await api.put("settings", payload);
      const data = (res.data?.data ?? null) as AppSettings | null;
      if (data) setValues(toForm(data));
      toast.success(t("MESSAGES.updatedSuccess"), res.data?.message);
    } catch (e: any) {
      toast.error(t("MESSAGES.updateFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton sections={[{ fields: [{}, {}] }]} />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title="appSettings"
        subtitle="appSettingsDesc"
        icon={Cog}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "appSettings", icon: Cog },
        ]}
      />

      <Form values={values} onSubmit={submit} className="space-y-5 pb-8">
        {() => (
          <>
            <SectionCard icon={Chat} title={t("TITLES.appSettings")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BaseTextInput
                  name="temporary_chat_duration_hours"
                  type="number"
                  label={t("TITLES.temporaryChatDurationHours")}
                  value={values.temporary_chat_duration_hours}
                  onInput={setField("temporary_chat_duration_hours")}
                />
                <BaseTextInput
                  name="free_requests_limit"
                  type="number"
                  label={t("TITLES.freeRequestsLimit")}
                  value={values.free_requests_limit}
                  onInput={setField("free_requests_limit")}
                />
              </div>
            </SectionCard>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="soft" onClick={load}>
                {t("BUTTONS.cancel")}
              </Button>
              <Button type="submit" loading={saving}>
                {t("BUTTONS.save")}
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
