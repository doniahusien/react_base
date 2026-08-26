import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CloudArrowUpIcon as CloudUpload,
  DocumentTextIcon as Doc,
  PhotoIcon as Photo,
  TagIcon as Tag,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { Form } from "../../components/Inputs/Form";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { BaseSwitchInput } from "../../components/Inputs/BaseSwitchInput";
import { BaseSelectInput, type SelectOption } from "../../components/Inputs/BaseSelectInput";
import { RichTextEditor } from "../../components/Inputs/RichTextEditor";
import { SectionCard } from "../../components/Shared/SectionCard";
import { Button } from "../../components/UI/Button";
import { mediaUrl } from "../../lib/mediaUrl";
import { normalizeResponse } from "../../lib/normalizeResponse";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import { useAppStore } from "../../store";
import type { Blog, BlogPayload } from "../../types/blogs";
import type { BlogCategory } from "../../types/blogCategories";

export interface BlogFormValues {
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  blog_category_id: string;
  image_url: string;
  is_published: boolean;
}

export type BlogSubmitPayload = BlogPayload & { imageFile?: File | null };

interface BlogFormProps {
  initial?: Blog | null;
  saving?: boolean;
  submitLabel?: string;
  onSubmit: (payload: BlogSubmitPayload) => void | Promise<void>;
  onCancel?: () => void;
}

function emptyBlogForm(): BlogFormValues {
  return {
    title_ar: "",
    title_en: "",
    content_ar: "",
    content_en: "",
    blog_category_id: "",
    image_url: "",
    is_published: true,
  };
}

function blogToForm(blog: Blog): BlogFormValues {
  return {
    title_ar: blog.title_ar ?? "",
    title_en: blog.title_en ?? "",
    content_ar: blog.content_ar ?? blog.content ?? "",
    content_en: blog.content_en ?? "",
    blog_category_id: blog.category?.id != null ? String(blog.category.id) : "",
    image_url: blog.image_url ?? "",
    is_published: !!blog.is_published,
  };
}

export function buildBlogFormData(payload: BlogSubmitPayload): FormData {
  const fd = new FormData();
  fd.append("title_ar", payload.title_ar);
  fd.append("title_en", payload.title_en ?? "");
  fd.append("content_ar", payload.content_ar);
  fd.append("content_en", payload.content_en ?? "");
  fd.append("is_published", payload.is_published ? "1" : "0");
  if (payload.blog_category_id != null) {
    fd.append("blog_category_id", String(payload.blog_category_id));
  }
  if (payload.imageFile) {
    fd.append("image", payload.imageFile);
  }
  return fd;
}

export function BlogForm({
  initial,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: BlogFormProps) {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<BlogFormValues>(() =>
    initial ? blogToForm(initial) : emptyBlogForm()
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    setValues(initial ? blogToForm(initial) : emptyBlogForm());
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

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const res = await api.get("blog-categories", {
          params: { per_page: 100 },
        });
        const rows = normalizeResponse<BlogCategory>(res.data).data;
        if (cancelled) return;
        const mapped: SelectOption[] = rows.map((item) => ({
          id: item.id,
          name:
            lang === "ar"
              ? item.name_ar || item.name_en || item.name || String(item.id)
              : item.name_en || item.name_ar || item.name || String(item.id),
        }));
        if (
          initial?.category &&
          !mapped.some((o) => String(o.id) === String(initial.category!.id))
        ) {
          mapped.unshift({
            id: initial.category.id,
            name: initial.category.name || String(initial.category.id),
          });
        }
        setCategoryOptions(mapped);
      } catch {
        if (!cancelled) setCategoryOptions([]);
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [lang, initial?.category]);

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
    const categoryId = values.blog_category_id
      ? Number(values.blog_category_id)
      : null;
    await onSubmit({
      title_ar: titleAr,
      title_en: values.title_en.trim() || null,
      content_ar: contentAr,
      content_en: values.content_en.trim() || null,
      blog_category_id: categoryId && !Number.isNaN(categoryId) ? categoryId : null,
      is_published: values.is_published,
      imageFile: pendingFile,
    });
  };

  const preview =
    localPreview ||
    (values.image_url.trim()
      ? mediaUrl(values.image_url.trim()) ?? values.image_url.trim()
      : null);

  const selectedCategory =
    categoryOptions.find(
      (o) => String(o.id) === String(values.blog_category_id)
    ) ?? null;

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
              <BaseSelectInput
                name="blog_category_id"
                label={t("TITLES.blogCategory")}
                items={categoryOptions}
                value={selectedCategory}
                onChange={(v) => {
                  const opt = Array.isArray(v) ? v[0] : v;
                  setField("blog_category_id")(
                    opt?.id != null ? String(opt.id) : ""
                  );
                  touch("blog_category_id");
                }}
                prependInputIcon={Tag}
                {...field("blog_category_id", errors)}
              />
              <div className="flex items-end pb-1">
                <BaseSwitchInput
                  name="is_published"
                  label={t("TITLES.published")}
                  value={values.is_published}
                  onChange={(v) => setField("is_published")(v)}
                />
              </div>
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
          </SectionCard>

          <SectionCard icon={Photo} title={t("TITLES.image")}>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/*"
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
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card py-10 transition-colors hover:border-primary/50"
              >
                <span className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground">
                  <CloudUpload width={28} height={28} />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {t("TITLES.uploadImage")}
                </span>
                <span className="px-4 text-center text-xs text-muted-foreground">
                  {t("LABELS.imageFormats")}
                </span>
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
                    {t("ACTIONS.change")}
                  </label>
                  <button
                    type="button"
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
                {pendingFile ? (
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
            <Button type="submit" loading={saving}>
              {submitLabel ?? t("BUTTONS.save")}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
