import { useState, useRef, useId } from "react";
import {
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface ImageInputProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  currentLang?: "ar" | "en";
  presetImages?: string[];
  disabled?: boolean;
}

const DEFAULT_PRESETS = [
  "/images/about.webp",
  "/images/slider1.webp",
  "/images/slider5.webp",
  "/images/slider6.webp",
];

export function ImageInput({
  label,
  value = "",
  onChange,
  currentLang = "ar",
  presetImages = DEFAULT_PRESETS,
  disabled = false,
}: ImageInputProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [activeDrag, setActiveDrag] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDrag(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChange(file);
    }
  };

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
            ? "اختيار من صور الموقع الجاهزة"
            : "Choose from Presets"}
        </button>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleFileChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {/* Image Uploader & Preview Box */}
      {!value ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setActiveDrag(true);
          }}
          onDragLeave={() => setActiveDrag(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-all duration-200 ${
            activeDrag
              ? "border-primary bg-primary/10"
              : "border-border/80 bg-muted/10 hover:border-primary/50 hover:bg-muted/20"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CloudArrowUpIcon className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-foreground">
              {currentLang === "ar"
                ? "انقر لرفع صورة أو اسحبها وأفلتها هنا"
                : "Click to upload or drag and drop image"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              PNG, JPG, WEBP, SVG
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card group shadow-xs">
          <div className="h-40 sm:h-44 w-full overflow-hidden bg-muted flex items-center justify-center">
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400";
              }}
            />
          </div>

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-zinc-900 shadow-md hover:bg-white transition-all flex items-center gap-1.5"
            >
              <PhotoIcon className="h-4 w-4 text-primary" />
              {currentLang === "ar" ? "تغيير الصورة" : "Change Image"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all flex items-center gap-1.5"
            >
              <XMarkIcon className="h-4 w-4" />
              {currentLang === "ar" ? "حذف" : "Remove"}
            </button>
          </div>
        </div>
      )}

      {/* Preset Images Quick Selector */}
      {showPresets && (
        <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2 animate-in fade-in">
          <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
            <SparklesIcon className="h-3.5 w-3.5 text-primary" />
            {currentLang === "ar"
              ? "صور جاهزة من موقع المنصة:"
              : "Platform presets:"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {presetImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(img);
                  setShowPresets(false);
                }}
                className={`group relative h-16 rounded-xl overflow-hidden border transition-all ${
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
