import { CheckIcon as Check, ViewColumnsIcon as Columns2, MoonIcon as Moon, ListBulletIcon as PanelLeft, QueueListIcon as Rows3, SunIcon as Sun, XMarkIcon as X } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useAppStore, type SidebarMode } from "../store";

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

export function ThemeCustomizer() {
  const { t } = useTranslation();
  const {
    customizerOpen,
    setCustomizerOpen,
    sidebarMode,
    setSidebarMode,
    theme,
    setTheme,
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
        className="relative z-10 flex h-full w-full max-w-sm flex-col border-s border-border bg-card shadow-2xl shadow-foreground/10"
        role="dialog"
        aria-labelledby="theme-customizer-title"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="theme-customizer-title" className="text-base font-bold text-foreground">
              {t("THEME.ThemeCustomizer")}
            </h2>
            <p className="text-xs text-muted-foreground">{t("THEME.LayoutAndColorScheme")}</p>
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

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
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
        </div>
      </aside>
    </div>
  );
}
