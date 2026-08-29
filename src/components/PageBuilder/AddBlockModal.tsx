import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../UI/Button";
import { BlockTemplateCard } from "./BlockTemplateCard";
import type { BlockTemplate } from "../../types/blocks";

interface AddBlockModalProps {
  availableTemplates: BlockTemplate[];
  blockSearch: string;
  onBlockSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  currentLang: "ar" | "en";
  onAddBlock: (tpl: BlockTemplate) => void;
  onClose: () => void;
}

const CATEGORY_FILTERS = [
  { key: "all", tKey: "TITLES.all" },
  { key: "content_media", tKey: "TITLES.blockCatContentMedia" },
  { key: "cards_grid", tKey: "TITLES.blockCatCardsGrid" },
  { key: "workflow", tKey: "TITLES.blockCatWorkflow" },
  { key: "quotes", tKey: "TITLES.blockCatQuotes" },
  { key: "support", tKey: "TITLES.blockCatSupport" },
  { key: "legal", tKey: "TITLES.blockCatLegal" },
  { key: "hero", tKey: "TITLES.blockCatHero" },
];

export function AddBlockModal({
  availableTemplates,
  blockSearch,
  onBlockSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  currentLang,
  onAddBlock,
  onClose,
}: AddBlockModalProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">
                {t("TITLES.blocksLibraryTitle")}
              </h2>
              <Link
                to="/blocks"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-md"
              >
                <span>{t("BUTTONS.manageBlocks")}</span>
                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("LABELS.blocksLibraryDesc")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            placeholder={t("LABELS.searchBlockTemplates")}
            value={blockSearch}
            onChange={(e) => onBlockSearchChange(e.target.value)}
            className="w-full sm:w-80 rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
          />

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => onCategoryFilterChange(cat.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === cat.key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t(cat.tKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Block Catalog Grid - Matching Blocks CRUD definitions */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-1 max-h-[60vh]">
          {availableTemplates.length === 0 ? (
            <div className="sm:col-span-2 flex flex-col items-center justify-center p-10 text-center text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border">
              <SparklesIcon className="h-10 w-10 mb-2 opacity-40 text-primary" />
              <p className="text-xs font-bold text-foreground">
                {t("LABELS.noMatchingBlockTemplates")}
              </p>
            </div>
          ) : (
            availableTemplates.map((tpl) => (
              <BlockTemplateCard
                key={tpl.id}
                tpl={tpl}
                currentLang={currentLang}
                onAdd={onAddBlock}
              />
            ))
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            {t("BUTTONS.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}