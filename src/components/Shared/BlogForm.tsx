import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CloudArrowUpIcon as CloudUpload,
  DocumentTextIcon as Doc,
  PhotoIcon as Photo,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSwitchInput } from "../../components/Inputs/BaseSwitchInput";
import { RichTextEditor } from "../../components/Inputs/RichTextEditor";
import { SectionCard } from "../../components/Shared/SectionCard";
import { Button } from "../../components/UI/Button";
import { mediaUrl } from "../../lib/mediaUrl";
import { uploadBlogImage } from "../../lib/uploadBlogImage";
import { toast } from "../../stores/toast";
import type { Blog, BlogPayload } from "../../types/blogs";

export interface BlogFormValues {
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  image_url: string;
  is_published: boolean;
}

export type BlogSubmitPayload = BlogPayload & { imageFile?: File | null };

interface BlogFormProps {
  initial?: Blog | null;
  /** Existing blog id — enables immediate image upload to guest endpoint */
  blogId?: number;
  saving?: boolean;
  submitLabel?: string;
  onSubmit: (payload: BlogSubmitPayload) => void | Promise<void>;
  onCancel?: () => void;
}

export function emptyBlogForm(): BlogFormValues {
  return {
    title_ar: "",
    title_en: "",
    content_ar: "",
    content_en: "",
    image_url: "",
    is_published: true,
  };
}

export function blogToForm(blog: Blog): BlogFormValues {
  return {
    title_ar: blog.title_ar ?? "",
    title_en: blog.title_en ?? "",
    content_ar: blog.content_ar ?? blog.content ?? "",
    content_en: blog.content_en ?? "",
    image_url: blog.image_url ?? "",
    is_published: !!blog.is_published,
  };
}

export function BlogForm({
  initial,
  blogId,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: BlogFormProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<BlogFormValues>(() =>
    initial ? blogToForm(initial) : emptyBlogForm()
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setValues(initial ? blogToForm(initial) : emptyBlogForm());
    setPendingFile(null);
    setLocalPreview(null);
  }, [initial]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const setField =
    <K extends keyof BlogFormValues>(key: K) =>
    (v: BlogFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: v }));

  const clearPending = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("MESSAGES.uploadFailed"), t("LABELS.imageFileOnly"));
      return;
    }

    if (localPreview) URL.revokeObjectURL(localPreview);
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setPendingFile(file);

    if (!blogId) return;

    try {
      setUploading(true);
      const imageUrl = await uploadBlogImage(blogId, file);
      setField("image_url")(imageUrl);
      setPendingFile(null);
      toast.success(t("MESSAGES.imageUploaded"));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.uploadFailed"),
        e?.response?.data?.message || e?.message
      );
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    const titleAr = values.title_ar.trim();
    const contentAr = values.content_ar.trim();
    if (!titleAr) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.titleArabic") })
      );
      return;
    }
    if (!contentAr) {
      toast.error(
        t("MESSAGES.updateFailed"),
        t("VALIDATIONS.required", { field: t("TITLES.contentArabic") })
      );
      return;
    }
    await onSubmit({
      title_ar: titleAr,
      title_en: values.title_en.trim() || null,
      content_ar: contentAr,
      content_en: values.content_en.trim() || null,
      image_url: values.image_url.trim() || null,
      is_published: values.is_published,
      imageFile: pendingFile,
    });
  };

  const preview =
    localPreview ||
    (values.image_url.trim()
      ? mediaUrl(values.image_url.trim()) ?? values.image_url.trim()
      : null);

  return (
    <Form values={values} onSubmit={submit} className="space-y-5 pb-8">
      {({ field, touch, errors }) => (
        <>
          <SectionCard icon={Doc} title={t("TITLES.blogDetails")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BaseTextInput
                name="title_ar"
                label={`${t("TITLES.titleArabic")} *`}
                value={values.title_ar}
                onInput={(v) => {
                  setField("title_ar")(v);
                  touch("title_ar");
                }}
                {...field("title_ar", errors)}
              />
              <BaseTextInput
                name="title_en"
                label={t("TITLES.titleEnglish")}
                value={values.title_en}
                onInput={(v) => setField("title_en")(v)}
              />
            </div>

            <div className="mt-4 space-y-4">
              <RichTextEditor
                label={`${t("TITLES.contentArabic")} *`}
                value={values.content_ar}
                onChange={(v) => setField("content_ar")(v)}
                dir="rtl"
                placeholder={t("LABELS.blogContentPlaceholder")}
              />
              <RichTextEditor
                label={t("TITLES.contentEnglish")}
                value={values.content_en}
                onChange={(v) => setField("content_en")(v)}
                dir="ltr"
                placeholder={t("LABELS.blogContentPlaceholder")}
              />
            </div>

            <div className="mt-4 flex items-end pb-1">
              <BaseSwitchInput
                name="is_published"
                label={t("TITLES.published")}
                value={values.is_published}
                onChange={(v) => setField("is_published")(v)}
              />
            </div>
          </SectionCard>

          <SectionCard icon={Photo} title={t("TITLES.image")}>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading || saving}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onPickFile(file);
                e.target.value = "";
              }}
            />

            {!preview ? (
              <label
                htmlFor={inputId}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card py-10 transition-colors hover:border-primary/50 ${
                  uploading ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <span className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground">
                  <CloudUpload width={28} height={28} />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {uploading
                    ? t("MESSAGES.uploading")
                    : t("TITLES.uploadImage")}
                </span>
                {!blogId ? (
                  <span className="px-4 text-center text-xs text-muted-foreground">
                    {t("LABELS.blogImageAfterCreate")}
                  </span>
                ) : null}
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <img
                  src={preview}
                  alt=""
                  className="max-h-56 w-full object-cover"
                />
                <div className="absolute inset-e-2 top-2 flex gap-2">
                  <label
                    htmlFor={inputId}
                    className="cursor-pointer rounded-lg bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border hover:bg-background"
                  >
                    {uploading ? t("MESSAGES.uploading") : t("ACTIONS.change")}
                  </label>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => {
                      clearPending();
                      setField("image_url")("");
                    }}
                    className="flex size-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground shadow-sm"
                    aria-label={t("ACTIONS.delete")}
                  >
                    <X width={14} height={14} />
                  </button>
                </div>
                {values.image_url ? (
                  <p className="border-t border-border bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
                    {values.image_url}
                  </p>
                ) : pendingFile ? (
                  <p className="border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    {pendingFile.name}
                  </p>
                ) : null}
              </div>
            )}
          </SectionCard>

          <div className="flex flex-wrap gap-3">
            {onCancel ? (
              <Button type="button" variant="soft" onClick={onCancel}>
                {t("BUTTONS.cancel")}
              </Button>
            ) : null}
            <Button type="submit" loading={saving || uploading}>
              {submitLabel ?? t("BUTTONS.save")}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
