import { useState, useEffect } from "react";
import { PhotoIcon as Images, CloudArrowUpIcon as CloudUpload, CheckIcon as Check, SparklesIcon as Sparkles } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { BaseFilesInput, type FileOutputItem } from "./BaseFilesInput";
import { AvatarCustomizer } from "./AvatarCustomizer";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";

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

// Recommended avatar URLs - High-quality, diverse preset avatars
// Using multiple styles for variety and professional appearance
const RECOMMENDED_AVATARS = [
  // Professional personas style (diverse, business-friendly)
  "https://api.dicebear.com/7.x/personas/svg?seed=Alex&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/personas/svg?seed=Jordan&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/personas/svg?seed=Taylor&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/personas/svg?seed=Morgan&backgroundColor=ffd5dc",
  
  // Adventurer style (friendly, diverse)
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Riley&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Casey&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jamie&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Drew&backgroundColor=ffd5dc",
  
  // Lorelei style (elegant, modern)
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Sam&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Robin&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Avery&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Quinn&backgroundColor=ffd5dc",
  
  // Micah style (clean, professional)
  "https://api.dicebear.com/7.x/micah/svg?seed=Blake&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/micah/svg?seed=Cameron&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/micah/svg?seed=Skylar&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/micah/svg?seed=Reese&backgroundColor=ffd5dc",
  
  // Fun emoji style (friendly, universal)
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Star&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Heart&backgroundColor=b6e3f4",
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
  const [mode, setMode] = useState<"upload" | "preset" | "customize">("upload");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [uploadingPreset, setUploadingPreset] = useState(false);
  const hasError = touched && !!error;

  // Check if the current value is a preset avatar
  useEffect(() => {
    if (value?.media && RECOMMENDED_AVATARS.includes(value.media)) {
      setSelectedPreset(value.media);
      setMode("preset");
    }
  }, [value]);

  const handlePresetSelect = async (avatarUrl: string) => {
    setSelectedPreset(avatarUrl);
    setShowPresets(false);
    setUploadingPreset(true);
    onLoadingChange?.(true);
    
    try {
      // Fetch the avatar image from the URL
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      
      // Convert blob to File object
      const fileName = `avatar-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: blob.type || "image/png" });
      
      // Upload to backend using the same logic as BaseFilesInput
      if (attachment && model) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("collection", model);
        
        const GENERAL_BASE = (import.meta.env.VITE_BASE_URL_GENERAL as string) ?? "";
        const res = await api.post("media/upload", fd, { baseURL: GENERAL_BASE });
        
        const uploadedHash = res.data?.data?.hash ?? null;
        
        // Send the result back to parent in the same format as BaseFilesInput
        onChange?.({
          id: `preset-${Date.now()}`,
          file: file,
          type: "image",
          str: uploadedHash,
        });
        
        toast.success(t("MESSAGES.fileUploaded"));
      } else {
        // Local upload mode (without backend)
        const reader = new FileReader();
        reader.onload = () => {
          onChange?.({
            id: `preset-${Date.now()}`,
            file: file,
            type: "image",
            str: reader.result as string,
          });
        };
        reader.onerror = () => {
          toast.error(t("MESSAGES.uploadFailed"));
          setSelectedPreset(null);
        };
        reader.readAsDataURL(file);
      }
    } catch (error: any) {
      console.error("Failed to upload preset avatar:", error);
      toast.error(t("MESSAGES.uploadFailed"), error?.response?.data?.message);
      setSelectedPreset(null);
    } finally {
      setUploadingPreset(false);
      onLoadingChange?.(false);
    }
  };

  const handleUploadChange = (fileValue: FileOutputItem | FileOutputItem[] | null) => {
    setSelectedPreset(null);
    onChange?.(Array.isArray(fileValue) ? fileValue[0] : fileValue);
  };

  const handleSwitchToUpload = () => {
    setMode("upload");
    setSelectedPreset(null);
    onChange?.(null);
  };

  const handleShowPresets = () => {
    setMode("preset");
    setShowPresets(true);
  };

  const handleShowCustomizer = () => {
    setMode("customize");
    setShowCustomizer(true);
  };

  const handleCustomizerConfirm = async (avatarUrl: string) => {
    setShowCustomizer(false);
    setSelectedPreset(avatarUrl);
    await handlePresetSelect(avatarUrl);
  };

  const handleCustomizerCancel = () => {
    setShowCustomizer(false);
    setMode("upload");
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
            disabled={uploadingPreset}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
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
            onClick={handleShowPresets}
            disabled={uploadingPreset}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
              mode === "preset"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Images className="inline-block w-3 h-3 mr-1" />
            {t("LABELS.chooseAvatar") || "Choose"}
          </button>
          <button
            type="button"
            onClick={handleShowCustomizer}
            disabled={uploadingPreset}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
              mode === "customize"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="inline-block w-3 h-3 mr-1" />
            {t("LABELS.customizeAvatar") || "Customize"}
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
          <div className="p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-foreground">
                {t("LABELS.recommendedAvatars") || "Choose a recommended avatar"}
              </p>
            </div>
            
            {uploadingPreset && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                {t("MESSAGES.uploading") || "Uploading..."}
              </div>
            )}
            
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
              {RECOMMENDED_AVATARS.map((avatarUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePresetSelect(avatarUrl)}
                  disabled={uploadingPreset}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  {selectedPreset === avatarUrl && !uploadingPreset && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check width={14} height={14} />
                      </div>
                    </div>
                  )}
                  {selectedPreset === avatarUrl && uploadingPreset && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customize Mode */}
      {mode === "customize" && !showCustomizer && (
        <div
          className={`overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
            hasError
              ? "border-destructive bg-destructive/10 dark:bg-destructive/20"
              : "border-border bg-card"
          }`}
        >
          <div className="p-8 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
            <p className="text-sm font-medium text-foreground mb-2">
              {t("LABELS.customizeYourAvatar") || "Create Your Unique Avatar"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {t("LABELS.customizeAvatarHint") || "Choose style, colors, and accessories"}
            </p>
            <button
              type="button"
              onClick={handleShowCustomizer}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all"
            >
              <Sparkles width={15} height={15} />
              {t("BUTTONS.startCustomizing") || "Start Customizing"}
            </button>
          </div>
        </div>
      )}

      {hasError && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <span className="inline-block h-1 w-1 rounded-full bg-destructive shrink-0" />
          {error}
        </p>
      )}

      {/* Customizer Modal */}
      {showCustomizer && (
        <AvatarCustomizer
          onConfirm={handleCustomizerConfirm}
          onCancel={handleCustomizerCancel}
        />
      )}
    </div>
  );
}
