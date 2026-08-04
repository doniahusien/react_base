import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckIcon as Check, ArrowPathIcon as RefreshCw } from "@heroicons/react/24/outline";

interface AvatarCustomizerProps {
  onConfirm: (avatarUrl: string) => void;
  onCancel: () => void;
}

// Avatar customization options
const AVATAR_STYLES = [
  { id: "avataaars", label: "Cartoon", icon: "🎨" },
  { id: "personas", label: "Professional", icon: "💼" },
  { id: "lorelei", label: "Elegant", icon: "✨" },
  { id: "adventurer", label: "Friendly", icon: "😊" },
  { id: "micah", label: "Modern", icon: "🎯" },
  { id: "big-smile", label: "Happy", icon: "😄" },
];

const SKIN_TONES = [
  { id: "ffdbb4", label: "Light", color: "#ffdbb4" },
  { id: "edb98a", label: "Light-Medium", color: "#edb98a" },
  { id: "d08b5b", label: "Medium", color: "#d08b5b" },
  { id: "ae5d29", label: "Medium-Dark", color: "#ae5d29" },
  { id: "8d5524", label: "Dark", color: "#8d5524" },
  { id: "614335", label: "Deep", color: "#614335" },
];

const HAIR_COLORS = [
  { id: "000000", label: "Black", color: "#000000" },
  { id: "4a312c", label: "Dark Brown", color: "#4a312c" },
  { id: "8b4513", label: "Brown", color: "#8b4513" },
  { id: "d2691e", label: "Light Brown", color: "#d2691e" },
  { id: "ffd700", label: "Blonde", color: "#ffd700" },
  { id: "ff6347", label: "Auburn", color: "#ff6347" },
  { id: "dc143c", label: "Red", color: "#dc143c" },
  { id: "c0c0c0", label: "Gray", color: "#c0c0c0" },
  { id: "ff1493", label: "Pink", color: "#ff1493" },
  { id: "9370db", label: "Purple", color: "#9370db" },
  { id: "4169e1", label: "Blue", color: "#4169e1" },
  { id: "32cd32", label: "Green", color: "#32cd32" },
];

const BACKGROUNDS = [
  { id: "b6e3f4", label: "Sky Blue", color: "#b6e3f4" },
  { id: "c0aede", label: "Lavender", color: "#c0aede" },
  { id: "d1d4f9", label: "Periwinkle", color: "#d1d4f9" },
  { id: "ffd5dc", label: "Pink", color: "#ffd5dc" },
  { id: "ffdfbf", label: "Peach", color: "#ffdfbf" },
  { id: "c9e4de", label: "Mint", color: "#c9e4de" },
  { id: "f3d2c1", label: "Coral", color: "#f3d2c1" },
  { id: "fef6e4", label: "Cream", color: "#fef6e4" },
];

const ACCESSORIES = [
  { id: "default", label: "None" },
  { id: "prescription01", label: "Glasses 1" },
  { id: "prescription02", label: "Glasses 2" },
  { id: "sunglasses", label: "Sunglasses" },
  { id: "eyepatch", label: "Eyepatch" },
];

// Random seed generator
const generateRandomSeed = () => {
  return Math.random().toString(36).substring(2, 15);
};

export function AvatarCustomizer({ onConfirm, onCancel }: AvatarCustomizerProps) {
  const { t } = useTranslation();
  const [style, setStyle] = useState(AVATAR_STYLES[0].id);
  const [seed, setSeed] = useState(generateRandomSeed());
  const [skinTone, setSkinTone] = useState(SKIN_TONES[2].id);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0].id);
  const [background, setBackground] = useState(BACKGROUNDS[0].id);
  const [accessory, setAccessory] = useState(ACCESSORIES[0].id);

  // Generate avatar URL based on current options
  const getAvatarUrl = () => {
    const params = new URLSearchParams({
      seed: seed,
      backgroundColor: background,
    });

    // Add style-specific parameters
    if (style === "avataaars") {
      params.append("skinColor", skinTone);
      params.append("hairColor", hairColor);
      if (accessory !== "default") {
        params.append("accessories", accessory);
      }
    }

    return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`;
  };

  const handleRandomize = () => {
    setSeed(generateRandomSeed());
    setSkinTone(SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id);
    setHairColor(HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id);
    setBackground(BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)].id);
  };

  const handleConfirm = () => {
    onConfirm(getAvatarUrl());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-background border border-border shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {t("LABELS.customizeAvatar") || "Customize Your Avatar"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("LABELS.customizeAvatarDesc") || "Create a unique avatar by selecting options below"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRandomize}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-all"
          >
            <RefreshCw width={14} height={14} />
            {t("BUTTONS.randomize") || "Randomize"}
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={getAvatarUrl()}
                alt="Avatar preview"
                className="w-48 h-48 rounded-full border-4 border-primary shadow-lg"
              />
            </div>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              {t("LABELS.avatarStyle") || "Avatar Style"}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all hover:scale-105 ${
                    style === s.id
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs font-medium text-foreground">{s.label}</span>
                  {style === s.id && (
                    <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check width={12} height={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              {t("LABELS.skinTone") || "Skin Tone"}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setSkinTone(tone.id)}
                  className={`relative aspect-square rounded-xl border-2 transition-all hover:scale-105 ${
                    skinTone === tone.id
                      ? "border-primary shadow-lg"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: tone.color }}
                >
                  {skinTone === tone.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                        <Check width={14} height={14} />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              {t("LABELS.hairColor") || "Hair Color"}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {HAIR_COLORS.map((hair) => (
                <button
                  key={hair.id}
                  type="button"
                  onClick={() => setHairColor(hair.id)}
                  className={`relative aspect-square rounded-xl border-2 transition-all hover:scale-105 ${
                    hairColor === hair.id
                      ? "border-primary shadow-lg"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: hair.color }}
                >
                  {hairColor === hair.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
                        <Check width={14} height={14} />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              {t("LABELS.backgroundColor") || "Background Color"}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setBackground(bg.id)}
                  className={`relative aspect-square rounded-xl border-2 transition-all hover:scale-105 ${
                    background === bg.id
                      ? "border-primary shadow-lg"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: bg.color }}
                >
                  {background === bg.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                        <Check width={14} height={14} />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories (only for avataaars style) */}
          {style === "avataaars" && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                {t("LABELS.accessories") || "Accessories"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setAccessory(acc.id)}
                    className={`relative flex items-center justify-center rounded-xl border-2 p-3 transition-all hover:scale-105 ${
                      accessory === acc.id
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground">{acc.label}</span>
                    {accessory === acc.id && (
                      <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check width={12} height={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            {t("BUTTONS.cancel") || "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all"
          >
            <Check width={15} height={15} />
            {t("BUTTONS.useThisAvatar") || "Use This Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
}
