import { useTranslation } from "react-i18next";
import { EyeIcon, EyeSlashIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "../UI/Button";
import { getSectionMeta, getIconComponent } from "./sectionMeta";
import type { PageSection } from "../../types/pageBuilder";
import type { BlockTemplate } from "../../types/blocks";

interface SectionHeaderCardProps {
  section: PageSection;
  templates: BlockTemplate[];
  currentLang: "ar" | "en";
  contentLang: "ar" | "en";
  onContentLangChange: (lang: "ar" | "en") => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

export function SectionHeaderCard({
  section,
  templates,
  currentLang,
  contentLang,
  onContentLangChange,
  onToggleActive,
  onDelete,
}: SectionHeaderCardProps) {
  const { t } = useTranslation();
  const meta = getSectionMeta(section.type, templates, currentLang);
  const IconComp = getIconComponent(meta.icon);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 mt-0.5">
            <IconComp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary font-mono">
                {section.type}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  section.is_active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    section.is_active ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                {section.is_active
                  ? t("TITLES.activeOnWebsite")
                  : t("TITLES.disabledHidden")}
              </span>
            </div>

            <h2 className="text-lg font-bold text-foreground mt-1.5">
              {meta.name}
            </h2>
            {meta.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {meta.description}
              </p>
            )}
          </div>
        </div>

        {/* Section Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleActive}
            className="text-xs gap-1.5"
          >
            {section.is_active ? (
              <>
                <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
                {t("BUTTONS.hideSection")}
              </>
            ) : (
              <>
                <EyeIcon className="h-4 w-4 text-emerald-600" />
                {t("BUTTONS.showSection")}
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-xs gap-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <TrashIcon className="h-4 w-4" />
            {t("BUTTONS.delete")}
          </Button>
        </div>
      </div>

      {/* Content Language Switcher */}
      <div className="flex items-center justify-between bg-muted/30 p-2 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground ps-2">
            {t("TITLES.editContentFieldsIn")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onContentLangChange("ar")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              contentLang === "ar"
                ? "bg-primary text-primary-foreground shadow-xs scale-102"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t("TITLES.languageArabic")}
          </button>
          <button
            type="button"
            onClick={() => onContentLangChange("en")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              contentLang === "en"
                ? "bg-primary text-primary-foreground shadow-xs scale-102"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t("TITLES.languageEnglish")}
          </button>
        </div>
      </div>
    </div>
  );
}