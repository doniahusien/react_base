import type { Page, PageSection } from "../types";
import {
  getBlockDefaultContent,
  normalizeBlockType,
} from "./blockTemplatesMock";

// Re-exported so callers have one import path for block defaults.
export { getBlockDefaultContent, normalizeBlockType };

// ============================================================================
// Seeded pages. Every section uses a canonical block id from
// INITIAL_BLOCK_TEMPLATES — there is no separate page-specific block registry.
//
// Sections render in array order. There is no sort_order.
// ============================================================================

function section(
  id: string,
  pageId: number,
  type: string,
  content?: { ar: any; en: any }
): PageSection {
  return {
    id,
    page_id: pageId,
    type,
    is_active: true,
    content: content ?? getBlockDefaultContent(type),
  };
}

/** Vision and Mission are the same shape; only their content differs. */
const MISSION_CONTENT = {
  ar: {
    badge: "رسالتنا",
    title: "ربط العملاء بالخبرات القانونية بأعلى موثوقية",
    statement:
      "توفير بيئة رقمية آمنة ومرنة تتيح لأصحاب القضايا الوصول لأفضل الكفاءات القانونية وتتيح للمحامين تقديم خدماتهم باحترافية وتنافسية.",
    footer_quote: "",
    pillars: [
      { id: "mis-1", title: "التواصل الفعال", description: "تسهيل قنوات الحوار والمتابعة المستمرة بين الموكل ومحاميه في أي وقت.", tag: "تواصل دائم", icon: "Users" },
      { id: "mis-2", title: "الشفافية الكاملة", description: "وضوح تام في تفاصيل العروض والأسعار والتقييمات المعتمدة بدون رسوم خفية.", tag: "وضوح تام", icon: "Eye" },
      { id: "mis-3", title: "ضمان الجودة", description: "متابعة مستمرة لآليات التنفيذ وجودة الخدمات والالتزام بالمواعيد المحددة.", tag: "أعلى المعايير", icon: "CheckCircle" },
    ],
  },
  en: {
    badge: "Our Mission",
    title: "Connecting Clients with Verified Legal Expertise",
    statement:
      "Delivering a reliable, intuitive platform empowering clients to find top counsel while offering lawyers a competitive digital practice.",
    footer_quote: "",
    pillars: [
      { id: "mis-1", title: "Active Communication", description: "Seamless real-time channels keeping clients updated on case developments.", tag: "Always Connected", icon: "Users" },
      { id: "mis-2", title: "Total Transparency", description: "Transparent fee quotes and verified client reviews with zero hidden surcharges.", tag: "Zero Surprises", icon: "Eye" },
      { id: "mis-3", title: "Quality Assurance", description: "Strict performance monitoring ensuring timely milestone delivery.", tag: "Highest Standards", icon: "CheckCircle" },
    ],
  },
};

const PRIVACY_CONTENT = {
  ar: {
    badge: "الخصوصية",
    title: "سياسة الخصوصية وسرية المعلومات القانونية",
    intro_title: "حماية بيانات الموكلين والمحامين",
    intro_content:
      "تولي منصة الوسيط أهمية قصوى لسرية وخصوصية البيانات القانونية وفق الأنظمة واللوائح المعتمدة في المملكة العربية السعودية.",
    sections: [
      { id: "priv-1", title: "1. جمع البيانات واستخدامها", lead: "", content: "يتم جمع بيانات الاتصال والهوية الوطنية والوثائق لغرض التحقق وإسناد الطلبات القانونية للمحامين المعتمدين فقط." },
      { id: "priv-2", title: "2. التشفير والحماية التقنية", lead: "", content: "تُشفر كافة الوثائق والمراسلات بين الموكل والمحامي بأحدث بروتوكولات الأمان SSL/TLS مع عزل قواعد البيانات." },
    ],
  },
  en: {
    badge: "Privacy",
    title: "Privacy Policy & Legal Confidentiality",
    intro_title: "Protection of Client & Attorney Information",
    intro_content:
      "Elwaseet upholds stringent data confidentiality standards complying with Saudi legal cybersecurity regulations.",
    sections: [
      { id: "priv-1", title: "1. Data Collection & Purpose", lead: "", content: "Identity credentials and case documents are solely gathered to verify participants and facilitate legal representation." },
      { id: "priv-2", title: "2. Encryption & Security", lead: "", content: "All client-attorney dossiers are secured using enterprise SSL/TLS encryption with segregated access controls." },
    ],
  },
};

