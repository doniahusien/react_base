import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  RectangleStackIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../UI/Button";
import { SectionItem } from "./SectionItem";
import type { PageSection } from "../../types/pageBuilder";
import type { BlockTemplate } from "../../types/blocks";

interface SectionsSidebarProps {
  sections: PageSection[];
  selectedSectionId: string | null;
  templates: BlockTemplate[];
  currentLang: "ar" | "en";
  onSelect: (id: string) => void;
  onToggleActive: (id: string) => void;
  onDuplicate: (section: PageSection) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function SectionsSidebar({
  sections,
  selectedSectionId,
  templates,
  currentLang,
  onSelect,
  onToggleActive,
  onDuplicate,
  onDelete,
  onAdd,
}: SectionsSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="lg:col-span-4 xl:col-span-4 rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b border-border p-3.5 bg-muted/20">
        <div className="flex items-center gap-2">
          <RectangleStackIcon className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t("TITLES.pageSections")}
          </h2>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
          {sections.length}
        </span>
      </div>

      {/* Sections List */}
      <div className="p-3 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            <SquaresPlusIcon className="h-10 w-10 mb-2 text-muted-foreground/50" />
            <p className="text-xs font-bold text-foreground">
              {t("TITLES.noSectionsYet")}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {t("LABELS.noSectionsDesc")}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={onAdd}
              className="mt-3 text-xs"
            >
              {t("BUTTONS.addFirstSection")}
            </Button>
          </div>
        ) : (
          sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              isSelected={selectedSectionId === section.id}
              onSelect={() => onSelect(section.id)}
              onToggleActive={() => onToggleActive(section.id)}
              onDuplicate={() => onDuplicate(section)}
              onDelete={() => onDelete(section.id)}
              currentLang={currentLang}
              templates={templates}
            />
          ))
        )}
      </div>

      {/* Bottom Add Trigger */}
      <div className="p-3 border-t border-border bg-muted/10">
        <Button
          variant="outline"
          onClick={onAdd}
          className="w-full gap-2 text-xs border-dashed hover:border-primary font-semibold"
        >
          <PlusIcon className="h-4 w-4 text-primary" />
          {t("BUTTONS.addNewSection")}
        </Button>
      </div>
    </aside>
  );
}