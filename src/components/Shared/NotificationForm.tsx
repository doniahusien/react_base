import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BellIcon as Bell,
  MegaphoneIcon as Megaphone,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { Form } from "../Inputs/Form";
import { BaseTextInput } from "../Inputs/BaseTextInput";
import { BaseSwitchInput } from "../Inputs/BaseSwitchInput";
import { BaseSelectInput, type SelectOption } from "../Inputs/BaseSelectInput";
import { Button } from "../UI/Button";
import { SectionCard } from "./SectionCard";
import { toast } from "../../stores/toast";
import {
  NOTIFICATION_TARGET_SEGMENTS,
  type NotificationFormValues,
  type NotificationPayload,
  type NotificationTargetSegment,
} from "../../types/notifications";

interface NotificationFormProps {
  segments?: string[];
  saving?: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (payload: NotificationPayload) => void | Promise<void>;
}

function emptyNotificationForm(): NotificationFormValues {
  return {
    title: "",
    body: "",
    target_segment: "",
    channel_web_push: true,
    channel_sms: false,
  };
}

export function NotificationForm({
  segments,
  saving,
  submitLabel,
  onCancel,
  onSubmit,
}: NotificationFormProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<NotificationFormValues>(
    emptyNotificationForm
  );

  const segmentOptions = useMemo(
    () =>
      (segments?.length ? segments : NOTIFICATION_TARGET_SEGMENTS).map((s) => ({
        id: s,
        name: t(`NOTIFICATION_SEGMENT.${s}`, { defaultValue: s }),
      })),
    [segments, t]
  );

  const selectedSegment =
    segmentOptions.find((o) => o.id === values.target_segment) ?? null;

  const setField =
    (key: keyof NotificationFormValues) => (v: string | boolean) =>
      setValues((prev) => ({ ...prev, [key]: v }));

  const submit = async () => {
    const title = values.title.trim();
    const body = values.body.trim();
    if (!title || !body || !values.target_segment) {
      toast.error(
        t("MESSAGES.createFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.title") })
      );
      return;
    }
    if (!values.channel_web_push && !values.channel_sms) {
      toast.error(
        t("MESSAGES.createFailed"),
        t("MESSAGES.notificationChannelRequired")
      );
      return;
    }
    await onSubmit({
      title,
      body,
      target_segment: values.target_segment,
      channel_web_push: values.channel_web_push,
      channel_sms: values.channel_sms,
    });
  };

  return (
    <Form values={values} onSubmit={submit} className="space-y-5 pb-8">
      {({ field, touch, errors }) => (
        <>
          <SectionCard
            icon={Bell}
            title={t("TITLES.basicInfo")}
            subtitle={t("LABELS.notificationContentDesc")}
          >
            <div className="grid grid-cols-1 gap-4">
              <BaseTextInput
                name="title"
                label={`${t("TITLES.title")} *`}
                placeholder={t("LABELS.notificationTitle")}
                value={values.title}
                onInput={(v) => {
                  setField("title")(v);
                  touch("title");
                }}
                {...field("title", errors)}
              />
              <BaseTextInput
                name="body"
                type="textarea"
                label={`${t("TITLES.body")} *`}
                placeholder={t("LABELS.notificationBody")}
                value={values.body}
                onInput={(v) => {
                  setField("body")(v);
                  touch("body");
                }}
                {...field("body", errors)}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Megaphone}
            title={t("TITLES.deliverySettings")}
            subtitle={t("LABELS.deliverySettingsDesc")}
            color="blue"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BaseSelectInput
                name="target_segment"
                label={`${t("TITLES.targetSegment")} *`}
                items={segmentOptions}
                value={selectedSegment as SelectOption | null}
                onChange={(v) =>
                  setField("target_segment")(
                    ((v as SelectOption | null)?.id ??
                      "") as NotificationTargetSegment | ""
                  )
                }
              />
              <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2">
                <BaseSwitchInput
                  name="channel_web_push"
                  label={t("TITLES.channelWebPush")}
                  value={values.channel_web_push}
                  onChange={(v) => setField("channel_web_push")(v)}
                />
                <BaseSwitchInput
                  name="channel_sms"
                  label={t("TITLES.channelSms")}
                  value={values.channel_sms}
                  onChange={(v) => setField("channel_sms")(v)}
                />
              </div>
            </div>
          </SectionCard>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel}>
              <X width={16} height={16} />
              {t("BUTTONS.cancel")}
            </Button>
            <Button type="submit" loading={saving}>
              {submitLabel}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
