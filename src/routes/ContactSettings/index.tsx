import { useEffect, useState } from "react";
import {
  Squares2X2Icon as LayoutDashboard,
  PhoneIcon as Phone,
  EnvelopeIcon as Envelope,
  MapPinIcon as MapPin,
  ShareIcon as Share,
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
  ContactSettings,
  ContactSettingsUpdatePayload,
} from "../../types/contactSettings";

interface FormValues {
  address_ar: string;
  address_en: string;
  phone: string;
  support_email: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  instagram: string;
}

function toForm(data: ContactSettings | null): FormValues {
  const links = data?.social_links ?? {};
  return {
    address_ar: data?.address_ar ?? "",
    address_en: data?.address_en ?? "",
    phone: data?.phone ?? "",
    support_email: data?.support_email ?? "",
    twitter: links.twitter ?? "",
    facebook: links.facebook ?? "",
    linkedin: links.linkedin ?? "",
    instagram: links.instagram ?? "",
  };
}

export default function ContactSettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<FormValues>(() => toForm(null));

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("contact-settings");
      const data = (res.data?.data ?? null) as ContactSettings | null;
      setValues(toForm(data));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadContactSettings"),
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
    const email = values.support_email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.invalidEmail")
      );
      return;
    }

    // API update contract: phone, support_email, social_links
    // Addresses are shown from GET and sent if present (contact settings).
    const payload: ContactSettingsUpdatePayload = {
      phone: values.phone.trim() || null,
      support_email: email || null,
      address_ar: values.address_ar.trim() || null,
      address_en: values.address_en.trim() || null,
      social_links: {
        facebook: values.facebook.trim() || null,
        twitter: values.twitter.trim() || null,
        instagram: values.instagram.trim() || null,
        linkedin: values.linkedin.trim() || null,
      },
    };

    try {
      setSaving(true);
      const res = await api.put("contact-settings", payload);
      const data = (res.data?.data ?? null) as ContactSettings | null;
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
        <Skeleton sections={[{ fields: [{}, {}, {}] }, { fields: [{}, {}, {}] }]} />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title="contactSettings"
        subtitle="contactSettingsDesc"
        icon={Phone}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "contactSettings", icon: Phone },
        ]}
      />

      <Form values={values} onSubmit={submit} className="space-y-5 pb-8">
        {() => (
          <>
            <SectionCard icon={MapPin} title={t("TITLES.address")}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <BaseTextInput
                  name="address_ar"
                  type="textarea"
                  label={t("TITLES.addressArabic")}
                  value={values.address_ar}
                  onInput={setField("address_ar")}
                />
                <BaseTextInput
                  name="address_en"
                  type="textarea"
                  label={t("TITLES.addressEnglish")}
                  value={values.address_en}
                  onInput={setField("address_en")}
                />
              </div>
            </SectionCard>

            <SectionCard icon={Envelope} title={t("TITLES.contactInfo")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BaseTextInput
                  name="phone"
                  label={t("TITLES.phone")}
                  value={values.phone}
                  onInput={setField("phone")}
                />
                <BaseTextInput
                  name="support_email"
                  type="email"
                  label={t("TITLES.supportEmail")}
                  value={values.support_email}
                  onInput={setField("support_email")}
                />
              </div>
            </SectionCard>

            <SectionCard icon={Share} title={t("TITLES.socialLinks")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BaseTextInput
                  name="twitter"
                  label={t("TITLES.twitter")}
                  placeholder="https://x.com/…"
                  value={values.twitter}
                  onInput={setField("twitter")}
                />
                <BaseTextInput
                  name="facebook"
                  label={t("TITLES.facebook")}
                  placeholder="https://facebook.com/…"
                  value={values.facebook}
                  onInput={setField("facebook")}
                />
                <BaseTextInput
                  name="instagram"
                  label={t("TITLES.instagram")}
                  placeholder="https://instagram.com/…"
                  value={values.instagram}
                  onInput={setField("instagram")}
                />
                <BaseTextInput
                  name="linkedin"
                  label={t("TITLES.linkedin")}
                  placeholder="https://linkedin.com/…"
                  value={values.linkedin}
                  onInput={setField("linkedin")}
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
