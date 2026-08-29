import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowTopRightOnSquareIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface GlobalSliderNoticeProps {
  lang: "ar" | "en";
}

export function GlobalSliderNotice({ lang }: GlobalSliderNoticeProps) {
  const { i18n } = useTranslation();
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <PhotoIcon className="h-5 w-5 text-primary" />
          <h4 className="text-xs font-bold text-foreground">
            {i18n.t("TITLES.sliderGlobalTitle", { lng: lang })}
          </h4>
        </div>
        <Link
          to="/sliders"
          target="_blank"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
        >
          <span>{i18n.t("BUTTONS.manageSliderImages", { lng: lang })}</span>
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {i18n.t("LABELS.sliderGlobalDesc", { lng: lang })}
      </p>
    </div>
  );
}