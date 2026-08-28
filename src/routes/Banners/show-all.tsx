import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PhotoIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { Deleter } from "../../components/Shared/Deleter";
import { slidersService } from "../../services/slidersService";
import { toast } from "../../stores/toast";
import type { SliderImage } from "../../types/banners";

const SITE_PRESET_IMAGES = [
  "/images/images/slider1.webp",
  "/images/images/slider2.webp",
  "/images/images/slider3.webp",
  "/images/images/slider4.webp",
  "/images/images/slider5.webp",
  "/images/images/slider6.webp",
  "/images/images/slider7.webp",
  "/images/images/header1.webp",
  "/images/images/about.webp",
];

// ==========================================
// Slider Image Card
// ==========================================
interface SlideCardProps {
  slide: SliderImage;
  index: number;
  currentLang: "ar" | "en";
  onToggleStatus: () => void;
  onDeleteSuccess: () => void;
}

function SlideCard({
  slide,
  index,
  currentLang,
  onToggleStatus,
  onDeleteSuccess,
}: SlideCardProps) {
  const { t } = useTranslation();
  
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
            ? t("TITLES.visible")
            : t("TITLES.hidden")}
        </span>

        {/* Actions */}
        <div className="absolute bottom-2 end-2 flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleStatus}
            className="rounded-lg bg-black/60 p-1.5 text-white/90 backdrop-blur-xs hover:bg-black/80"
            title={slide.is_active ? t("TITLES.hidden") : t("TITLES.visible")}
          >
            {slide.is_active ? (
              <EyeIcon className="h-4 w-4" />
            ) : (
              <EyeSlashIcon className="h-4 w-4" />
            )}
          </button>
          <div className="">
            <Deleter
              url={`/sliders/${slide.id}`}
              onReload={onDeleteSuccess}
              text=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Sliders (Global Images Pool) CRUD
// ==========================================
export default function SlidersShowAll() {
  const { t, i18n } = useTranslation();
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
      toast.error(t("LABELS.failedToLoadSliderImages"));
    } finally {
      setLoading(false);
    }
  }, [t]);

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


  const handleSaveStaged = async () => {
    if (stagedImages.length === 0) {
      toast.error(t("LABELS.selectAtLeastOne"));
      return;
    }
    setSaving(true);
    try {
      await slidersService.add(stagedImages);
      toast.success(
        t("LABELS.imagesAddedToSlider", { count: stagedImages.length })
      );
      setIsModalOpen(false);
      fetchSliders();
    } catch {
      toast.error(t("LABELS.errorSavingSliderImages"));
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

  return (
    <div className="space-y-4">
      <PageHeader
        title="banners"
        subtitle="bannersDesc"
        icon={PhotoIcon}
        total={slides.length}
        path={["dashboard", "banners"]}
        rightActions={
          <Button size="sm" onClick={handleOpenAdd} className="gap-1.5">
            <PlusIcon className="h-4 w-4" />
            <span>{t("LABELS.addImages")}</span>
          </Button>
        }
      />

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
            {t("LABELS.noSliderImages")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("LABELS.addSliderImagesDesc")}
          </p>
          <Button size="sm" onClick={handleOpenAdd} className="mt-4 gap-1.5">
            <PlusIcon className="h-4 w-4" />
            {t("LABELS.addSliderImages")}
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
              onToggleStatus={() => handleToggleStatus(slide)}
              onDeleteSuccess={fetchSliders}
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
                  {t("LABELS.addImagesToSlider")}
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
                    {t("LABELS.uploadFromDevice")}
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

        
              {/* Site presets */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-foreground">
                  {t("LABELS.quickPickImages")}
                </label>
                <div className="grid grid-cols-3 mt-2! gap-2 sm:grid-cols-5">
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
                        <img 
                          src={img} 
                          alt={img} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/400x225/f1f5f9/64748b?text=Image+Preview";
                          }}
                        />
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
                  {t("LABELS.imagesReadyToAdd")} ({stagedImages.length})
                </label>
                {stagedImages.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">
                    {t("LABELS.noImagesSelected")}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {stagedImages.map((img, idx) => (
                      <div
                        key={`${img}-${idx}`}
                        className="relative aspect-16/9 overflow-hidden rounded-xl border border-border"
                      >
                        <img 
                          src={img} 
                          alt="" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/400x225/f1f5f9/64748b?text=Image+Preview";
                          }}
                        />
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
                {t("BUTTONS.cancel")}
              </Button>
              <Button onClick={handleSaveStaged} disabled={saving}>
                {saving
                  ? t("BUTTONS.saving")
                  : `${t("BUTTONS.save")} (${stagedImages.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
