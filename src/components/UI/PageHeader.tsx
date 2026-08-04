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
}: PageHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="modern-page-header">
      {/* Breadcrumb */}
      {path.length > 0 && (
        <div className="header-breadcrumb">
          <BannerBreadcrumb
            items={path.map((seg) =>
              typeof seg === "string"
                ? { label: t(`TITLES.${seg}`) }
                : { label: t(`TITLES.${seg.label}`), href: seg.href, icon: seg.icon }
            )}
          />
        </div>
      )}

      {/* Header Card */}
      <div className="header-card">
        {/* Background Effects */}
        <div className="header-bg-pattern" />
        <div className="header-gradient-orb header-gradient-orb-1" />
        <div className="header-gradient-orb header-gradient-orb-2" />

        <div className="header-content">
          {/* Left: Title Section */}
          <div className="header-left">
            {Icon && (
              <div className="header-icon-wrapper">
                <div className="header-icon-bg" />
                <Icon className="header-icon" />
              </div>
            )}
            
            <div className="header-text">
              <h1 className="header-title">{t(`TITLES.${title}`)}</h1>
              {subtitle && (
                <p className="header-subtitle">{t(`LABELS.${subtitle}`)}</p>
              )}
            </div>

            {total !== undefined && (
              <div className="header-badge">
                <span className="header-badge-dot" />
                <span className="header-badge-text">{total}</span>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="header-right">
            {rightActions}
            {addHref && (
              <a href={addHref} className="header-add-btn">
                <Plus className="header-add-icon" />
                <span>{t("TITLES.add", { count: t(`TITLES.${addLabel ?? title}`) as any })}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
