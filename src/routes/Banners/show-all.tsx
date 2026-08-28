import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { slidersService } from "../../services/slidersService";
import { toast } from "../../stores/toast";
import type { SliderImage } from "../../types/banners";

const SITE_PRESET_IMAGES = [
  "/images/slider1.webp",
  "/images/slider2.webp",
  "/images/slider3.webp",
  "/images/slider4.webp",
  "/images/slider5.webp",
  "/images/slider6.webp",
  "/images/slider7.webp",
  "/images/header1.webp",
  "/images/about.webp",
];

// ==========================================
// Slider Image Card
// ==========================================
interface SlideCardProps {
  slide: SliderImage;
  index: number;
  currentLang: "ar" | "en";
  onDelete: () => void;
  onToggleStatus: () => void;
}

function SlideCard({
  slide,
  index,
  currentLang,
  onDelete,
  onToggleStatus,
}: SlideCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-card shadow-2xs transition-all ${
        slide.is_active
          ? "border-border/80 hover:border-primary/40 hover:shadow-xs"
          : "border-border/40 opacity-60"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-16/9 w-full overflow-hidden bg-muted">
        <img
          src={slide.image}
          alt={slide.alt?.[currentLang] || `Slide ${index + 1}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/800x450/1e293b/white?text=Slide";
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

        {/* Status */}
        <span
          className={`absolute top-2 end-2 rounded-lg px-2 py-0.5 text-[10px] font-bold backdrop-blur-xs ${
            slide.is_active
              ? "bg-emerald-500/90 text-white"
              : "bg-muted-foreground/80 text-white"
          }`}
        >
          {slide.is_active
            ? currentLang === "ar" ? "ظاهرة" : "Visible"
            : currentLang === "ar" ? "مخفية" : "Hidden"}
        </span>

        {/* Actions */}
        <div className="absolute bottom-2 end-2 flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleStatus}
            className="rounded-lg bg-black/60 p-1.5 text-white/90 backdrop-blur-xs hover:bg-black/80"
            title={slide.is_active ? "Hide" : "Show"}
          >
            {slide.is_active ? (
              <EyeIcon className="h-4 w-4" />
            ) : (
              <EyeSlashIcon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-black/60 p-1.5 text-rose-300 backdrop-blur-xs hover:bg-rose-600 hover:text-white"
            title={currentLang === "ar" ? "حذف الصورة" : "Delete image"}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Path */}
      <div className="px-3 py-2">
        <p
          className="truncate font-mono text-[10px] text-muted-foreground"
          title={slide.image}
        >
          {slide.image.startsWith("data:")
            ? currentLang === "ar" ? "صورة مرفوعة محلياً" : "Uploaded image"
            : slide.image}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// Sliders (Global Images Pool) CRUD
// ==========================================
export default function SlidersShowAll() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "ar" | "en";

  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stagedImages, setStagedImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSliders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await slidersService.list();
      setSlides(data);
    } catch (e) {
      toast.error("Failed to load slider images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSliders();
  }, [fetchSliders]);

  const activeCount = useMemo(
    () => slides.filter((s) => s.is_active).length,
    [slides]
  );

  const handleOpenAdd = () => {
    setStagedImages([]);
    setUrlInput("");
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setStagedImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStagePreset = (src: string) => {
    setStagedImages((prev) => (prev.includes(src) ? prev : [...prev, src]));
  };

  const handleAddUrl = () => {
    const val = urlInput.trim();
    if (!val) return;
    handleStagePreset(val);
    setUrlInput("");
  };

  const handleSaveStaged = async () => {
    if (stagedImages.length === 0) {
      toast.error(
        currentLang === "ar"
          ? "يرجى اختيار أو رفع صورة واحدة على الأقل"
          : "Please select or upload at least one image"
      );
      return;
    }
    setSaving(true);
    try {
      await slidersService.add(stagedImages);
      toast.success(
        currentLang === "ar"
          ? `تمت إضافة ${stagedImages.length} صورة إلى السلايدر`
          : `${stagedImages.length} image(s) added to the slider`
      );
      setIsModalOpen(false);
      fetchSliders();
    } catch {
      toast.error("Error saving slider images");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (slide: SliderImage) => {
    await slidersService.toggleStatus(slide.id);
    setSlides((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const handleDelete = async (slide: SliderImage) => {
    if (
      !confirm(
        currentLang === "ar"
          ? "هل أنت متأكد من حذف هذه الصورة من السلايدر؟"
          : "Are you sure you want to delete this slider image?"
      )
    )
      return;
    await slidersService.remove(slide.id);
    toast.success(currentLang === "ar" ? "تم حذف الصورة" : "Image deleted");
    fetchSliders();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="banners"
        subtitle="bannersDesc"
        icon={PhotoIcon}
        total={slides.length}
        path={["dashboard", "banners"]}
        rightActions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchSliders} className="gap-1.5">
              <ArrowPathIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentLang === "ar" ? "تحديث" : "Refresh"}
              </span>
            </Button>
            <Button size="sm" onClick={handleOpenAdd} className="gap-1.5">
              <PlusIcon className="h-4 w-4" />
              <span>{currentLang === "ar" ? "إضافة صور للسلايدر" : "Add Slider Images"}</span>
            </Button>
          </div>
        }
      />

      {/* Explanation banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              {currentLang === "ar"
                ? "مكتبة صور السلايدر العامة لكل صفحات الموقع"
                : "Global slider images library for all website pages"}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {currentLang === "ar"
                ? "هذه الصور فقط هي ما يتم عرضه في السلايدر خلف الهيدر أو البانر في جميع صفحات الموقع. يقوم الباك إند بإرجاعها كمصفوفة صور (sliders) مع استجابة كل صفحة، بينما تتحكم أنت في نصوص الهيدر لكل صفحة من إدارة الصفحات."
                : "These images are the only source for the carousel behind every page header/banner. The backend returns them as an images array (`sliders`) with every page response, while each page manages only its own header texts."}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold">
              <span className="rounded-lg bg-card px-2 py-1 text-foreground border border-border">
                {currentLang === "ar" ? "إجمالي الصور" : "Total images"}: {slides.length}
              </span>
              <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-emerald-600 dark:text-emerald-400">
                {currentLang === "ar" ? "ظاهرة في الموقع" : "Visible on site"}: {activeCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-16/9 animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 p-12 text-center">
          <PhotoIcon className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-sm font-bold text-foreground">
            {currentLang === "ar" ? "لا توجد صور في السلايدر بعد" : "No slider images yet"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {currentLang === "ar"
              ? "أضف صور السلايدر ليتم عرضها خلف هيدر جميع صفحات الموقع"
              : "Add images to be displayed behind every page header on the website"}
          </p>
          <Button size="sm" onClick={handleOpenAdd} className="mt-4 gap-1.5">
            <PlusIcon className="h-4 w-4" />
            {currentLang === "ar" ? "إضافة صور للسلايدر" : "Add Slider Images"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {slides.map((slide, index) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              index={index}
              currentLang={currentLang}
              onDelete={() => handleDelete(slide)}
              onToggleStatus={() => handleToggleStatus(slide)}
            />
          ))}
        </div>
      )}

      {/* Add Images Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <PhotoIcon className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold text-foreground">
                  {currentLang === "ar"
                    ? "إضافة صور إلى سلايدر الموقع"
                    : "Add images to the website slider"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* Upload */}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 p-8 transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <ArrowUpTrayIcon className="mb-2 h-8 w-8 text-muted-foreground/50" />
                  <span className="text-xs font-bold text-foreground">
                    {currentLang === "ar"
                      ? "اضغط لرفع صور من جهازك (يمكن اختيار أكثر من صورة)"
                      : "Click to upload images from your device (multiple allowed)"}
                  </span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">
                    PNG, JPG, WEBP
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Add by URL */}
              <div className="flex items-end gap-2">
                <BaseTextInput
                  className="flex-1"
                  label={currentLang === "ar" ? "أو أضف عبر رابط الصورة" : "Or add via image URL"}
                  placeholder="/images/slider1.webp"
                  value={urlInput}
                  onInput={(v) => setUrlInput(v)}
                  prependInputIcon={LinkIcon}
                />
                <Button type="button" variant="outline" onClick={handleAddUrl} className="h-11">
                  {currentLang === "ar" ? "إضافة" : "Add"}
                </Button>
              </div>

              {/* Site presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">
                  {currentLang === "ar"
                    ? "اختيار سريع من صور الموقع الجاهزة"
                    : "Quick pick from built-in site images"}
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {SITE_PRESET_IMAGES.map((img) => {
                    const selected = stagedImages.includes(img);
                    return (
                      <button
                        key={img}
                        type="button"
                        onClick={() => handleStagePreset(img)}
                        className={`relative aspect-16/9 overflow-hidden rounded-xl border transition-all ${
                          selected
                            ? "border-primary ring-2 ring-primary/40"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img src={img} alt={img} className="h-full w-full object-cover" />
                        {selected && (
                          <span className="absolute inset-0 flex items-center justify-center bg-primary/40 text-[10px] font-bold text-white">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Staged list */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-xs font-bold text-foreground">
                  {currentLang === "ar" ? "الصور الجاهزة للإضافة" : "Images ready to add"} (
                  {stagedImages.length})
                </label>
                {stagedImages.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">
                    {currentLang === "ar"
                      ? "لم تختر أي صور بعد."
                      : "No images selected yet."}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {stagedImages.map((img, idx) => (
                      <div
                        key={`${img}-${idx}`}
                        className="relative aspect-16/9 overflow-hidden rounded-xl border border-border"
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setStagedImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 end-1 rounded-md bg-black/70 p-1 text-white hover:bg-rose-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                {currentLang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleSaveStaged} disabled={saving}>
                {saving
                  ? currentLang === "ar" ? "جاري الحفظ..." : "Saving..."
                  : currentLang === "ar"
                  ? `حفظ (${stagedImages.length})`
                  : `Save (${stagedImages.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
