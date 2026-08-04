import { PlusIcon as Plus } from "@heroicons/react/24/outline";
import React from "react";
import { useTranslation } from "react-i18next";
import { BannerBreadcrumb } from "./BannerBreadcrumb";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
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
  subtitle,
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
      {/* Breadcrumb */}
      {path.length > 0 && (
        <div className="mb-4">
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

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-card/50 px-6 py-6 lg:px-8 lg:py-7 shadow-sm">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(var(--color-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] bg-[length:20px_20px]" />
        
        {/* Gradient Orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none opacity-[0.08] bg-[radial-gradient(circle,var(--color-primary),transparent_70%)] blur-[60px]" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full pointer-events-none opacity-[0.08] bg-[radial-gradient(circle,var(--color-secondary),transparent_70%)] blur-[60px]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Left: Title Section */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {Icon && (
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="relative w-14 h-14 p-3 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 backdrop-blur-sm border border-primary/20 text-primary transition-transform hover:scale-105 hover:rotate-6">
                  <Icon className="w-full h-full" />
                </div>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-1">
                {t(`TITLES.${title}`)}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`LABELS.${subtitle}`)}
                </p>
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
