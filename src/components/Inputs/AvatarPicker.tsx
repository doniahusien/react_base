import { useState, useEffect } from "react";
import { PhotoIcon as Images, CloudArrowUpIcon as CloudUpload, XMarkIcon as X, CheckIcon as Check } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { BaseFilesInput, type FileOutputItem } from "./BaseFilesInput";

interface AvatarPickerProps {
  name: string;
  label?: string;
  accept?: string;
  attachment?: boolean;
  model?: string;
  value?: any;
  onChange?: (value: FileOutputItem | null) => void;
  onLoadingChange?: (loading: boolean) => void;
  error?: string;
  touched?: boolean;
}

// Recommended avatar URLs - you can replace these with your own avatar images
const RECOMMENDED_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Princess",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Boots",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Snickers",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Kiki",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Simba",
];

export function AvatarPicker({
  name,
  label,
  accept = "image/*",
  attachment = false,
  model,
  value,
  onChange,
  onLoadingChange,
  error,
  touched = false,
}: AvatarPickerProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"upload" | "preset">("upload");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const hasError = touched && !!error;

  // Check if the current value is a preset avatar
  useEffect(() => {
    if (value?.media && RECOMMENDED_AVATARS.includes(value.media)) {
      setSelectedPreset(value.media);
      setMode("preset");
    }
  }, [value]);

  const handlePresetSelect = (avatarUrl: string) => {
    setSelectedPreset(avatarUrl);
    setMode("preset");
    setShowPresets(false);
    
    // Convert preset avatar to the same format as uploaded files
    onChange?.({
      id: `preset-${avatarUrl}`,
      file: null,
      type: "image",
      str: avatarUrl,
    });
  };

  const handleUploadChange = (fileValue: FileOutputItem | FileOutputItem[] | null) => {
    setSelectedPreset(null);
    setMode("upload");
    onChange?.(Array.isArray(fileValue) ? fileValue[0] : fileValue);
  };

  const handleSwitchToUpload = () => {
    setMode("upload");
    setSelectedPreset(null);
    onChange?.(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with mode tabs */}
      <div className="flex items-center justify-between">
        {label && (
          <div className="flex items-center gap-2">
            <div
              className={`flex size-7 items-center justify-center rounded-full ${
                hasError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              }`}
            >
              <Images width={14} height={14} />
            </div>
            <span
              className={`text-sm font-semibold ${
                hasError ? "text-destructive" : "text-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              mode === "upload"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CloudUpload className="inline-block w-3 h-3 mr-1" />
            {t("LABELS.uploadImage") || "Upload"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("preset");
              setShowPresets(true);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              mode === "preset"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Images className="inline-block w-3 h-3 mr-1" />
            {t("LABELS.chooseAvatar") || "Choose Avatar"}
          </button>
        </div>
      </div>

      {/* Upload Mode */}
      {mode === "upload" && (
        <BaseFilesInput
          name={name}
          accept={accept}
          attachment={attachment}
          model={model}
          value={value}
          onChange={handleUploadChange}
          onLoadingChange={onLoadingChange}
          error={error}
          touched={touched}
        />
      )}

      {/* Preset Mode */}
      {mode === "preset" && (
        <div
          className={`overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
            hasError
              ? "border-destructive bg-destructive/10 dark:bg-destructive/20"
              : "border-border bg-card"
          }`}
        >
          {/* Selected preset preview */}
          {selectedPreset && !showPresets && (
            <div className="relative">
              <img
                src={selectedPreset}
                alt="Selected avatar"
                className="h-[200px] w-full rounded-t-2xl object-cover bg-muted"
              />
              <div className="absolute bottom-3 left-3">
                <span className="rounded-full px-3 py-1 text-xs font-medium bg-success-soft text-success-foreground flex items-center gap-1">
                  <Check width={12} height={12} />
                  {t("MESSAGES.avatarSelected") || "Avatar Selected"}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPresets(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90"
                >
                  <Images width={12} height={12} />
                  {t("BUTTONS.changeAvatar") || "Change"}
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToUpload}
                  className="flex items-center justify-center rounded-lg bg-destructive text-destructive-foreground shadow-md transition-all hover:bg-destructive/90 h-7 w-7"
                >
                  <X width={14} height={14} />
                </button>
              </div>
            </div>
          )}

          {/* Preset avatars grid */}
          {(!selectedPreset || showPresets) && (
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {t("LABELS.recommendedAvatars") || "Choose a recommended avatar"}
                </p>
                {showPresets && selectedPreset && (
                  <button
                    type="button"
                    onClick={() => setShowPresets(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X className="inline-block w-3 h-3 mr-1" />
                    {t("BUTTONS.cancel") || "Cancel"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
                {RECOMMENDED_AVATARS.map((avatarUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetSelect(avatarUrl)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all hover:scale-105 ${
                      selectedPreset === avatarUrl
                        ? "border-primary shadow-lg shadow-primary/30"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={avatarUrl}
                      alt={`Avatar ${index + 1}`}
                      className="h-full w-full object-cover bg-muted"
                    />
                    {selectedPreset === avatarUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check width={14} height={14} />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasError && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <span className="inline-block h-1 w-1 rounded-full bg-destructive shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
