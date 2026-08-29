import { useTranslation } from "react-i18next";
import { getIconComponent } from "./sectionMeta";
import type { BlockTemplate } from "../../types/blocks";

interface BlockTemplateCardProps {
  tpl: BlockTemplate;
  currentLang: "ar" | "en";
  onAdd: (tpl: BlockTemplate) => void;
}

export function BlockTemplateCard({
  tpl,
  currentLang,
  onAdd,
}: BlockTemplateCardProps) {
  const { t } = useTranslation();
  const IconComp = getIconComponent(tpl.icon);

  return (
    <button
      type="button"
      onClick={() => onAdd(tpl)}
      className="flex flex-col text-start p-4 rounded-2xl border border-border/80 bg-card hover:bg-primary/5 hover:border-primary hover:shadow-md transition-all duration-200 group relative"
    >
      {/* Top row */}
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <IconComp className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md">
            {tpl.category}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {t("STATUS.available")}
        </span>
      </div>

      {/* Title & ID */}
      <div className="space-y-0.5 mb-1.5">
        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
          {currentLang === "ar" ? tpl.name_ar : tpl.name_en}
        </h4>
        <span className="text-[10px] font-mono text-muted-foreground block">
          {tpl.id}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
        {currentLang === "ar" ? tpl.description_ar : tpl.description_en}
      </p>

      {/* Shape Tags */}
      <div className="flex flex-wrap gap-1 mb-2.5">
        {tpl.shape_tags.map((tag, tagIdx) => (
          <span
            key={tagIdx}
            className="rounded-md bg-muted/60 border border-border/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer fields summary */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[10px] text-muted-foreground mt-auto w-full">
        <span>
          {t("TITLES.inputFieldsCount", { count: tpl.fields.length })}
        </span>
        <span className="font-mono truncate max-w-[150px]">
          {tpl.fields.map((f) => f.type).join(" • ")}
        </span>
      </div>
    </button>
  );
}