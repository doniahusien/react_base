/**
 * @file ThemeCustomizer.tsx
 * @description Unified theme customizer with layout, color scheme, font, border radius, and theme presets
 */

import { 
  CheckIcon as Check, 
  ViewColumnsIcon as Columns2, 
  MoonIcon as Moon, 
  ListBulletIcon as PanelLeft, 
  QueueListIcon as Rows3, 
  SunIcon as Sun, 
  XMarkIcon as X
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  useAppStore, 
  type SidebarMode,
  type FontFamily,
  type FontSize,
  type BorderRadius
} from "../store";
import { applyBrandTheme, brandPresets } from "../theme-presets";

// ============================================================================
// Layout Preview Component
// ============================================================================

function LayoutPreview({ mode, active }: { mode: SidebarMode; active: boolean }) {
  const ring = active ? "ring-2 ring-primary border-primary/40" : "border-border hover:border-primary/30";

  if (mode === "horizontal") {
    return (
      <div className={`rounded-xl border bg-muted/40 p-2 transition-all ${ring}`}>
        <div className="mb-1.5 h-2 w-full rounded-sm bg-primary/70" />
        <div className="space-y-1">
          <div className="h-4 rounded-sm bg-card" />
          <div className="h-4 w-4/5 rounded-sm bg-card/80" />
        </div>
      </div>
    );
  }

  if (mode === "two-column") {
    return (
      <div className={`flex h-[4.5rem] gap-1 rounded-xl border bg-muted/40 p-2 transition-all ${ring}`}>
        <div className="flex w-3 flex-col gap-1 rounded-sm bg-primary/80 p-0.5">
          <span className="h-1.5 rounded-full bg-primary-foreground/90" />
          <span className="h-1.5 rounded-full bg-primary-foreground/50" />
          <span className="h-1.5 rounded-full bg-primary-foreground/50" />
        </div>
        <div className="flex w-6 flex-col gap-1 rounded-sm bg-card p-1">
          <span className="h-1 rounded-sm bg-muted-foreground/40" />
          <span className="h-1 rounded-sm bg-muted-foreground/25" />
          <span className="h-1 rounded-sm bg-muted-foreground/25" />
        </div>
        <div className="flex-1 space-y-1 pt-0.5">
          <div className="h-2 rounded-sm bg-card" />
          <div className="h-2 w-3/4 rounded-sm bg-card/70" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-[4.5rem] gap-1 rounded-xl border bg-muted/40 p-2 transition-all ${ring}`}>
      <div className="w-6 rounded-sm bg-primary/80" />
      <div className="flex-1 space-y-1 pt-0.5">
        <div className="h-2 rounded-sm bg-card" />
        <div className="h-2 w-3/4 rounded-sm bg-card/70" />
        <div className="h-2 w-1/2 rounded-sm bg-card/50" />
      </div>
    </div>
  );
}

// ============================================================================
// Border Radius Preview Component
// ============================================================================

function BorderRadiusPreview({ radius, active }: { radius: BorderRadius; active: boolean }) {
  const sizes = {
    none: { outer: 'rounded-none', inner: 'rounded-none' },
    sm: { outer: 'rounded-sm', inner: 'rounded-[2px]' },
    md: { outer: 'rounded-lg', inner: 'rounded-md' },
    lg: { outer: 'rounded-xl', inner: 'rounded-lg' },
    xl: { outer: 'rounded-2xl', inner: 'rounded-xl' }
  };

  const { outer, inner } = sizes[radius];
  const ring = active ? "ring-2 ring-primary border-primary/40" : "border-border hover:border-primary/30";

  return (
    <div className={`${outer} border bg-muted/40 p-3 transition-all ${ring}`}>
      <div className={`${inner} bg-primary/70 h-6 w-full`} />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ThemeCustomizer() {
  const { t } = useTranslation();
  const {
    customizerOpen,
    setCustomizerOpen,
    sidebarMode,
    setSidebarMode,
    theme,
    setTheme,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    borderRadius,
    setBorderRadius,
  } = useAppStore();

  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    try {
      return localStorage.getItem('selected-brand-theme') || 'purple';
    } catch {
      return 'purple';
    }
  });

  const handleBrandThemeSelect = (themeKey: string) => {
    applyBrandTheme(themeKey);
    setSelectedPreset(themeKey);
    try {
      localStorage.setItem('selected-brand-theme', themeKey);
    } catch {
      // Fail silently if localStorage isn't available
    }
  };

  const LAYOUTS: {
    id: SidebarMode;
    label: string;
    description: string;
    icon: typeof PanelLeft;
  }[] = [
    {
      id: "vertical",
      label: t("THEME.Vertical"),
      description: t("THEME.VerticalDesc"),
      icon: PanelLeft,
    },
    {
      id: "horizontal",
      label: t("THEME.Horizontal"),
      description: t("THEME.HorizontalDesc"),
      icon: Rows3,
    },
    {
      id: "two-column",
      label: t("THEME.TwoColumn"),
      description: t("THEME.TwoColumnDesc"),
      icon: Columns2,
    },
  ];

  const FONTS: { id: FontFamily; label: string; description: string }[] = [
    { id: "cairo", label: "Cairo", description: t("THEME_CUSTOMIZER.fontCairo") || "Arabic optimized" },
    { id: "tajawal", label: "Tajawal", description: t("THEME_CUSTOMIZER.fontTajawal") || "Elegant Arabic" },
    { id: "inter", label: "Inter", description: t("THEME_CUSTOMIZER.fontInter") || "Modern & clean" },
    { id: "changa", label: "Changa", description: t("THEME_CUSTOMIZER.fontChanga") || "Bold & friendly" },
    { id: "system", label: "System", description: t("THEME_CUSTOMIZER.fontSystem") || "System default" },
  ];

  const FONT_SIZES: { id: FontSize; label: string; description: string }[] = [
    { id: "small", label: "Small", description: t("THEME_CUSTOMIZER.fontSmall") || "Compact view" },
    { id: "medium", label: "Medium", description: t("THEME_CUSTOMIZER.fontMedium") || "Comfortable (default)" },
    { id: "large", label: "Large", description: t("THEME_CUSTOMIZER.fontLarge") || "Easy to read" },
  ];

  const RADII: { id: BorderRadius; label: string; description: string }[] = [
    { id: "none", label: "None", description: "Sharp corners" },
    { id: "sm", label: "Small", description: "Subtle rounding" },
    { id: "md", label: "Medium", description: "Balanced (default)" },
    { id: "lg", label: "Large", description: "Rounded look" },
    { id: "xl", label: "Extra Large", description: "Very rounded" },
  ];

  if (!customizerOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-background/60"
        aria-label={t("THEME.Close")}
        onClick={() => setCustomizerOpen(false)}
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col border-s border-border bg-card shadow-2xl shadow-foreground/10"
        role="dialog"
        aria-labelledby="theme-customizer-title"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="theme-customizer-title" className="text-base font-bold text-foreground">
              {t("THEME.ThemeCustomizer")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("THEME_CUSTOMIZER.subtitle") || "Customize your dashboard experience"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCustomizerOpen(false)}
            className="header-icon-btn"
            aria-label={t("THEME.Close")}
          >
            <X width={16} height={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Layout Section */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t("THEME.Layout")}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {LAYOUTS.map((layout) => {
                const active = sidebarMode === layout.id;
                const Icon = layout.icon;
                return (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => setSidebarMode(layout.id)}
                    className="group text-start"
                  >
                    <LayoutPreview mode={layout.id} active={active} />
                    <div className="mt-2 flex items-start justify-between gap-2 px-0.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Icon width={13} height={13} className={active ? "text-primary" : "text-muted-foreground"} />
                          <span className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                            {layout.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{layout.description}</p>
                      </div>
                      {active && (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check width={12} height={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Theme Preset Section */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t("THEME_PRESET.title") || "Theme Presets"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(brandPresets).map(([key, preset]) => {
                const active = selectedPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleBrandThemeSelect(key)}
                    className={`group rounded-3xl border p-3 text-left transition-all ${
                      active
                        ? "border-primary ring-1 ring-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div
                        className="h-12 w-12 rounded-2xl shadow-sm ring-1 ring-black/5"
                        style={{ backgroundColor: preset.brand500 }}
                      />
                      <div
                        className="h-12 w-12 rounded-2xl shadow-sm ring-1 ring-black/5"
                        style={{ backgroundColor: preset.brand600 }}
                      />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                        {preset.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </div>
                    {active && (
                      <span className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                        {t("BUTTONS.selected") || "Selected"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t("THEME.ColorScheme")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`rounded-xl border p-3 text-start transition-all ${
                  theme === "light"
                    ? "border-primary ring-2 ring-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="mb-2 flex h-12 items-center justify-center rounded-lg border border-border bg-background">
                  <Sun width={18} height={18} className="text-amber" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{t("THEME.Light")}</span>
                  {theme === "light" && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check width={12} height={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`rounded-xl border p-3 text-start transition-all ${
                  theme === "dark"
                    ? "border-primary ring-2 ring-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="mb-2 flex h-12 items-center justify-center rounded-lg border border-border bg-muted">
                  <Moon width={18} height={18} className="text-foreground" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{t("THEME.Dark")}</span>
                  {theme === "dark" && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check width={12} height={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>
            </div>
          </section>

          {/* Font Family Section */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t("THEME_CUSTOMIZER.font") || "Font Family"}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {FONTS.map((font) => {
                const active = fontFamily === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setFontFamily(font.id)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-start transition-all ${
                      active
                        ? "border-primary ring-1 ring-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                        {font.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{font.description}</p>
                    </div>
                    {active && (
                      <Check width={16} height={16} className="text-primary shrink-0" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Font Size Section */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t("THEME_CUSTOMIZER.fontSize") || "Font Size"}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {FONT_SIZES.map((size) => {
                const active = fontSize === size.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setFontSize(size.id)}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      active
                        ? "border-primary ring-1 ring-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`text-lg font-bold mb-1 ${active ? "text-primary" : "text-foreground"}`}>
                      {size.id === "small" ? "A" : size.id === "medium" ? "A" : "A"}
                      <span className="text-xs ml-0.5">{size.id === "small" ? "₁" : size.id === "medium" ? "₂" : "₃"}</span>
                    </div>
                    <p className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                      {size.label}
                    </p>
                    {active && (
                      <Check width={14} height={14} className="text-primary mx-auto mt-1" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2 px-1">
              {FONT_SIZES.find(s => s.id === fontSize)?.description}
            </p>
          </section>

          {/* Border Radius Section */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t("THEME_CUSTOMIZER.borderRadius") || "Border Radius"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {RADII.map((r) => {
                const active = borderRadius === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setBorderRadius(r.id)}
                    className="text-start"
                  >
                    <BorderRadiusPreview radius={r.id} active={active} />
                    <div className="mt-2 px-0.5">
                      <p className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                        {r.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

export default ThemeCustomizer;
