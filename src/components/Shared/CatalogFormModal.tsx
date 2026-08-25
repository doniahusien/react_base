import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { XMarkIcon as X } from "@heroicons/react/24/outline";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSwitchInput } from "../../components/Inputs/BaseSwitchInput";
import { Button } from "../../components/UI/Button";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type { CatalogFormValues, CatalogItem } from "../../types/catalog";

interface CatalogFormModalProps {
  open: boolean;
  item?: CatalogItem | null;
  /** API resource path, e.g. `languages` or `practice-areas` */
  resource: string;
  /** i18n key under TITLES for singular label, e.g. `language` */
  titleKey: string;
  onClose: () => void;
  onSaved: () => void;
}

const empty: CatalogFormValues = {
  name_ar: "",
  name_en: "",
  is_active: true,
};

export function CatalogFormModal({
  open,
  item,
  resource,
  titleKey,
  onClose,
  onSaved,
}: CatalogFormModalProps) {
  const { t } = useTranslation();
  const editing = !!item;
  const [values, setValues] = useState<CatalogFormValues>(empty);
  const [saving, setSaving] = useState(false);
  const entityLabel = t(`TITLES.${titleKey}`);

  useEffect(() => {
    if (!open) return;
    setValues(
      item
        ? {
            name_ar: item.name_ar ?? "",
            name_en: item.name_en ?? "",
            is_active: !!item.is_active,
          }
        : empty
    );
  }, [open, item]);

  if (!open) return null;

  const set =
    (key: keyof CatalogFormValues) =>
    (v: string | boolean) =>
      setValues((prev) => ({ ...prev, [key]: v }));

  const submit = async () => {
    const payload = {
      name_ar: values.name_ar.trim(),
      name_en: values.name_en.trim(),
      is_active: values.is_active,
    };
    if (!payload.name_ar || !payload.name_en) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.name") })
      );
      return;
    }
    try {
      setSaving(true);
      const res = editing
        ? await api.put(`${resource}/${item!.id}`, payload)
        : await api.post(resource, payload);
      toast.success(
        editing ? t("MESSAGES.updatedSuccess") : t("MESSAGES.createdSuccess"),
        res.data?.message
      );
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(
        editing ? t("MESSAGES.updateFailed") : t("MESSAGES.createFailed"),
        e?.response?.data?.message
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">
            {editing
              ? t("TITLES.edit", { count: entityLabel })
              : t("TITLES.add", { count: entityLabel })}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X width={16} height={16} />
          </button>
        </div>

        <Form values={values} onSubmit={submit} className="space-y-4 p-5">
          {({ field, touch, errors }) => (
            <>
              <BaseTextInput
                name="name_ar"
                label={`${t("TITLES.nameArabic")} *`}
                placeholder={t("LABELS.nameArabic")}
                value={values.name_ar}
                onInput={(v) => {
                  set("name_ar")(v);
                  touch("name_ar");
                }}
                {...field("name_ar", errors)}
              />
              <BaseTextInput
                name="name_en"
                label={`${t("TITLES.nameEnglish")} *`}
                placeholder={t("LABELS.nameEnglish")}
                value={values.name_en}
                onInput={(v) => {
                  set("name_en")(v);
                  touch("name_en");
                }}
                {...field("name_en", errors)}
              />
              <BaseSwitchInput
                name="is_active"
                label={t("TITLES.activeAccount")}
                value={values.is_active}
                onChange={(v) => set("is_active")(v)}
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="soft" className="flex-1" onClick={onClose}>
                  {t("BUTTONS.cancel")}
                </Button>
                <Button type="submit" className="flex-1" loading={saving}>
                  {t("BUTTONS.save")}
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
