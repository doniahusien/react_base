import { Link } from "react-router-dom";
import {
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

export type DynamicDataVariant = "contact" | "faq" | "blog";

interface DynamicDataCardProps {
  variant: DynamicDataVariant;
  translate: (key: string, opts?: Record<string, any>) => string;
}

const VARIANTS: Record<
  DynamicDataVariant,
  {
    card: string;
    iconWrap: string;
    cta: string;
    icon: React.ComponentType<{ className?: string }>;
    titleKey: string;
    descKey: string;
    ctaKey: string;
    href: string;
  }
> = {
  contact: {
    card: "rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3",
    iconWrap:
      "size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20",
    cta: "inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors shrink-0",
    icon: PhoneIcon,
    titleKey: "TITLES.dynamicContactData",
    descKey: "LABELS.dynamicContactDataDesc",
    ctaKey: "BUTTONS.editContactSettings",
    href: "/contact-settings",
  },
  faq: {
    card: "rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-4 space-y-3",
    iconWrap:
      "size-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20",
    cta: "inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition-colors shrink-0",
    icon: QuestionMarkCircleIcon,
    titleKey: "TITLES.dynamicFaqs",
    descKey: "LABELS.dynamicFaqsDesc",
    ctaKey: "BUTTONS.manageQuestions",
    href: "/questions",
  },
  blog: {
    card: "rounded-xl border border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/20 p-4 space-y-3",
    iconWrap:
      "size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20",
    cta: "inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition-colors shrink-0",
    icon: DocumentTextIcon,
    titleKey: "TITLES.dynamicBlogs",
    descKey: "LABELS.dynamicBlogsDesc",
    ctaKey: "BUTTONS.manageBlogs",
    href: "/blogs",
  },
};

export function DynamicDataCard({
  variant,
  translate,
}: DynamicDataCardProps) {
  const v = VARIANTS[variant];
  const IconComp = v.icon;

  return (
    <div className={v.card}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={v.iconWrap}>
            <IconComp className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              {translate(v.titleKey)}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {translate(v.descKey)}
            </p>
          </div>
        </div>
        <Link
          to={v.href}
          target="_blank"
          className={v.cta}
        >
          <span>{translate(v.ctaKey)}</span>
          <ArrowTopRightOnSquareIcon className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}