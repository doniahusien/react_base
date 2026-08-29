import { useTranslation } from "react-i18next";
import {
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Deleter } from "../Shared/Deleter";
import { getSectionMeta, getIconComponent } from "./sectionMeta";
import type { PageSection } from "../../types/pageBuilder";
import type { BlockTemplate } from "../../types/blocks";

interface SectionItemProps {
  section: PageSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggleActive: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  currentLang: "ar" | "en";
  templates: BlockTemplate[];
}

export function SectionItem({
  section,
  isSelected,
  onSelect,
  onToggleActive,
  onDuplicate,
  onDelete,
  currentLang,
  templates,
}: SectionItemProps) {
  const { t } = useTranslation();
  const meta = getSectionMeta(section.type, templates, currentLang);
  const IconComp = getIconComponent(meta.icon);

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between gap-2.5 rounded-xl border p-3 transition-all cursor-pointer select-none ${
        isSelected
          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
          : "border-border/80 bg-card hover:bg-muted/40"
      } ${!section.is_active ? "opacity-60 bg-muted/30" : ""}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <IconComp className="h-3.5 w-3.5" />
        </div>

        <div className="truncate min-w-0">
          <p className="text-xs sm:text-sm font-bold text-foreground truncate">
            {meta.name}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono truncate">
            {section.type}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visibility */}
        <button
          onClick={onToggleActive}
          title={section.is_active ? t("TITLES.visible") : t("TITLES.hidden")}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {section.is_active ? (
            <EyeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <EyeSlashIcon className="h-4 w-4 text-rose-500" />
          )}
        </button>

        {/* Duplicate */}
        <button
          onClick={onDuplicate}
          title={t("TITLES.duplicateSection")}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <DocumentDuplicateIcon className="h-4 w-4" />
        </button>

        {/* Delete */}
        <div className="shrink-0" title={t("TITLES.deleteSection")}>
          <Deleter onRemove={onDelete} text="" />
        </div>
      </div>
    </div>
  );
}