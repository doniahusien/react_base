import { useState, useRef } from "react";
import {
  ScaleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BookOpenIcon,
  SparklesIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  BriefcaseIcon,
  ClockIcon,
  LockClosedIcon,
  FlagIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  GlobeAltIcon,
  BanknotesIcon,
  LightBulbIcon,
  BuildingOffice2Icon,
  TrophyIcon,
  HandRaisedIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { uploadImage } from "../../services/uploadService";
import { toast } from "../../stores/toast";
import { useTranslation } from "react-i18next";
import { mediaUrl } from "../../lib/mediaUrl";

export interface IconOption {
  key: string;
  name_ar: string;
  name_en: string;
  component: React.ComponentType<{ className?: string }>;
  category: "legal" | "security" | "communication" | "general";
}

export const AVAILABLE_ICONS: IconOption[] = [
  { key: "Scale", name_ar: "ميزان العدالة", name_en: "Legal Scale", component: ScaleIcon, category: "legal" },
  { key: "Gavel", name_ar: "مطرقة القضاء", name_en: "Gavel", component: ScaleIcon, category: "legal" },
  { key: "ShieldCheck", name_ar: "درع الأمان والموثوقية", name_en: "Shield Check", component: ShieldCheckIcon, category: "security" },
  { key: "Lock", name_ar: "قفل وسرية تامة", name_en: "Lock / Confidential", component: LockClosedIcon, category: "security" },
  { key: "FileText", name_ar: "مستند وعقد قانوني", name_en: "Document / Contract", component: DocumentTextIcon, category: "legal" },
  { key: "PenLine", name_ar: "تقديم وصياغة طلب", name_en: "Submit / Pen", component: PencilSquareIcon, category: "general" },
  { key: "Users", name_ar: "مجموعة محامين وعملاء", name_en: "Users / Lawyers", component: UserGroupIcon, category: "general" },
  { key: "BookOpen", name_ar: "كتاب ولوائح نظامية", name_en: "Open Book / Law", component: BookOpenIcon, category: "legal" },
  { key: "Award", name_ar: "شارة اعتماد وترخيص", name_en: "Award / License", component: CheckBadgeIcon, category: "security" },
  { key: "Sparkles", name_ar: "تميز وابتكار رقمي", name_en: "Sparkles / Innovation", component: SparklesIcon, category: "general" },
  { key: "Briefcase", name_ar: "حقيبة أعمال وقضايا", name_en: "Briefcase / Cases", component: BriefcaseIcon, category: "general" },
  { key: "Clock", name_ar: "سرعة وإنجاز فوري", name_en: "Clock / Fast Delivery", component: ClockIcon, category: "general" },
  { key: "Flag", name_ar: "راية ورسالة واضحة", name_en: "Flag / Mission", component: FlagIcon, category: "general" },
  { key: "Heart", name_ar: "رعاية واهتمام بالعميل", name_en: "Heart / Care", component: HeartIcon, category: "general" },
  { key: "Phone", name_ar: "هاتف وتواصل مباشر", name_en: "Phone Call", component: PhoneIcon, category: "communication" },
  { key: "Mail", name_ar: "بريد إلكتروني رسمي", name_en: "Email Message", component: EnvelopeIcon, category: "communication" },
  { key: "MapPin", name_ar: "مقر جغرافي وعنوان", name_en: "Map Location", component: MapPinIcon, category: "communication" },
  { key: "MessageSquare", name_ar: "محادثات واستشارات", name_en: "Live Chat / Consult", component: ChatBubbleLeftRightIcon, category: "communication" },
  { key: "HelpCircle", name_ar: "سؤال ومساعدة", name_en: "FAQ / Question", component: QuestionMarkCircleIcon, category: "general" },
  { key: "Globe", name_ar: "منصة رقمية وشبكة", name_en: "Digital Web / Globe", component: GlobeAltIcon, category: "general" },
  { key: "Banknotes", name_ar: "دفع آمن وحساب وسيط", name_en: "Escrow / Payments", component: BanknotesIcon, category: "security" },
  { key: "LightBulb", name_ar: "فكرة وحلول ذكية", name_en: "Smart Solutions", component: LightBulbIcon, category: "general" },
  { key: "Building", name_ar: "شركة ومكتب محاماة", name_en: "Law Firm Building", component: BuildingOffice2Icon, category: "legal" },
  { key: "Trophy", name_ar: "ريادة وصدارة", name_en: "Trophy / Leader", component: TrophyIcon, category: "general" },
  { key: "HandRaised", name_ar: "نزاهة والتزام مهني", name_en: "Integrity Hand", component: HandRaisedIcon, category: "security" },
];

export function isImageIcon(val?: string): boolean {
  if (!val) return false;
  const lower = val.toLowerCase();
  return (
    lower.startsWith("data:image/") ||
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("/images/") ||
    lower.startsWith("/icons/") ||
    lower.includes(".png") ||
    lower.includes(".svg") ||
    lower.includes(".webp") ||
    lower.includes(".jpg") ||
    lower.includes(".jpeg")
  );
}

export function getIconComponent(iconKey?: string): React.ComponentType<{ className?: string }> {
  if (!iconKey || isImageIcon(iconKey)) return SparklesIcon;
  const match = AVAILABLE_ICONS.find(
    (i) => i.key.toLowerCase() === iconKey.toLowerCase()
  );
  return match ? match.component : SparklesIcon;
}

interface IconPickerProps {
  value?: string;
  onChange: (iconValue: string) => void;
  label?: string;
  currentLang?: "ar" | "en";
  /** When true, only platform icon keys can be selected (no image upload). */
  iconsOnly?: boolean;
}

export function IconPicker({
  value = "Sparkles",
  onChange,
  label,
  currentLang = "ar",
  iconsOnly = false,
}: IconPickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [activeDrag, setActiveDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImg = !iconsOnly && isImageIcon(value);
  const iconSrc = isImg ? mediaUrl(value) ?? value : value;
  const CurrentIcon = getIconComponent(iconsOnly && isImageIcon(value) ? "Sparkles" : value);
  const currentObj = AVAILABLE_ICONS.find(
    (i) => i.key.toLowerCase() === (iconsOnly && isImageIcon(value) ? "sparkles" : value).toLowerCase()
  );

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      const path = await uploadImage(file);
      onChange(path);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(
        t("MESSAGES.uploadFailed"),
        err?.response?.data?.message || err?.message
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.name.endsWith(".svg"))) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-bold text-foreground">{label}</label>
      )}

      {/* Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 rounded-xl border border-border bg-background p-2 px-3 text-xs font-semibold hover:border-primary hover:bg-muted/30 transition-all flex-1 text-start group"
        >
          {/* Icon or Image Preview */}
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 overflow-hidden border border-primary/20">
            {isImg ? (
              <img
                src={iconSrc}
                alt="Icon"
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100";
                }}
              />
            ) : (
              <CurrentIcon className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground truncate">
              {isImg
                ? currentLang === "ar"
                  ? "صورة أيقونة مخصصة (Custom Image)"
                  : "Custom Icon Image"
                : currentObj
                ? currentLang === "ar"
                  ? currentObj.name_ar
                  : currentObj.name_en
                : value}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              {isImg ? "Image / SVG File" : value}
            </p>
          </div>

          <span className="text-[11px] text-primary font-bold shrink-0 group-hover:underline">
            {currentLang === "ar"
              ? iconsOnly
                ? "تغيير"
                : "تغيير / رفع صورة"
              : iconsOnly
              ? "Change"
              : "Change / Upload"}
          </span>
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("Sparkles")}
            title="Reset to default"
            className="p-2 text-muted-foreground hover:text-rose-500 rounded-lg"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold">
                  {currentLang === "ar"
                    ? iconsOnly
                      ? "اختيار أيقونة"
                      : "اختيار أو رفع أيقونة (Icon / Image)"
                    : iconsOnly
                    ? "Select Icon"
                    : "Select or Upload Icon Image"}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            {!iconsOnly && (
              <div className="flex items-center p-1 bg-muted/40 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("library")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === "library"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <SparklesIcon className="h-4 w-4 text-primary" />
                  <span>{currentLang === "ar" ? "أيقونات المنصة (SVG Icons)" : "Platform Icons"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === "upload"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CloudArrowUpIcon className="h-4 w-4 text-primary" />
                  <span>{currentLang === "ar" ? "رفع صورة أيقونة (Upload Image)" : "Upload Icon Image"}</span>
                </button>
              </div>
            )}

            {/* Platform Icons Library */}
            {(iconsOnly || activeTab === "library") && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 p-1 min-h-[220px]">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.component;
                    const isSelected =
                      !isImg && value.toLowerCase() === item.key.toLowerCase();
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          onChange(item.key);
                          setIsOpen(false);
                        }}
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-start transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                            : "border-border bg-background hover:border-primary/50 hover:bg-muted/30 text-foreground"
                        }`}
                      >
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">
                            {currentLang === "ar" ? item.name_ar : item.name_en}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {item.key}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload Custom Icon Image */}
            {!iconsOnly && activeTab === "upload" && (
              <div className="space-y-4 flex-1 overflow-y-auto p-1">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={(e) => {
                    handleFileUpload(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />

                {/* Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setActiveDrag(true);
                  }}
                  onDragLeave={() => setActiveDrag(false)}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 transition-all duration-200 ${
                    uploading
                      ? "pointer-events-none opacity-60"
                      : activeDrag
                      ? "border-primary bg-primary/10"
                      : "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ArrowUpTrayIcon className="h-6 w-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-foreground">
                      {uploading
                        ? currentLang === "ar"
                          ? "جاري رفع الأيقونة..."
                          : "Uploading icon..."
                        : currentLang === "ar"
                        ? "انقر لرفع ملف أيقونة أو اسحبها هنا"
                        : "Click to upload icon file or drag & drop"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      SVG, PNG, WEBP, JPG
                    </p>
                  </div>
                </div>

                {/* Current Image Preview & URL input */}
                {isImg && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                    <div className="size-12 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={iconSrc}
                        alt="Current Custom Icon"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground">
                        {currentLang === "ar" ? "الأيقونة المرفوعة الحالية" : "Current Uploaded Icon"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate font-mono">
                        {value.startsWith("data:") ? "Embedded Data Image" : value}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onChange("Sparkles")}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      {currentLang === "ar" ? "إزالة" : "Remove"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-1.5 text-xs font-semibold bg-muted text-foreground hover:bg-muted/80"
              >
                {currentLang === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
