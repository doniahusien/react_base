/**
 * @file ThemeCustomizerEnhanced.tsx
 * @description Enhanced theme customizer with font, border radius, density options and live preview
 */

import { 
  CheckIcon as Check, 
  ViewColumnsIcon as Columns2, 
  MoonIcon as Moon, 
  ListBulletIcon as PanelLeft, 
  QueueListIcon as Rows3, 
  SunIcon as Sun, 
  XMarkIcon as X,
  Square3Stack3DIcon as Layers,
  CubeIcon as Cube,
  Squares2X2Icon as Grid,
  EyeIcon as Eye
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { 
  useAppStore, 
  type SidebarMode,
  type FontFamily,
  type BorderRadius,
  type Density 
} from "../store";

// ============================================================================
// Live Preview Component
// ============================================================================

function LivePreview({ 
  fontFamily, 
  borderRadius, 
  density,
  theme 
}: { 
  fontFamily: FontFamily; 
  borderRadius: BorderRadius; 
  density: Density;
  theme: "light" | "dark";
}) {
  const fontMap: Record<FontFamily, string> = {
    inter: 'font-sans',
    system: 'font-sans',
    changa: 'font-changa'
  };

  const radiusMap: Record<BorderRadius, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl'
  };

  const densityMap: Record<Density, { padding: string; gap: string; text: string }> = {
    compact: { padding: 'p-2', gap: 'gap-1', text: 'text-xs' },
    normal: { padding: 'p-3', gap: 'gap-2', text: 'text-sm' },
    comfortable: { padding: 'p-4', gap: 'gap-3', text: 'text-base' }
  };

  const font = fontMap[fontFamily];
  const radius = radiusMap[borderRadius];
  const { padding, gap, text } = densityMap[density];
  const bgClass = theme === 'dark' ? 'bg-[#0a0a0b]' : 'bg-[#f7f8fa]';
  const cardClass = theme === 'dark' ? 'bg-[#18181b]' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-[#e4e4e7]' : 'text-[#475569]';
  const mutedClass = theme === 'dark' ? 'text-[#a1a1aa]' : 'text-[#6b7280]';
  const borderClass = theme === 'dark' ? 'border-[#27272a]' : 'border-[#e2e8f0]';

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="size-4 text-primary" />
        <p className="text-xs font-semibold text-foreground">Live Preview</p>
      </div>
      
      <div className={`${bgClass} ${font} overflow-hidden rounded-lg border ${borderClass} h-32 relative`}>
        {/* Mini Header */}
        <div className={`${cardClass} ${borderClass} border-b ${padding} flex items-center justify-between`}>
          <div className="flex items-center gap-1.5">
            <div className={`${radius} size-2 bg-primary`} />
            <div className={`${radius} ${text} ${textClass} font-semibold`}>Dashboard</div>
          </div>
          <div className="flex items-center gap-1">
            <div className={`${radius} size-1.5 bg-muted`} />
            <div className={`${radius} size-1.5 bg-muted`} />
          </div>
        </div>

        {/* Mini Content */}
        <div className={`${padding} ${gap} flex flex-col`}>
          {/* Card 1 */}
          <div className={`${cardClass} ${borderClass} ${radius} border ${padding} flex items-center ${gap}`}>
            <div className={`${radius} bg-primary/20 w-6 h-6 flex items-center justify-center`}>
              <div className="size-3 rounded-full bg-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`${radius} ${text} ${textClass} font-medium truncate`}>Sample Card</div>
              <div className={`${radius} text-[10px] ${mutedClass} truncate`}>Preview content</div>
            </div>
            <div className={`${radius} bg-primary ${text} text-primary-foreground px-2 py-0.5 font-semibold`}>
              New
            </div>
          </div>

          {/* Card 2 */}
          <div className={`${cardClass} ${borderClass} ${radius} border ${padding} flex items-center justify-between`}>
            <div className={`${text} ${textClass} font-medium`}>Settings</div>
            <div className={`${radius} size-1.5 bg-primary`} />
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Real-time preview of your customizations
      </p>
    </div>
  );
}

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

export function ThemeCustomizerEnhanced() {
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
    borderRadius,
    setBorderRadius,
    density,
    setDensity,
  } = useAppStore();

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
    { id: "changa", label: "Changa", description: "Arabic optimized (default)" },
    { id: "inter", label: "Inter", description: "Modern, clean" },
    { id: "system", label: "System", description: "Native system font" },
  ];

  const RADII: { id: BorderRadius; label: string; description: string }[] = [
    { id: "none", label: "None", description: "Sharp corners" },
    { id: "sm", label: "Small", description: "Subtle rounding" },
    { id: "md", label: "Medium", description: "Balanced (default)" },
    { id: "lg", label: "Large", description: "Rounded look" },
    { id: "xl", label: "Extra Large", description: "Very rounded" },
  ];

  const DENSITIES: { id: Density; label: string; description: string; icon: typeof Grid }[] = [
    { id: "compact", label: "Compact", description: "More content, less space", icon: Grid },
    { id: "normal", label: "Normal", description: "Balanced spacing", icon: Layers },
    { id: "comfortable", label: "Comfortable", description: "Spacious layout", icon: Cube },
  ];

  if (!customizerOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        aria-label={t("THEME.Close")}
        onClick={() => setCustomizerOpen(false)}
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col border-s border-border bg-card shadow-2xl shadow-foreground/10"
        role="dialog"
        aria-labelledby="theme-customizer-title"
      >
        {/* Header */}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Live Preview Section */}
          <LivePreview 
            fontFamily={fontFamily}
            borderRadius={borderRadius}
            density={density}
            theme={theme}
          />

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

          {/* Color Scheme Section */}
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

          {/* Density Section */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t("THEME_CUSTOMIZER.density") || "Spacing Density"}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {DENSITIES.map((d) => {
                const active = density === d.id;
                const Icon = d.icon;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDensity(d.id)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-start transition-all ${
                      active
                        ? "border-primary ring-1 ring-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`flex size-10 items-center justify-center rounded-lg ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Icon width={20} height={20} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                        {d.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.description}</p>
                    </div>
                    {active && (
                      <Check width={16} height={16} className="text-primary shrink-0" strokeWidth={3} />
                    )}
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

export default ThemeCustomizerEnhanced;
