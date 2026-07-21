import { Plus } from "lucide-react";
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
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  total,
  addHref,
  addLabel,
  path = [],
}: PageHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="page-header relative -mx-6 overflow-hidden px-6 py-6 sm:py-8">
      {/* Watermark icon */}
      {Icon && (
        <div className="pointer-events-none absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 opacity-[0.06]">
          <Icon size={160} className="page-header-watermark" />
        </div>
      )}

      <div className="relative">
        {path.length > 0 && (
          <BannerBreadcrumb
            items={path.map((seg) =>
              typeof seg === "string"
                ? { label: t(`TITLES.${seg}`) }
                : { label: t(`TITLES.${seg.label}`), href: seg.href, icon: seg.icon }
            )}
          />
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex items-end gap-5">
            <div className="flex gap-4">
              {/* Accent rule */}
              <div className="w-1 self-stretch rounded-full bg-primary opacity-70" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none page-header-title">
                  {t(`TITLES.${title}`)}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm font-normal page-header-subtitle">
                    {t(`LABELS.${subtitle}`)}
                  </p>
                )}
              </div>
            </div>

            {total !== undefined && (
              <div className="mb-0.5 flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                <span className="text-xs text-muted">{t("TITLES.total")}</span>
                <span className="text-xs font-bold tabular-nums page-header-count">{total}</span>
              </div>
            )}
          </div>

          {addHref && (
            <a
              href={addHref}
              className="group inline-flex w-fit items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold transition-all page-header-btn hover:bg-primary/20 hover:border-primary/60 active:scale-95"
            >
              <Plus size={15} className="transition-transform duration-200 group-hover:rotate-90" />
              {t("TITLES.add", { count: t(`TITLES.${addLabel ?? title}`) as any })}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
