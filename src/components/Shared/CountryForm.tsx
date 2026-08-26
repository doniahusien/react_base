import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CloudArrowUpIcon as CloudUpload,
  GlobeAltIcon as Globe,
  PhoneIcon as Phone,
  PhotoIcon as Photo,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { Form } from "../Inputs/Form";
import { BaseTextInput } from "../Inputs/BaseTextInput";
import { BaseSwitchInput } from "../Inputs/BaseSwitchInput";
import { Button } from "../UI/Button";
import { SectionCard } from "./SectionCard";
import { mediaUrl } from "../../lib/mediaUrl";
import { toast } from "../../stores/toast";
import type { Country, CountryFormValues } from "../../types/countries";

export type CountrySubmitPayload = CountryFormValues & {
  flagFile: File | null;
};

interface CountryFormProps {
  mode: "create" | "edit";
  initial?: Country | null;
  saving?: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (payload: CountrySubmitPayload) => void | Promise<void>;
}

export function emptyCountryForm(): CountryFormValues {
  return {
    name_ar: "",
    name_en: "",
    code: "",
    phone_code: "",
    phone_length: "",
    phone_starts_with: "",
    flag: "",
    is_active: true,
  };
}

export function countryToForm(item: Country): CountryFormValues {
  return {
    name_ar: item.name_ar ?? "",
    name_en: item.name_en ?? "",
    code: item.code ?? "",
    phone_code: item.phone_code ?? "",
    phone_length:
      item.phone_length != null ? String(item.phone_length) : "",
    phone_starts_with: item.phone_starts_with ?? "",
    flag: item.flag ?? "",
    is_active: !!item.is_active,
  };
}

export function CountryForm({
  mode,
  initial,
  saving,
  submitLabel,
  onCancel,
  onSubmit,
}: CountryFormProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<CountryFormValues>(() =>
    initial ? countryToForm(initial) : emptyCountryForm()
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    setValues(initial ? countryToForm(initial) : emptyCountryForm());
    setPendingFile(null);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (inputRef.current) inputRef.current.value = "";
  }, [initial]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const setField =
    (key: keyof CountryFormValues) =>
    (v: string | boolean) =>
      setValues((prev) => ({ ...prev, [key]: v }));

  const onPickFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("MESSAGES.uploadFailed"), t("LABELS.imageFileOnly"));
      return;
    }
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(file));
    setPendingFile(file);
  };

  const clearFile = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async () => {
    const name_ar = values.name_ar.trim();
    const name_en = values.name_en.trim();
    const code = values.code.trim().toUpperCase();
    const phone_code = values.phone_code.trim();
    const phone_length = Number(values.phone_length);
    const phone_starts_with = values.phone_starts_with.trim();

    if (!name_ar || !name_en) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.name") })
      );
      return;
    }
    if (!code) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.code") })
      );
      return;
    }
    if (!phone_code) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.phoneCode") })
      );
      return;
    }
    if (
      values.phone_length.trim() === "" ||
      Number.isNaN(phone_length) ||
      phone_length < 1
    ) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.phoneLimit") })
      );
      return;
    }
    if (!phone_starts_with) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.phoneStartsWith") })
      );
      return;
    }
    if (mode === "create" && !pendingFile) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.flag") })
      );
      return;
    }

    await onSubmit({
      ...values,
      name_ar,
      name_en,
      code,
      phone_code,
      phone_starts_with,
      flagFile: pendingFile,
    });
  };

  const existingFlag = values.flag.trim()
    ? mediaUrl(values.flag.trim()) ?? values.flag.trim()
    : null;
  const preview = localPreview || existingFlag;

  return (
    <Form values={values} onSubmit={submit} className="space-y-5 pb-8">
      {({ field, touch, errors }) => (
        <>
          <SectionCard
            icon={Globe}
            title={t("TITLES.basicInfo")}
            subtitle={t("LABELS.basicInfoCountryDesc")}
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
              <BaseTextInput
                name="code"
                label={`${t("TITLES.code")} *`}
                placeholder="SA"
                value={values.code}
                onInput={(v) => {
                  setField("code")(v);
                  touch("code");
                }}
                {...field("code", errors)}
              />
              <BaseSwitchInput
                name="is_active"
                label={t("TITLES.activeAccount")}
                value={values.is_active}
                onChange={(v) => setField("is_active")(v)}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Phone}
            title={t("TITLES.contactInfo")}
            subtitle={t("LABELS.basicInfoCountryDesc")}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BaseTextInput
                name="phone_code"
                label={`${t("TITLES.phoneCode")} *`}
                placeholder={t("LABELS.phoneCode")}
                value={values.phone_code}
                onInput={(v) => {
                  setField("phone_code")(v);
                  touch("phone_code");
                }}
                {...field("phone_code", errors)}
              />
              <BaseTextInput
                name="phone_length"
                type="number"
                label={`${t("TITLES.phoneLimit")} *`}
                placeholder={t("LABELS.phoneNumberLimit")}
                value={values.phone_length}
                onInput={(v) => {
                  setField("phone_length")(v);
                  touch("phone_length");
                }}
                {...field("phone_length", errors)}
              />
              <BaseTextInput
                name="phone_starts_with"
                label={`${t("TITLES.phoneStartsWith")} *`}
                placeholder={t("LABELS.phoneStartsWith")}
                value={values.phone_starts_with}
                onInput={(v) => {
                  setField("phone_starts_with")(v);
                  touch("phone_starts_with");
                }}
                {...field("phone_starts_with", errors)}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Photo}
            title={`${t("TITLES.flag")}${mode === "create" ? " *" : ""}`}
            subtitle={t("LABELS.flagImageDesc")}
          >
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              disabled={saving}
              onChange={(e) => {
                onPickFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />

            {!preview ? (
              <label
                htmlFor={inputId}
                className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-gradient-to-b from-muted/40 to-card px-4 py-12 transition-all hover:border-primary/50 hover:from-primary/5 hover:to-card"
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-105">
                  <CloudUpload width={26} height={26} />
                </span>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {t("TITLES.uploadImage")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("LABELS.imageFormats")}
                  </p>
                </div>
              </label>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex aspect-[3/2] max-h-56 items-center justify-center bg-[linear-gradient(45deg,var(--color-muted)_25%,transparent_25%),linear-gradient(-45deg,var(--color-muted)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--color-muted)_75%),linear-gradient(-45deg,transparent_75%,var(--color-muted)_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] p-4">
                  <img
                    src={preview}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full rounded-lg object-contain shadow-md ring-1 ring-border/60"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3">
                  <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {pendingFile?.name || t("TITLES.flag")}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="soft"
                      onClick={() => inputRef.current?.click()}
                    >
                      {t("ACTIONS.change")}
                    </Button>
                    {(pendingFile || mode === "create") && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={clearFile}
                      >
                        <X width={14} height={14} />
                        {t("ACTIONS.remove")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
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

/** Build multipart body for create/update country. */
export function buildCountryFormData(payload: CountrySubmitPayload): FormData {
  const fd = new FormData();
  fd.append("name_ar", payload.name_ar.trim());
  fd.append("name_en", payload.name_en.trim());
  fd.append("code", payload.code.trim().toUpperCase());
  fd.append("phone_code", payload.phone_code.trim());
  fd.append(
    "phone_length",
    String(Math.round(Number(payload.phone_length)))
  );
  fd.append("phone_starts_with", payload.phone_starts_with.trim());
  fd.append("is_active", payload.is_active ? "1" : "0");
  if (payload.flagFile) {
    fd.append("flag", payload.flagFile);
  }
  return fd;
}