export const INITIAL_MOCK_PAGES: Page[] = [
  {
    id: 1,
    slug: "home",
    title: { ar: "الصفحة الرئيسية", en: "Home Page" },
    type: "system",
    is_published: true,
    seo: {
      meta_title: {
        ar: "منصة مجتمع المحاماة للوساطة القانونية",
        en: "Elwaseet - Digital Legal Brokerage Platform",
      },
      meta_description: {
        ar: "منصة رقمية موثوقة تربطك بأفضل المحامين ومقدمي الخدمات القانونية في المملكة العربية السعودية.",
        en: "Trusted digital platform connecting clients with certified lawyers across Saudi Arabia.",
      },
      og_image: "/images/slider1.webp",
      keywords: "محاماة, وساطة قانونية, محامي بالرياض, استشارة قانونية, عقود",
    },
    sections: [
      section("sec-101", 1, "hero_header"),
      section("sec-102", 1, "cards_grid_with_icons_images"),
      section("sec-103", 1, "steps_workflow_cards"),
      section("sec-104", 1, "dual_action_cta_cards"),
    ],
  },
  {
    id: 2,
    slug: "about",
    title: { ar: "من نحن (تعرف علينا)", en: "About Us" },
    type: "system",
    is_published: true,
    seo: {
      meta_title: { ar: "من نحن - منصة الوسيط للوساطة القانونية", en: "About Us - Elwaseet Legal Brokerage" },
      meta_description: {
        ar: "تعرف على قصة تأسيس منصة الوسيط ورؤيتنا وقيمنا في التحول الرقمي للخدمات القانونية.",
        en: "Discover our mission, vision, values and commitment to legal excellence in Saudi Arabia.",
      },
      og_image: "/images/our_story.webp",
      keywords: "من نحن, رؤيتنا, رسالتنا, قيمنا, الوسيط للمحاماة",
    },
    sections: [
      section("sec-200", 2, "page_header_banner"),
      section("sec-201", 2, "title_desc_image_features"),
      section("sec-202", 2, "values_pillars_cards"),
      section("sec-203", 2, "statement_pillars_cards"),
      section("sec-204", 2, "statement_pillars_cards", MISSION_CONTENT),
      // Terms & Conditions has no page of its own; it is edited here and rendered
      // inside the public About page response.
      section("sec-205", 2, "numbered_legal_clauses"),
    ],
  },
  {
    id: 3,
    slug: "contact",
    title: { ar: "تواصل معنا", en: "Contact Us" },
    type: "system",
    is_published: true,
    seo: {
      meta_title: { ar: "تواصل معنا - خدمة عملاء منصة الوسيط", en: "Contact Us - Elwaseet Customer Care" },
      meta_description: {
        ar: "تواصل مع فريق الدعم والوساطة القانونية للاستفسارات والشكاوى والاقتراحات.",
        en: "Get in touch with our legal support desk for inquiries and dispute resolution.",
      },
      og_image: "/images/slider1.webp",
      keywords: "اتصل بنا, دعم العملاء, شكاوى, هاتف الوسيط",
    },
    sections: [section("sec-301", 3, "contact_channels_info")],
  },
  {
    id: 4,
    slug: "faq",
    title: { ar: "الأسئلة الشائعة", en: "FAQ" },
    type: "system",
    is_published: true,
    seo: {
      meta_title: { ar: "الأسئلة الشائعة - منصة الوسيط", en: "FAQ - Elwaseet Platform" },
      meta_description: {
        ar: "إجابات مفصلة لكافة الاستفسارات المتكررة حول التقديم، عروض المحامين، وضمان الأتعاب.",
        en: "Detailed answers to client and attorney inquiries regarding cases and payments.",
      },
    },
    sections: [section("sec-401", 4, "faq_accordion_categorized")],
  },
  {
    id: 5,
    slug: "privacy",
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    type: "policy",
    is_published: true,
    seo: {
      meta_title: { ar: "سياسة الخصوصية وسرية المعلومات", en: "Privacy Policy & Confidentiality" },
      meta_description: { ar: "سياسة حماية وسرية بيانات العملاء والقضايا", en: "User data confidentiality guidelines" },
    },
    sections: [section("sec-501", 5, "numbered_legal_clauses", PRIVACY_CONTENT)],
  },
].map((p) => ({ ...p, sections_count: p.sections.length })) as Page[];

