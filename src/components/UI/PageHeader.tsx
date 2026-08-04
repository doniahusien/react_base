import { PlusIcon as Plus } from "@heroicons/react/24/outline";
import React from "react";
import { useTranslation } from "react-i18next";
import { BannerBreadcrumb } from "./BannerBreadcrumb";

interface PageHeaderProps {
  title: string;
  translateTitle?: boolean; // Default true
  subtitle?: string | React.ReactNode;
  translateSubtitle?: boolean; // Default true for strings
  icon?: React.ComponentType<any>;
  total?: number;
  addHref?: string;
  addLabel?: string;
  path?: Array<string | { label: string; href?: string; icon?: React.ComponentType<any> }>;
  rightActions?: React.ReactNode;
  showHomeBreadcrumb?: boolean;
  breadcrumbSeparator?: "chevron" | "slash" | "dot";
  breadcrumbVariant?: "pill" | "minimal" | "underline" | "arrow";
}

export function PageHeader({
  title,
  translateTitle = true,
  subtitle,
  translateSubtitle = true,
  icon: Icon,
  total,
  addHref,
  addLabel,
  path = [],
  rightActions,
  showHomeBreadcrumb = false,
  breadcrumbSeparator = "chevron",
  breadcrumbVariant = "pill",
}: PageHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-6">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/80 to-card/60 p-6 shadow-sm [--ph-grad-start:color-mix(in_srgb,var(--color-primary)_18%,var(--color-card))] [--ph-grad-mid:color-mix(in_srgb,var(--color-primary)_8%,var(--color-card))] [--ph-overlay:var(--color-card)] [--ph-orb:color-mix(in_srgb,var(--color-secondary)_14%,transparent)] dark:[--ph-grad-start:color-mix(in_srgb,var(--color-primary)_10%,var(--color-card))] dark:[--ph-grad-mid:color-mix(in_srgb,var(--color-primary)_4%,var(--color-card))] dark:[--ph-overlay:var(--color-card)] dark:[--ph-orb:color-mix(in_srgb,var(--color-secondary)_10%,transparent)]">
        {/* Wave Background (filled organic shape) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute left-0 top-0 w-full h-48 lg:h-56" viewBox="0 0 1600 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <linearGradient id="phGrad" x1="0" x2="1">
                <stop offset="0%" stopColor="var(--ph-grad-start)" stopOpacity="0.95" />
                <stop offset="60%" stopColor="var(--ph-grad-mid)" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            {/* soft colored fill matching card top */}
            <path d="M0,120 C160,40 320,30 520,70 C720,110 880,170 1040,150 C1200,130 1360,80 1600,110 L1600 0 L0 0 Z" fill="url(#phGrad)" />
            {/* subtle pale overlay to emulate paper card shape */}
            <path d="M0,140 C180,90 340,70 540,100 C740,130 900,180 1080,160 C1260,140 1440,90 1600,120 L1600 300 L0 300 Z" fill="var(--ph-overlay)" opacity="0.96" />
            {/* accent orb on right */}
            <circle cx="1300" cy="60" r="64" fill="var(--ph-orb)" opacity="0.14" />
          </svg>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(var(--color-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] bg-[length:20px_20px]" />
         
        {/* Gradient Orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none opacity-[0.08] bg-[radial-gradient(circle,var(--color-primary),transparent_70%)] blur-[60px]" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full pointer-events-none opacity-[0.08] bg-[radial-gradient(circle,var(--color-secondary),transparent_70%)] blur-[60px]" />
 
        {path.length > 0 && (
          <div className="mb-8 w-full relative z-20">
            <BannerBreadcrumb
              items={path.map((seg) =>
                typeof seg === "string"
                  ? { label: t(`TITLES.${seg}`) }
                  : { label: t(`TITLES.${seg.label}`), href: seg.href, icon: seg.icon }
              )}
              showHome={showHomeBreadcrumb}
              separator={breadcrumbSeparator}
              variant={breadcrumbVariant}
            />
          </div>
        )}

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Left: Title Section */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {Icon && (
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="relative w-14 h-14 p-3 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 backdrop-blur-sm text-primary transition-transform hover:scale-105 hover:rotate-6">
                  <Icon className="w-full h-full" />
                </div>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-1">
                {translateTitle ? t(`TITLES.${title}`) : title}
              </h1>
              {subtitle && (
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {typeof subtitle === 'string' 
                    ? (translateSubtitle ? t(`LABELS.${subtitle}`) : subtitle)
                    : subtitle
                  }
                </div>
              )}
            </div>

          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {rightActions}
            {addHref && (
              <a 
                href={addHref} 
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-300 hover:bg-secondary hover:-translate-y-0.5 shadow-[0_2px_8px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] active:translate-y-0"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>{t("TITLES.add", { count: t(`TITLES.${addLabel ?? title}`) as any })}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
