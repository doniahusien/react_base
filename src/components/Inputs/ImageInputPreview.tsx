import { useState } from "react";
import {
  PhotoIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

interface ImageInputPreviewProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  currentLang?: "ar" | "en";
  presetImages?: string[];
}

const DEFAULT_PRESETS = [
  "/images/about.webp",
  "/images/slider1.webp",
  "/images/slider5.webp",
  "/images/slider6.webp",
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
  "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600",
];

export function ImageInputPreview({
  label,
  value = "",
  onChange,
  placeholder = "/images/about.webp or https://...",
  currentLang = "ar",
  presetImages = DEFAULT_PRESETS,
}: ImageInputPreviewProps) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-bold text-foreground">{label}</label>
        )}
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-[11px] font-bold text-primary hover:underline"
        >
          {showPresets
            ? currentLang === "ar"
              ? "إخفاء الصور المقترحة"
              : "Hide Presets"
            : currentLang === "ar"
            ? "عرض صور جاهزة من الموقع"
            : "Choose from Presets"}
        </button>
      </div>

      {/* Input + Preview row */}
      <div className="flex items-center gap-3">
        {/* Preview Thumbnail */}
        <div className="size-12 shrink-0 rounded-xl border border-border bg-muted overflow-hidden relative group">
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
              <PhotoIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-border bg-background py-2 pe-8 ps-3 text-xs focus:border-primary focus:outline-none font-mono"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-rose-500"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Presets List */}
      {showPresets && (
        <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2 animate-in fade-in">
          <p className="text-[11px] font-bold text-muted-foreground">
            {currentLang === "ar"
              ? "صور مستخدمة في موقع منصة الوسيط:"
              : "Platform preset images:"}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {presetImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(img);
                  setShowPresets(false);
                }}
                className={`group relative h-16 rounded-lg overflow-hidden border transition-all ${
                  value === img
                    ? "border-primary ring-2 ring-primary"
                    : "border-border hover:border-primary/60"
                }`}
              >
                <img
                  src={img}
                  alt={`preset-${idx}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
