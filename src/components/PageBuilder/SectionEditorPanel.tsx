import { useTranslation } from "react-i18next";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { SectionHeaderCard } from "./SectionHeaderCard";
import { BlockContentForm } from "./BlockContentForm";
import type { PageSection } from "../../types/pageBuilder";
import type { BlockTemplate } from "../../types/blocks";

interface SectionEditorPanelProps {
  section: PageSection | null;
  templates: BlockTemplate[];
  currentLang: "ar" | "en";
  contentLang: "ar" | "en";
  onContentLangChange: (lang: "ar" | "en") => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (updater: (prevContent: any) => any) => void;
}

export function SectionEditorPanel({
  section,
  templates,
  currentLang,
  contentLang,
  onContentLangChange,
  onToggleActive,
  onDelete,
  onChange,
}: SectionEditorPanelProps) {
  const { t } = useTranslation();

  return (
    <main className="lg:col-span-8 xl:col-span-8 space-y-4">
      {section ? (
        <div className="w-full space-y-5">
          {/* Section Header Card */}
          <SectionHeaderCard
            section={section}
            templates={templates}
            currentLang={currentLang}
            contentLang={contentLang}
            onContentLangChange={onContentLangChange}
            onToggleActive={() => onToggleActive(section.id)}
            onDelete={() => onDelete(section.id)}
          />

          {/* Dedicated Block Form Fields */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <BlockContentForm
              section={section}
              lang={contentLang}
              onChange={onChange}
              currentUiLang={currentLang}
              templates={templates}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-xs flex flex-col items-center justify-center">
          <AdjustmentsHorizontalIcon className="h-12 w-12 mb-3 opacity-40 text-primary" />
          <h3 className="text-base font-bold text-foreground">
            {t("TITLES.selectSectionToManage")}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {t("LABELS.selectSectionToManageDesc")}
          </p>
        </div>
      )}
    </main>
  );
}