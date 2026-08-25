import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  UserIcon as User,
  AtSymbolIcon as AtSign,
  ShieldCheckIcon as Shield,
  LockClosedIcon as Lock,
  XMarkIcon as X,
  Squares2X2Icon as LayoutDashboard,
  UserCircleIcon as UserCircle,
  KeyIcon as KeyRound,
  LanguageIcon as Language,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { useAuthStore } from "../../stores/auth";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSelectInput } from "../../components/Inputs/BaseSelectInput";
import { SectionCard } from "../../components/Shared/SectionCard";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import { schemas } from "../../lib/schemas";

function ChangePasswordDialog({
  onClose,
  successMsg,
  failedMsg,
}: {
  onClose: () => void;
  successMsg: string;
  failedMsg: string;
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof values) => (v: string) =>
    setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.put("profile/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
        new_password_confirmation: values.new_password_confirmation,
      });
      toast.success(successMsg);
      onClose();
    } catch (e: any) {
      toast.error(failedMsg, e?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound width={14} height={14} />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              {t("PROFILE.changePassword")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted"
          >
            <X width={14} height={14} />
          </button>
        </div>
        <Form
          schema={schemas.profilePassword}
          values={values}
          onSubmit={handleSubmit}
        >
          {({ errors, field, touch }) => (
            <div className="space-y-4 px-6 py-5">
              <BaseTextInput
                name="current_password"
                label={t("PROFILE.currentPassword")}
                type="password"
                value={values.current_password}
                onInput={(v) => {
                  set("current_password")(v);
                  touch("current_password");
                }}
                prependInputIcon={Lock}
                {...field("current_password", errors)}
              />
              <BaseTextInput
                name="new_password"
                label={t("PROFILE.newPassword")}
                type="password"
                value={values.new_password}
                onInput={(v) => {
                  set("new_password")(v);
                  touch("new_password");
                }}
                prependInputIcon={Lock}
                {...field("new_password", errors)}
              />
              <BaseTextInput
                name="new_password_confirmation"
                label={t("PROFILE.confirmPassword")}
                type="password"
                value={values.new_password_confirmation}
                onInput={(v) => {
                  set("new_password_confirmation")(v);
                  touch("new_password_confirmation");
                }}
                prependInputIcon={Lock}
                {...field("new_password_confirmation", errors)}
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>
                  <X width={14} height={14} /> {t("BUTTONS.cancel")}
                </Button>
                <Button type="submit" loading={loading}>
                  <Shield width={14} height={14} />
                  {t("BUTTONS.saveChanges")}
                </Button>
              </div>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}

export default function ProfileEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [values, setValues] = useState({
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
    preferred_language: (user?.preferred_language === "en" ? "en" : "ar") as
      | "ar"
      | "en",
  });

  const langOptions = [
    { id: "ar", name: t("TITLES.arabic") },
    { id: "en", name: t("TITLES.english") },
  ];

  const set = <K extends keyof typeof values>(k: K, v: string) =>
    setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await api.put("profile", {
        full_name: values.full_name,
        email: values.email,
        preferred_language: values.preferred_language,
      });
      await fetchProfile();
      toast.success(res.data?.message || t("PROFILE.updatedSuccess"));
      navigate("/profile");
    } catch (e: any) {
      toast.error(t("PROFILE.updateFailed"), e?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-0">
      <PageHeader
        title="editProfile"
        subtitle={t("LABELS.profileEditDesc")}
        translateSubtitle={false}
        icon={User}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "profile", href: "/profile", icon: UserCircle },
          { label: "editProfile" },
        ]}
        rightActions={
          <Button type="button" variant="soft" onClick={() => setPwOpen(true)}>
            <KeyRound width={14} height={14} />
            {t("PROFILE.changePassword")}
          </Button>
        }
      />

      <Form schema={schemas.profileEdit} values={values} onSubmit={handleSubmit}>
        {({ errors, field, touch }) => (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SectionCard
                icon={User}
                title={t("PROFILE.basicInfo")}
                subtitle=""
                color="emerald"
                step={1}
              >
                <div className="grid grid-cols-1 gap-4">
                  <BaseTextInput
                    name="full_name"
                    label={t("TITLES.name")}
                    placeholder={t("LABELS.name")}
                    value={values.full_name}
                    prependInputIcon={User}
                    onInput={(v) => {
                      set("full_name", v);
                      touch("full_name");
                    }}
                    {...field("full_name", errors)}
                  />
                  <BaseSelectInput
                    name="preferred_language"
                    label={t("TITLES.preferredLanguage")}
                    items={langOptions}
                    value={
                      langOptions.find((o) => o.id === values.preferred_language) ??
                      langOptions[0]
                    }
                    onChange={(v) => {
                      const id = Array.isArray(v) ? v[0]?.id : v?.id;
                      if (id === "ar" || id === "en") {
                        set("preferred_language", id);
                        touch("preferred_language");
                      }
                    }}
                    prependInputIcon={Language}
                    {...field("preferred_language", errors)}
                  />
                </div>
              </SectionCard>

              <SectionCard
                icon={AtSign}
                title={t("PROFILE.contactInfo")}
                subtitle=""
                color="blue"
                step={2}
              >
                <div className="grid grid-cols-1 gap-4">
                  <BaseTextInput
                    name="email"
                    label={t("TITLES.email")}
                    placeholder={t("LABELS.email")}
                    type="email"
                    value={values.email}
                    prependInputIcon={AtSign}
                    onInput={(v) => {
                      set("email", v);
                      touch("email");
                    }}
                    {...field("email", errors)}
                  />
                </div>
              </SectionCard>
            </div>

            <div className="flex items-center justify-end gap-3 pb-4 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/profile")}
              >
                <X width={15} height={15} />
                {t("BUTTONS.cancel")}
              </Button>
              <Button type="submit" loading={loading}>
                <Shield width={15} height={15} />
                {t("BUTTONS.saveChanges")}
              </Button>
            </div>
          </div>
        )}
      </Form>

      {pwOpen && (
        <ChangePasswordDialog
          onClose={() => setPwOpen(false)}
          successMsg={t("PROFILE.passwordUpdated")}
          failedMsg={t("PROFILE.passwordFailed")}
        />
      )}
    </div>
  );
}
