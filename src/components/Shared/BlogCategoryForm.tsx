import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TagIcon as Tag,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { Form } from "../Inputs/Form";
import { BaseTextInput } from "../Inputs/BaseTextInput";
import { BaseSwitchInput } from "../Inputs/BaseSwitchInput";
import { Button } from "../UI/Button";
import { SectionCard } from "./SectionCard";
import { toast } from "../../stores/toast";
import type {
  BlogCategory,
  BlogCategoryFormValues,
  BlogCategoryPayload,
} from "../../types/blogCategories";

interface BlogCategoryFormProps {
  initial?: BlogCategory | null;
  saving?: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (payload: BlogCategoryPayload) => void | Promise<void>;
}

function emptyBlogCategoryForm(): BlogCategoryFormValues {
  return {
    name_ar: "",
    name_en: "",
    is_active: true,
  };
}

function blogCategoryToForm(item: BlogCategory): BlogCategoryFormValues {
  return {
    name_ar: item.name_ar ?? "",
    name_en: item.name_en ?? "",
    is_active: !!item.is_active,
  };
}

export function BlogCategoryForm({
  initial,
  saving,
  submitLabel,
  onCancel,
  onSubmit,
}: BlogCategoryFormProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<BlogCategoryFormValues>(() =>
    initial ? blogCategoryToForm(initial) : emptyBlogCategoryForm()
  );

  useEffect(() => {
    setValues(initial ? blogCategoryToForm(initial) : emptyBlogCategoryForm());
  }, [initial]);

  const setField =
    (key: keyof BlogCategoryFormValues) =>
    (v: string | boolean) =>
      setValues((prev) => ({ ...prev, [key]: v }));

  const submit = async () => {
    const name_ar = values.name_ar.trim();
    const name_en = values.name_en.trim();
    if (!name_ar || !name_en) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.name") })
      );
      return;
    }
    await onSubmit({
      name_ar,
      name_en,
      is_active: values.is_active,
    });
  };

  return (
    <Form values={values} onSubmit={submit} className="space-y-5 pb-8">
      {({ field, touch, errors }) => (
        <>
          <SectionCard
            icon={Tag}
            title={t("TITLES.basicInfo")}
            subtitle={t("LABELS.basicInfoCategoryDesc")}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BaseTextInput
                name="name_ar"
                label={`${t("TITLES.nameArabic")} *`}
                placeholder={t("LABELS.nameArabic")}
                value={values.name_ar}
                onInput={(v) => {
                  setField("name_ar")(v);
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
                  setField("name_en")(v);
                  touch("name_en");
                }}
                {...field("name_en", errors)}
              />
              <BaseSwitchInput
                name="is_active"
                label={t("TITLES.activeAccount")}
                value={values.is_active}
                onChange={(v) => setField("is_active")(v)}
              />
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
