import { useTranslation } from "react-i18next";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { BaseTextInput } from "../Inputs/BaseTextInput";
import { IconPicker } from "../Inputs/IconPicker";
import { ImageInput } from "../Inputs/ImageInput";
import { GlobalSliderNotice } from "./GlobalSliderNotice";
import { DynamicDataCard } from "./DynamicDataCard";
import type { PageSection } from "../../types/pageBuilder";
import type { BlockTemplate } from "../../types/blocks";

// ============================================================================
// Small shared field primitives (kept local to this form)
// ============================================================================

function SectionTextArea({
  label,
  value,
  onChange,
  rows = 2,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-foreground">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none ${className}`}
      />
    </div>
  );
}

function RepeaterHeader({
  label,
  count,
  addLabel,
  onAdd,
}: {
  label: string;
  count: number;
  addLabel: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-bold text-foreground">
        {label} ({count})
      </label>
      <button
        type="button"
        onClick={onAdd}
        className="text-xs font-bold text-primary hover:underline"
      >
        {addLabel}
      </button>
    </div>
  );
}

// ============================================================================
// DEDICATED BLOCK SPECIFIC CONTENT FORM
// ============================================================================

interface BlockSpecificContentFormProps {
  section: PageSection;
  lang: "ar" | "en";
  onChange: (updater: (prev: any) => any) => void;
  currentUiLang: "ar" | "en";
  templates?: BlockTemplate[];
}