const STORAGE_KEY = "elwaseet_page_builder_pages_v11";

/** Rewrites any legacy block id stored before the block merge. */
function migrateBlockTypes(pages: Page[]): Page[] {
  return pages.map((page) => ({
    ...page,
    sections: page.sections?.map((s) => ({ ...s, type: normalizeBlockType(s.type) })),
  }));
}

function loadFromStorage(): Page[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return migrateBlockTypes(parsed);
      }
    }
  } catch (e) {
    console.warn("Could not parse page builder localStorage data", e);
  }
  saveToStorage(INITIAL_MOCK_PAGES);
  return INITIAL_MOCK_PAGES;
}

function saveToStorage(pages: Page[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

// ==========================================
// Mock Service Methods
// ==========================================

export const pageBuilderMockService = {
  getPages: async (): Promise<Page[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pages = loadFromStorage();
        resolve(pages.map((p) => ({ ...p, sections_count: p.sections?.length ?? 0 })));
      }, 150);
    });
  },

  getPageById: async (id: number): Promise<Page | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pages = loadFromStorage();
        const found = pages.find((p) => p.id === Number(id));
        resolve(found ? JSON.parse(JSON.stringify(found)) : null);
      }, 150);
    });
  },

  getPageBySlug: async (slug: string): Promise<Page | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pages = loadFromStorage();
        const found = pages.find((p) => p.slug === slug);
        resolve(found ? JSON.parse(JSON.stringify(found)) : null);
      }, 150);
    });
  },

  savePage: async (pageData: Partial<Page> & { id?: number }): Promise<Page> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pages = loadFromStorage();
        let target: Page;

        if (pageData.id) {
          const index = pages.findIndex((p) => p.id === pageData.id);
          if (index !== -1) {
            target = {
              ...pages[index],
              ...pageData,
              updated_at: new Date().toISOString(),
            } as Page;
            pages[index] = target;
          } else {
            target = {
              ...pageData,
              id: pageData.id,
              sections: pageData.sections || [],
              created_at: new Date().toISOString(),
            } as Page;
            pages.push(target);
          }
        } else {
          const maxId = pages.reduce((max, p) => Math.max(max, p.id), 0);
          target = {
            id: maxId + 1,
            slug: pageData.slug || `page-${maxId + 1}`,
            title: pageData.title || { ar: "صفحة جديدة", en: "New Page" },
            type: pageData.type || "custom",
            is_published: pageData.is_published ?? true,
            seo: pageData.seo || {},
            sections: pageData.sections || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          pages.push(target);
        }

        saveToStorage(pages);
        resolve(JSON.parse(JSON.stringify(target)));
      }, 200);
    });
  },

  deletePage: async (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pages = loadFromStorage();
        const filtered = pages.filter((p) => p.id !== Number(id));
        saveToStorage(filtered);
        resolve(true);
      }, 150);
    });
  },

  togglePageStatus: async (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pages = loadFromStorage();
        const target = pages.find((p) => p.id === Number(id));
        if (target) {
          target.is_published = !target.is_published;
          saveToStorage(pages);
          resolve(target.is_published);
        } else {
          resolve(false);
        }
      }, 100);
    });
  },

  savePageSections: async (pageId: number, sections: PageSection[]): Promise<PageSection[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pages = loadFromStorage();
        const target = pages.find((p) => p.id === Number(pageId));
        if (target) {
          target.sections = sections.map((s) => ({
            ...s,
            type: normalizeBlockType(s.type),
          }));
          target.sections_count = target.sections.length;
          target.updated_at = new Date().toISOString();
          saveToStorage(pages);
          resolve(JSON.parse(JSON.stringify(target.sections)));
        } else {
          resolve([]);
        }
      }, 150);
    });
  },

  resetDefaults: (): Page[] => {
    saveToStorage(INITIAL_MOCK_PAGES);
    return INITIAL_MOCK_PAGES;
  },
};
