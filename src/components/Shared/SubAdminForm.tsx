import { useMemo } from "react";
import {
  UserIcon as User,
  AtSymbolIcon as AtSign,
  LockClosedIcon as Lock,
  PhoneIcon as Phone,
  LanguageIcon as Language,
  ShieldCheckIcon as Shield,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Form } from "../Inputs/Form";
import { BaseTextInput } from "../Inputs/BaseTextInput";
import { BaseSelectInput } from "../Inputs/BaseSelectInput";
import { Button } from "../UI/Button";
import { SectionCard } from "./SectionCard";
import { PermissionPicker } from "./PermissionPicker";
import { schemas } from "../../lib/schemas";
import type { CatalogPermission } from "../../types/permissions";

export interface SubAdminFormValues {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  preferred_language: "ar" | "en";
  permissions: string[];
}

interface SubAdminFormProps {
  mode: "create" | "edit";
  values: SubAdminFormValues;
  onChange: (next: SubAdminFormValues) => void;
  permissionOptions: CatalogPermission[];
  saving: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
}

export function SubAdminForm({
  mode,
  values,
  onChange,
  permissionOptions,
  saving,
  submitLabel,
  onCancel,
  onSubmit,
}: SubAdminFormProps) {
  const { t } = useTranslation();
  const set =
    (key: keyof SubAdminFormValues) =>
    (v: string) =>
      onChange({ ...values, [key]: v });

  const schema =
    mode === "create" ? schemas.subAdminCreate : schemas.subAdminUpdate;

  const langOptions = useMemo(
    () => [
      { id: "ar", name: t("TITLES.arabic") },
      { id: "en", name: t("TITLES.english") },
    ],
    [t]
  );

  return (
    <Form schema={schema} values={values} onSubmit={onSubmit}>
      {({ errors, field, touch }) => (
        <div className="space-y-5 pb-8">
          <SectionCard
            icon={User}
            title={t("TITLES.basicInfo")}
            subtitle={t("LABELS.subAdminBasicDesc")}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseTextInput
                name="full_name"
                label={t("TITLES.name")}
                value={values.full_name}
                onInput={(v) => {
                  set("full_name")(v);
                  touch("full_name");
                }}
                prependInputIcon={User}
                {...field("full_name", errors)}
              />
              <BaseTextInput
                name="email"
                label={t("TITLES.email")}
                type="email"
                value={values.email}
                onInput={(v) => {
                  set("email")(v);
                  touch("email");
                }}
                prependInputIcon={AtSign}
                {...field("email", errors)}
              />
              <BaseTextInput
                name="phone"
                label={t("TITLES.phone")}
                value={values.phone}
                onInput={(v) => {
                  set("phone")(v);
                  touch("phone");
                }}
                prependInputIcon={Phone}
                {...field("phone", errors)}
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
                  const opt = Array.isArray(v) ? v[0] : v;
                  set("preferred_language")(String(opt?.id ?? "ar"));
                  touch("preferred_language");
                }}
                prependInputIcon={Language}
                {...field("preferred_language", errors)}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Lock}
            title={t("TITLES.security")}
            subtitle={
              mode === "edit"
                ? t("LABELS.subAdminPasswordOptional")
                : t("LABELS.subAdminPasswordRequired")
            }
            color="orange"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseTextInput
                name="password"
                label={t("TITLES.password")}
                type="password"
                value={values.password}
                onInput={(v) => {
                  set("password")(v);
                  touch("password");
                }}
                prependInputIcon={Lock}
                placeholder={
                  mode === "edit"
                    ? t("LABELS.newPassword")
                    : t("LABELS.passwordPlaceholder")
                }
                {...field("password", errors)}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Shield}
            title={t("TITLES.permissions")}
            subtitle={t("LABELS.subAdminPermissionsDesc")}
            color="blue"
          >
            <PermissionPicker
              options={permissionOptions}
              value={values.permissions}
              onChange={(permissions) => {
                onChange({ ...values, permissions });
                touch("permissions");
              }}
              error={errors.permissions}
            />
          </SectionCard>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel}>
              <X width={16} height={16} />
              {t("BUTTONS.cancel")}
            </Button>
            <Button type="submit" loading={saving}>
              <Shield width={16} height={16} />
              {submitLabel}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