export function BlockContentForm({
  section,
  lang,
  onChange,
  currentUiLang,
}: BlockSpecificContentFormProps) {
  const { t, i18n } = useTranslation();
  const ct = (key: string, opts?: Record<string, any>) => {
    const translated = i18n.t(key, { lng: currentUiLang, ...opts });
    return key.startsWith("FIELDS.")
      ? `${translated} (${lang.toUpperCase()})`
      : translated;
  };
  const contentT = (key: string, opts?: Record<string, any>) =>
    i18n.t(key, { lng: lang, ...opts });
  const content = section.content[lang] || {};

  switch (section.type) {
    // 1. Home Header (Hero Carousel)
    case "hero_header": {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.topBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.titleLine1")}
              value={content.title_line1 || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title_line1: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.titleLine2")}
              value={content.title_line2 || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title_line2: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.highlightText")}
              value={content.title_highlight || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title_highlight: e.target.value }))}
            />
          </div>

          <SectionTextArea
            label={ct("FIELDS.mainDescription")}
            value={content.description || ""}
            rows={3}
            onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.primaryCtaText")}
              value={content.cta_text || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, cta_text: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.primaryCtaLink")}
              value={content.cta_link || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, cta_link: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.secondaryCtaText")}
              value={content.secondary_cta_text || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, secondary_cta_text: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.secondaryCtaLink")}
              value={content.secondary_cta_link || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, secondary_cta_link: e.target.value }))}
            />
          </div>

          <GlobalSliderNotice lang={currentUiLang} />
        </div>
      );
    }

    // 2. Home Services Grid (Expanding Cards)
    case "cards_grid_with_icons_images": {
      const services = content.services || [];
      return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {ct("TITLES.servicesCards")}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {ct("LABELS.servicesCardsDesc")}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  services: [
                    ...(prev.services || []),
                    {
                      id: `serv-${Date.now()}`,
                      title: contentT("TITLES.newService"),
                      description: "",
                      icon: "Scale",
                      image: "/images/service1.webp",
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-colors shrink-0"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>{ct("BUTTONS.addServiceCard")}</span>
            </button>
          </div>

          <div className="space-y-3">
            {services.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {item.title || (ct("TITLES.serviceNumber", { count: idx + 1 }))}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        services: (prev.services || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="p-1 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors"
                    title={ct("TITLES.deleteCard")}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <BaseTextInput
                    label={ct("FIELDS.serviceTitle")}
                    value={item.title || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.services || [])];
                        arr[idx] = { ...arr[idx], title: e.target.value };
                        return { ...prev, services: arr };
                      })
                    }
                  />
                  <IconPicker
                    label={ct("FIELDS.serviceIcon")}
                    value={item.icon || "Scale"}
                    onChange={(iconVal) =>
                      onChange((prev) => {
                        const arr = [...(prev.services || [])];
                        arr[idx] = { ...arr[idx], icon: iconVal };
                        return { ...prev, services: arr };
                      })
                    }
                    currentLang={lang}
                  />
                </div>

                <div className="space-y-3">
                  <ImageInput
                    label={ct("FIELDS.cardBackgroundImage")}
                    value={item.image || ""}
                    onChange={(imgVal) =>
                      onChange((prev) => {
                        const arr = [...(prev.services || [])];
                        arr[idx] = { ...arr[idx], image: imgVal };
                        return { ...prev, services: arr };
                      })
                    }
                    currentLang={lang}
                    presetImages={[
                      "/images/service1.webp",
                      "/images/service2.webp",
                      "/images/service3.webp",
                      "/images/slider1.webp",
                      "/images/about.webp",
                    ]}
                  />

                  <SectionTextArea
                    label={ct("FIELDS.hoverDescription")}
                    value={item.description || ""}
                    rows={2}
                    className="rounded-xl"
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.services || [])];
                        arr[idx] = { ...arr[idx], description: e.target.value };
                        return { ...prev, services: arr };
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. How To Work (Steps)
    case "steps_workflow_cards": {
      const steps = content.steps || [];
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.sectionTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <SectionTextArea
            label={ct("FIELDS.subtitleDescription")}
            value={content.description || ""}
            rows={2}
            onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
          />

          {/* Steps Repeater */}
          <div className="space-y-3 pt-3 border-t border-border">
            <RepeaterHeader
              label={ct("TITLES.workflowSteps")}
              count={steps.length}
              addLabel={`+ ${ct("BUTTONS.addStep")}`}
              onAdd={() =>
                onChange((prev) => ({
                  ...prev,
                  steps: [
                    ...(prev.steps || []),
                    {
                      id: `step-${Date.now()}`,
                      step_number: `0${(prev.steps?.length || 0) + 1}`,
                      title: contentT("TITLES.newStep"),
                      description: "",
                    },
                  ],
                }))
              }
            />

            {steps.map((step: any, idx: number) => (
              <div
                key={step.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                      {step.step_number || `0${idx + 1}`}
                    </span>
                    <span className="text-xs font-bold text-foreground">{step.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        steps: (prev.steps || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="text-muted-foreground hover:text-rose-500 text-xs"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <BaseTextInput
                    label={ct("FIELDS.stepNumber")}
                    value={step.step_number || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.steps || [])];
                        arr[idx] = { ...arr[idx], step_number: e.target.value };
                        return { ...prev, steps: arr };
                      })
                    }
                  />
                  <div className="sm:col-span-2">
                    <BaseTextInput
                      label={ct("FIELDS.stepTitle")}
                      value={step.title || ""}
                      onChange={(e) =>
                        onChange((prev) => {
                          const arr = [...(prev.steps || [])];
                          arr[idx] = { ...arr[idx], title: e.target.value };
                          return { ...prev, steps: arr };
                        })
                      }
                    />
                  </div>
                </div>

                <IconPicker
                  label={ct("FIELDS.stepIcon")}
                  value={step.icon || "Sparkles"}
                  onChange={(iconVal) =>
                    onChange((prev) => {
                      const arr = [...(prev.steps || [])];
                      arr[idx] = { ...arr[idx], icon: iconVal };
                      return { ...prev, steps: arr };
                    })
                  }
                  currentLang={lang}
                />

                <SectionTextArea
                  label={ct("FIELDS.stepDescription")}
                  value={step.description || ""}
                  rows={2}
                  onChange={(e) =>
                    onChange((prev) => {
                      const arr = [...(prev.steps || [])];
                      arr[idx] = { ...arr[idx], description: e.target.value };
                      return { ...prev, steps: arr };
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4. How To Get Service (Dual Option Cards)
    case "dual_action_cta_cards": {
      const clientOpt = content.client_option || {};
      const lawyerOpt = content.lawyer_option || {};
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.sectionTitleMain")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <BaseTextInput
            label={ct("FIELDS.subtitle")}
            value={content.subtitle || ""}
            onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
          />

          {/* Client Option Card Form */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase">
              {ct("TITLES.clientActionCard")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BaseTextInput
                label={ct("FIELDS.cardTitle")}
                value={clientOpt.title || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), title: e.target.value },
                  }))
                }
              />
              <BaseTextInput
                label={ct("FIELDS.waitingLawyersNote")}
                value={clientOpt.note_text || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), note_text: e.target.value },
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <IconPicker
                label={ct("FIELDS.clientActionIcon")}
                value={clientOpt.icon || "Users"}
                onChange={(iconVal) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), icon: iconVal },
                  }))
                }
                currentLang={lang}
              />
              <ImageInput
                label={ct("FIELDS.clientCardImage")}
                value={clientOpt.image || ""}
                onChange={(imgVal) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), image: imgVal },
                  }))
                }
                currentLang={lang}
              />
            </div>

            <SectionTextArea
              label={ct("FIELDS.description")}
              value={clientOpt.description || ""}
              rows={2}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  client_option: { ...(prev.client_option || {}), description: e.target.value },
                }))
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BaseTextInput
                label={ct("FIELDS.ctaButtonText")}
                value={clientOpt.cta_text || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), cta_text: e.target.value },
                  }))
                }
              />
              <BaseTextInput
                label={ct("FIELDS.ctaButtonLink")}
                value={clientOpt.cta_link || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    client_option: { ...(prev.client_option || {}), cta_link: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          {/* Lawyer Option Card Form */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase">
              {ct("TITLES.lawyerActionCard")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BaseTextInput
                label={ct("FIELDS.cardTitle")}
                value={lawyerOpt.title || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), title: e.target.value },
                  }))
                }
              />
              <BaseTextInput
                label={ct("FIELDS.opportunitiesNote")}
                value={lawyerOpt.note_text || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), note_text: e.target.value },
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <IconPicker
                label={ct("FIELDS.lawyerActionIcon")}
                value={lawyerOpt.icon || "Briefcase"}
                onChange={(iconVal) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), icon: iconVal },
                  }))
                }
                currentLang={lang}
              />
              <ImageInput
                label={ct("FIELDS.lawyerCardImage")}
                value={lawyerOpt.image || ""}
                onChange={(imgVal) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), image: imgVal },
                  }))
                }
                currentLang={lang}
              />
            </div>

            <SectionTextArea
              label={ct("FIELDS.description")}
              value={lawyerOpt.description || ""}
              rows={2}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  lawyer_option: { ...(prev.lawyer_option || {}), description: e.target.value },
                }))
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BaseTextInput
                label={ct("FIELDS.ctaButtonText")}
                value={lawyerOpt.cta_text || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), cta_text: e.target.value },
                  }))
                }
              />
              <BaseTextInput
                label={ct("FIELDS.ctaButtonLink")}
                value={lawyerOpt.cta_link || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    lawyer_option: { ...(prev.lawyer_option || {}), cta_link: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </div>
      );
    }

    // 5. About Our Story / Title Desc Image Features
    case "title_desc_image_features": {
      const features = content.features || [];
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.mainTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <SectionTextArea
            label={ct("FIELDS.narrativeStoryDesc")}
            value={content.description || ""}
            rows={4}
            className="leading-relaxed"
            onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageInput
              label={ct("FIELDS.storyPortraitImage")}
              value={content.image || ""}
              onChange={(val) => onChange((prev) => ({ ...prev, image: val }))}
              currentLang={lang}
              presetImages={[
                "/images/about.webp",
                "/images/slider1.webp",
                "/images/slider5.webp",
              ]}
            />
            <BaseTextInput
              label={ct("FIELDS.statsBadgeLabel")}
              value={content.stats_label || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, stats_label: e.target.value }))}
            />
          </div>

          {/* Features Repeater */}
          {features.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
              <RepeaterHeader
                label={ct("TITLES.featuresList")}
                count={features.length}
                addLabel={`+ ${ct("BUTTONS.addFeature")}`}
                onAdd={() =>
                  onChange((prev) => ({
                    ...prev,
                    features: [
                      ...(prev.features || []),
                      {
                        title: contentT("TITLES.newFeature"),
                        description: "",
                        icon: "ShieldCheck",
                      },
                    ],
                  }))
                }
              />

              {features.map((feat: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          features: (prev.features || []).filter((_: any, i: number) => i !== idx),
                        }))
                      }
                      className="text-muted-foreground hover:text-rose-500 text-xs"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <BaseTextInput
                      label={ct("FIELDS.featureTitle")}
                      value={feat.title || ""}
                      onChange={(e) =>
                        onChange((prev) => {
                          const arr = [...(prev.features || [])];
                          arr[idx] = { ...arr[idx], title: e.target.value };
                          return { ...prev, features: arr };
                        })
                      }
                    />
                    <IconPicker
                      label={ct("FIELDS.featureIcon")}
                      value={feat.icon || "ShieldCheck"}
                      onChange={(iconVal) =>
                        onChange((prev) => {
                          const arr = [...(prev.features || [])];
                          arr[idx] = { ...arr[idx], icon: iconVal };
                          return { ...prev, features: arr };
                        })
                      }
                      currentLang={lang}
                    />
                  </div>

                  <SectionTextArea
                    label={ct("FIELDS.featureDescription")}
                    value={feat.description || ""}
                    rows={2}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.features || [])];
                        arr[idx] = { ...arr[idx], description: e.target.value };
                        return { ...prev, features: arr };
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Title + Desc + Image Only
    case "title_desc_image_only": {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.titleOnlyMainTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <SectionTextArea
            label={ct("FIELDS.bodyContent")}
            value={content.description || ""}
            rows={4}
            className="leading-relaxed"
            onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
          />

          <ImageInput
            label={ct("FIELDS.featuredImage")}
            value={content.image || ""}
            onChange={(imgVal) => onChange((prev) => ({ ...prev, image: imgVal }))}
            currentLang={lang}
            presetImages={[
              "/images/slider1.webp",
              "/images/slider5.webp",
              "/images/slider6.webp",
              "/images/about.webp",
            ]}
          />
        </div>
      );
    }

    // 6. About Values
    case "values_pillars_cards": {
      const values = content.values || [];
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.sectionTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <BaseTextInput
            label={ct("FIELDS.subtitleExplanation")}
            value={content.subtitle || ""}
            onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
          />

          {/* Values Repeater */}
          <div className="space-y-3 pt-3 border-t border-border">
            <RepeaterHeader
              label={ct("TITLES.coreValuesList")}
              count={values.length}
              addLabel={`+ ${ct("BUTTONS.addValue")}`}
              onAdd={() =>
                onChange((prev) => ({
                  ...prev,
                  values: [
                    ...(prev.values || []),
                    {
                      id: `val-${Date.now()}`,
                      title: contentT("TITLES.newValue"),
                      description: "",
                      icon: "ShieldCheckIcon",
                    },
                  ],
                }))
              }
            />

            {values.map((val: any, idx: number) => (
              <div
                key={val.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {ct("TITLES.valueNumber", { count: idx + 1 })}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        values: (prev.values || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="text-muted-foreground hover:text-rose-500 text-xs"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <BaseTextInput
                    label={ct("FIELDS.valueName")}
                    value={val.title || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.values || [])];
                        arr[idx] = { ...arr[idx], title: e.target.value };
                        return { ...prev, values: arr };
                      })
                    }
                  />
                  <IconPicker
                    label={ct("FIELDS.valueIcon")}
                    value={val.icon || "ShieldCheck"}
                    onChange={(iconVal) =>
                      onChange((prev) => {
                        const arr = [...(prev.values || [])];
                        arr[idx] = { ...arr[idx], icon: iconVal };
                        return { ...prev, values: arr };
                      })
                    }
                    currentLang={lang}
                  />
                </div>

                <SectionTextArea
                  label={ct("FIELDS.valueDescription")}
                  value={val.description || ""}
                  rows={2}
                  onChange={(e) =>
                    onChange((prev) => {
                      const arr = [...(prev.values || [])];
                      arr[idx] = { ...arr[idx], description: e.target.value };
                      return { ...prev, values: arr };
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 7. About Vision
    case "statement_pillars_cards": {
      const pillars = content.pillars || [];
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.sectionBadge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.headingVisionMission")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <SectionTextArea
            label={ct("FIELDS.mainStatement")}
            value={content.statement || ""}
            rows={3}
            onChange={(e) => onChange((prev) => ({ ...prev, statement: e.target.value }))}
          />

          <BaseTextInput
            label={ct("FIELDS.footerQuote")}
            value={content.footer_quote || ""}
            onChange={(e) => onChange((prev) => ({ ...prev, footer_quote: e.target.value }))}
          />

          {/* Pillars Repeater */}
          <div className="space-y-3 pt-3 border-t border-border">
            <RepeaterHeader
              label={ct("TITLES.pillarCards")}
              count={pillars.length}
              addLabel={`+ ${ct("BUTTONS.addPillar")}`}
              onAdd={() =>
                onChange((prev) => ({
                  ...prev,
                  pillars: [
                    ...(prev.pillars || []),
                    {
                      id: `pil-${Date.now()}`,
                      title: contentT("TITLES.newPillar"),
                      description: "",
                      tag: "",
                      icon: "Sparkles",
                    },
                  ],
                }))
              }
            />

            {pillars.map((pil: any, idx: number) => (
              <div
                key={pil.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {ct("TITLES.pillarNumber", { count: idx + 1 })}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        pillars: (prev.pillars || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="text-muted-foreground hover:text-rose-500 text-xs"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <BaseTextInput
                    label={ct("FIELDS.pillarTitle")}
                    value={pil.title || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.pillars || [])];
                        arr[idx] = { ...arr[idx], title: e.target.value };
                        return { ...prev, pillars: arr };
                      })
                    }
                  />
                  <BaseTextInput
                    label={ct("FIELDS.bottomTag")}
                    value={pil.tag || ""}
                    onChange={(e) =>
                      onChange((prev) => {
                        const arr = [...(prev.pillars || [])];
                        arr[idx] = { ...arr[idx], tag: e.target.value };
                        return { ...prev, pillars: arr };
                      })
                    }
                  />
                  <IconPicker
                    label={ct("FIELDS.pillarIcon")}
                    value={pil.icon || "Sparkles"}
                    onChange={(iconVal) =>
                      onChange((prev) => {
                        const arr = [...(prev.pillars || [])];
                        arr[idx] = { ...arr[idx], icon: iconVal };
                        return { ...prev, pillars: arr };
                      })
                    }
                    currentLang={lang}
                  />
                </div>

                <SectionTextArea
                  label={ct("FIELDS.pillarDescription")}
                  value={pil.description || ""}
                  rows={2}
                  onChange={(e) =>
                    onChange((prev) => {
                      const arr = [...(prev.pillars || [])];
                      arr[idx] = { ...arr[idx], description: e.target.value };
                      return { ...prev, pillars: arr };
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 9. Legal Clauses
    case "numbered_legal_clauses": {
      const clauses = content.sections || [];
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.badge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.pageMainTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.introHeading")}
              value={content.intro_title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, intro_title: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.introContent")}
              value={content.intro_content || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, intro_content: e.target.value }))}
            />
          </div>

          {/* Legal Sections List Repeater */}
          <div className="space-y-4 pt-3 border-t border-border">
            <RepeaterHeader
              label={ct("TITLES.legalClauses")}
              count={clauses.length}
              addLabel={`+ ${ct("BUTTONS.addClause")}`}
              onAdd={() =>
                onChange((prev) => ({
                  ...prev,
                  sections: [
                    ...(prev.sections || []),
                    {
                      id: `sec-${Date.now()}`,
                      title: contentT("TITLES.newClause"),
                      lead: "",
                      content: "",
                      points: [],
                    },
                  ],
                }))
              }
            />

            {clauses.map((clause: any, idx: number) => (
              <div
                key={clause.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {ct("TITLES.clauseNumber", { count: idx + 1 })}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        sections: (prev.sections || []).filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="text-muted-foreground hover:text-rose-500 text-xs"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <BaseTextInput
                  label={ct("FIELDS.clauseTitle")}
                  value={clause.title || ""}
                  onChange={(e) =>
                    onChange((prev) => {
                      const arr = [...(prev.sections || [])];
                      arr[idx] = { ...arr[idx], title: e.target.value };
                      return { ...prev, sections: arr };
                    })
                  }
                />

                <BaseTextInput
                  label={ct("FIELDS.clauseLead")}
                  value={clause.lead || ""}
                  onChange={(e) =>
                    onChange((prev) => {
                      const arr = [...(prev.sections || [])];
                      arr[idx] = { ...arr[idx], lead: e.target.value };
                      return { ...prev, sections: arr };
                    })
                  }
                />

                <SectionTextArea
                  label={ct("FIELDS.clauseBody")}
                  value={clause.content || ""}
                  rows={3}
                  onChange={(e) =>
                    onChange((prev) => {
                      const arr = [...(prev.sections || [])];
                      arr[idx] = { ...arr[idx], content: e.target.value };
                      return { ...prev, sections: arr };
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 10. Contact Page & Channels (Header, Banner & Dynamic Backend Integration)
    case "contact_channels_info": {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.badge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.pageMainTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <SectionTextArea
            label={ct("FIELDS.descriptionSubtitle")}
            value={content.description || ""}
            rows={2}
            onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
          />

          <GlobalSliderNotice lang={currentUiLang} />

          <DynamicDataCard variant="contact" translate={ct} />

          {/* Complaint Form Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
            <BaseTextInput
              label={ct("FIELDS.complaintSectionTitle")}
              value={content.complaint_title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, complaint_title: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.complaintSectionSubtitle")}
              value={content.complaint_subtitle || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, complaint_subtitle: e.target.value }))}
            />
          </div>
        </div>
      );
    }

    // 11. FAQ Accordion & Questions (Header, Banner & Dynamic Backend Questions)
    case "faq_accordion_categorized": {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.badge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.faqSectionTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <SectionTextArea
            label={ct("FIELDS.faqSubtitleDesc")}
            value={content.description || ""}
            rows={2}
            onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.searchInputPlaceholder")}
              value={content.search_placeholder || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, search_placeholder: e.target.value }))}
            />
          </div>

          <GlobalSliderNotice lang={currentUiLang} />

          <DynamicDataCard variant="faq" translate={ct} />
        </div>
      );
    }

    // 12. Blog Page Header & Dynamic Articles Integration
    case "blog_page_header": {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.badge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.blogPageTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <SectionTextArea
            label={ct("FIELDS.blogDescription")}
            value={content.description || ""}
            rows={2}
            onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.articlesSectionHeading")}
              value={content.articles_heading || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, articles_heading: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.subscribersBadge")}
              value={content.subscribers_badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, subscribers_badge: e.target.value }))}
            />
          </div>

          <GlobalSliderNotice lang={currentUiLang} />

          <DynamicDataCard variant="blog" translate={ct} />
        </div>
      );
    }

    // 13. General Page Hero Banner Header
    case "page_header_banner": {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseTextInput
              label={ct("FIELDS.badge")}
              value={content.badge || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, badge: e.target.value }))}
            />
            <BaseTextInput
              label={ct("FIELDS.pageHeroTitle")}
              value={content.title || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <SectionTextArea
            label={ct("FIELDS.heroDescriptionSubtitle")}
            value={content.description || ""}
            rows={2}
            onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
          />

          <GlobalSliderNotice lang={currentUiLang} />
        </div>
      );
    }

    default:
      return (
        <div className="text-xs text-muted-foreground p-4 text-center">
          {t("LABELS.noFieldBlocks")}
        </div>
      );
  }
}