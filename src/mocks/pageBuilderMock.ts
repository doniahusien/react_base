import type {
  Page,
  PageSection,
  BlockType,
  HomeHeaderContent,
  HomeServicesContent,
  HowToWorkContent,
  HowToGetServiceContent,
  AboutOurStoryContent,
  AboutValuesContent,
  AboutVisionContent,
  AboutMissionContent,
  AboutTermsContent,
  ContactPageContent,
  FAQAccordionContent,
  BlogPageContent,
  PageHeaderBannerContent,
} from "../types";

export const BLOCK_METADATA: Record<
  BlockType,
  {
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    icon: string;
    category: "home" | "about" | "legal" | "support" | "content_media";
  }
> = {
  home_header: {
    name_ar: "بانر الهيدر الرئيسي (Hero Carousel)",
    name_en: "Main Hero Header",
    description_ar: "سلايدر صور وخلفيات، نصوص رئيسية ثلاثية الأسطر، شارة معتمدة، وأزرار توجيه للعملاء والمحامين",
    description_en: "Hero carousel with multi-line heading, badge, description, and client CTA buttons",
    icon: "PresentationChartBarIcon",
    category: "home",
  },
  home_services: {
    name_ar: "خدمات المنصة (ماذا نقدم لك)",
    name_en: "Platform Services Grid",
    description_ar: "شبكة عرض الخدمات القانونية (نشر طلبات، مقارنة عروض، استشارات، باقات مسبقة الدفع)",
    description_en: "Grid of legal services (post request, compare offers, consultation, packages)",
    icon: "BriefcaseIcon",
    category: "home",
  },
  how_to_work: {
    name_ar: "خطوات العمل (كيف تعمل المنصة)",
    name_en: "How It Works (Steps)",
    description_ar: "بطاقات الخطوات المرقمة الأربعة لشرح مسار تقديم الطلب واستقبال العروض حتى التعاقد",
    description_en: "4-step sequential numbered workflow cards showing user journey",
    icon: "QueueListIcon",
    category: "home",
  },
  how_to_get_service: {
    name_ar: "كيفية الحصول على الخدمة",
    name_en: "How To Get Service",
    description_ar: "بطاقتا التوجيه الكبريان: تقديم طلب قانوني للعملاء أو الانضمام كمحامٍ معتمد",
    description_en: "Dual action cards for client legal request submission and lawyer joining",
    icon: "UserPlusIcon",
    category: "home",
  },
  about_our_story: {
    name_ar: "قصتنا ورسالتنا (من نحن)",
    name_en: "Our Story Block",
    description_ar: "قسم تعريفي يحتوي على عنوان رئيسي، وسم، نص النبذة التاريخية وصورة البورتريه الجانبية",
    description_en: "Narrative story section with badge, heading, rich description and portrait image",
    icon: "BookOpenIcon",
    category: "about",
  },
  about_values: {
    name_ar: "قيم ومبادئ المنصة",
    name_en: "Core Values & Principles",
    description_ar: "بطاقات القيم الأربعة الأساسية (النزاهة، الجودة، السرية التامة، الابتكار القانوني)",
    description_en: "4 core values cards (Integrity, Quality, Confidentiality, Innovation)",
    icon: "ShieldCheckIcon",
    category: "about",
  },
  about_vision: {
    name_ar: "رؤية المنصة والركائز",
    name_en: "Vision & Strategic Pillars",
    description_ar: "بيان الرؤية المستقبلية، اقتباس مميز، وركائز التحول الرقمي والتميز المهني",
    description_en: "Vision statement, quoted footer, and strategic digital leadership pillars",
    icon: "SparklesIcon",
    category: "about",
  },
  about_mission: {
    name_ar: "رسالة المنصة والأهداف",
    name_en: "Mission & Objectives",
    description_ar: "بيان الرسالة مع اقتباس وعرض بطاقات ركائز الرسالة (التواصل، الشفافية، الجودة)",
    description_en: "Mission statement with quote and pillar cards with tags",
    icon: "FlagIcon",
    category: "about",
  },
  about_terms: {
    name_ar: "الشروط والتعريفات القانونية",
    name_en: "Terms & Legal Articles",
    description_ar: "نصوص الشروط والأحكام، التعريفات، البنود القانونية والمسؤوليات مرقمة بشكل تفصيلي",
    description_en: "Numbered legal clauses, articles, terms, definitions, and disclaimer points",
    icon: "DocumentTextIcon",
    category: "legal",
  },
  contact_page: {
    name_ar: "بيانات التواصل وقسم الشكاوى",
    name_en: "Contact Information & Channels",
    description_ar: "بطاقات البريد، الهاتف، العنوان الجغرافي، ونموذج إرسال الشكاوى والاقتراحات",
    description_en: "Email, phone, physical address cards and direct complaint submission section",
    icon: "PhoneIcon",
    category: "support",
  },
  faq_accordion: {
    name_ar: "الأسئلة الشائعة التفاعلية",
    name_en: "Interactive FAQ Accordion",
    description_ar: "قائمة الأسئلة الشائعة والأجوبة التفصيلية مقسمة حسب التصنيف مع إمكانية البحث",
    description_en: "Categorized collapsible FAQ list for legal requests, payments, and lawyers",
    icon: "QuestionMarkCircleIcon",
    category: "support",
  },
  blog_page: {
    name_ar: "هيدر المدونة والمقالات القانونية",
    name_en: "Blog Page Header",
    description_ar: "نصوص هيدر صفحة المدونة، حيث يجلب الباك إند المقالات والتصنيفات تلقائياً",
    description_en: "Blog page header texts, with articles and categories injected by the backend",
    icon: "DocumentTextIcon",
    category: "content_media",
  },
  page_header_banner: {
    name_ar: "هيدر وبانر الصفحة الداخلية",
    name_en: "Inner Page Header Banner",
    description_ar: "نصوص هيدر الصفحات الداخلية (وسم، عنوان، وصف) فوق سلايدر الصور العام",
    description_en: "Inner page header texts (badge, title, description) rendered over the global slider",
    icon: "PhotoIcon",
    category: "content_media",
  },
};

export function createDefaultBlockContent(type: BlockType): { ar: any; en: any } {
  switch (type) {
    case "home_header": {
      const ar: HomeHeaderContent = {
        badge: "منصة مرخصة وموثوقة",
        title_line1: "منصتك الموثوقة",
        title_line2: "للوصول إلى",
        title_highlight: "أفضل المحامين",
        description: "منصة رقمية موثوقة تربطك بأفضل المحامين ومقدمي الخدمات القانونية في المملكة العربية السعودية بكل سهولة وموثوقية.",
        cta_text: "تقديم طلب قانوني",
        cta_link: "/auth/sign-up/client/step-1",
        secondary_cta_text: "تصفح المحامين",
        secondary_cta_link: "/auth/sign-up",
      };
      const en: HomeHeaderContent = {
        badge: "Certified & Licensed Platform",
        title_line1: "Your Trusted Platform",
        title_line2: "To Connect With",
        title_highlight: "Top Rated Lawyers",
        description: "A secure digital brokerage connecting clients with certified lawyers across Saudi Arabia with speed and transparency.",
        cta_text: "Submit Legal Request",
        cta_link: "/auth/sign-up/client/step-1",
        secondary_cta_text: "Browse Lawyers",
        secondary_cta_link: "/auth/sign-up",
      };
      return { ar, en };
    }

    case "home_services": {
      const ar: HomeServicesContent = {
        services: [
          {
            id: "serv-1",
            title: "تقديم طلب قانوني",
            description: "قدّم طلبك القانوني واستقبل عروض الأسعار من محامين معتمدين خلال ساعات.",
            icon: "Scale",
            image: "/images/service1.webp",
          },
          {
            id: "serv-2",
            title: "الباقات القانونية",
            description: "تصفح باقات الخدمات القانونية المسعّرة مسبقاً من نخبة المحامين والمكاتب المعتمدة.",
            icon: "FileText",
            image: "/images/service2.webp",
          },
          {
            id: "serv-3",
            title: "محامون معتمدون",
            description: "تضع باقات الخدمات القانونية المسعّرة مسبقاً من نخبة المحامين والمكاتب المعتمدة.",
            icon: "ShieldCheck",
            image: "/images/service3.webp",
          },
          {
            id: "serv-4",
            title: "استشارات متخصصة",
            description: "جلسات استشارية قانونية مع نخبة من المستشارين المرخصين لحماية حقوقك ومصالحك.",
            icon: "Users",
            image: "/images/slider1.webp",
          },
        ],
      };
      const en: HomeServicesContent = {
        services: [
          {
            id: "serv-1",
            title: "Submit Legal Request",
            description: "Post your legal inquiry and receive quotes from certified attorneys within hours.",
            icon: "Scale",
            image: "/images/service1.webp",
          },
          {
            id: "serv-2",
            title: "Fixed Legal Packages",
            description: "Browse predefined advisory and contract drafting packages at transparent rates.",
            icon: "FileText",
            image: "/images/service2.webp",
          },
          {
            id: "serv-3",
            title: "Certified Lawyers",
            description: "Engage directly with vetted and licensed practitioners across all legal specialties.",
            icon: "ShieldCheck",
            image: "/images/service3.webp",
          },
          {
            id: "serv-4",
            title: "Specialized Consultations",
            description: "One-on-one advisory sessions with accredited attorneys to protect your legal interests.",
            icon: "Users",
            image: "/images/slider1.webp",
          },
        ],
      };
      return { ar, en };
    }

    case "how_to_work": {
      const ar: HowToWorkContent = {
        badge: "خطوات العمل",
        title: "كيف تعمل منصة الوسيط للوساطة القانونية",
        description: "رحلة سهلة وسلسة تبدأ بتقديم طلبك وتنتهي بالحصول على أفضل تمثيل واستشارة قانونية.",
        steps: [
          {
            id: "step-1",
            step_number: "01",
            title: "سجل حسابك وحدد نوع طلبك",
            description: "أنشئ حسابك في دقائق وحدد تفاصيل القضية أو الاستشارة القانونية المطلوبة.",
            icon: "UserPlusIcon",
          },
          {
            id: "step-2",
            step_number: "02",
            title: "استقبل عروض أسعار المحامين",
            description: "يتنافس نخبة من المحامين المرخصين بتقديم عروض أسعار وخطط عمل مخصصة.",
            icon: "DocumentTextIcon",
          },
          {
            id: "step-3",
            step_number: "03",
            title: "اختر المحامي المناسب",
            description: "راجع السير الذاتية والتقييمات، واختر العرض المتوافق مع ميزانيتك.",
            icon: "CheckBadgeIcon",
          },
          {
            id: "step-4",
            step_number: "04",
            title: "ابدأ العمل والتواصل الآمن",
            description: "باشر متابعة قضيتك وتواصل مباشرة مع محاميك بكل سرية واحترافية.",
            icon: "ChatBubbleBottomCenterTextIcon",
          },
        ],
      };
      const en: HowToWorkContent = {
        badge: "Workflow",
        title: "How Elwaseet Legal Brokerage Works",
        description: "A seamless 4-step experience from initial inquiry to hiring your dedicated attorney.",
        steps: [
          {
            id: "step-1",
            step_number: "01",
            title: "Create Account & Submit Request",
            description: "Sign up in minutes and describe your legal case or required consultation.",
            icon: "UserPlusIcon",
          },
          {
            id: "step-2",
            step_number: "02",
            title: "Receive Tailored Proposals",
            description: "Licensed lawyers review your request and submit competitive cost proposals.",
            icon: "DocumentTextIcon",
          },
          {
            id: "step-3",
            step_number: "03",
            title: "Select the Best Advocate",
            description: "Compare experience, ratings, and budgets to choose the optimal legal partner.",
            icon: "CheckBadgeIcon",
          },
          {
            id: "step-4",
            step_number: "04",
            title: "Engage in Secure Collaboration",
            description: "Track milestones and communicate in encrypted workspace channels.",
            icon: "ChatBubbleBottomCenterTextIcon",
          },
        ],
      };
      return { ar, en };
    }

    case "how_to_get_service": {
      const ar: HowToGetServiceContent = {
        badge: "ابدأ الآن",
        title: "اختر المسار المناسب لك",
        subtitle: "سواء كنت تبحث عن تمثيل قانوني أو كنت محامياً ترغب في توسيع قاعدة عملائك",
        client_option: {
          title: "تقديم طلب قانوني (للعملاء)",
          description: "اطرح استشارتك أو قضيتك القانونية لتصل إلى مئات المحامين المعتمدين واستقبل عروضهم في وقت قياسي.",
          cta_text: "تقديم طلب الآن",
          cta_link: "/auth/sign-up/client/step-1",
          note_text: "+500 محامٍ معتمد بانتظار خدمتك",
        },
        lawyer_option: {
          title: "الانضمام كمحامٍ أو مكتب محاماة",
          description: "انضم إلى شبكة المحامين الرائدة، واطلع على آلاف الطلبات القانونية يومياً وقدم عروضك مباشرة للعملاء.",
          cta_text: "التسجيل كمحامٍ",
          cta_link: "/auth/sign-up/lawyer/step-1",
          note_text: "فرص عمل وتعاقدات يومية جديدة",
        },
      };
      const en: HowToGetServiceContent = {
        badge: "Get Started",
        title: "Choose Your Path",
        subtitle: "Whether you need professional legal representation or you are a certified lawyer seeking clients",
        client_option: {
          title: "Submit Legal Request (Clients)",
          description: "Post your case to reach hundreds of licensed attorneys and receive competitive proposals rapidly.",
          cta_text: "Post Request Now",
          cta_link: "/auth/sign-up/client/step-1",
          note_text: "500+ Verified lawyers ready to assist",
        },
        lawyer_option: {
          title: "Join as Lawyer or Law Firm",
          description: "Join the leading network, access daily legal requests across the Kingdom and grow your practice.",
          cta_text: "Register as Lawyer",
          cta_link: "/auth/sign-up/lawyer/step-1",
          note_text: "New daily opportunities and retainers",
        },
      };
      return { ar, en };
    }

    case "about_our_story": {
      const ar: AboutOurStoryContent = {
        badge: "قصتنا",
        title: "رواد في الوساطة والتحول الرقمي القانوني",
        description: "انطلقت منصة الوسيط للوساطة القانونية برؤية طموحة تهدف إلى تسهيل وصول الأفراد والشركات إلى نخبة المحامين المرخصين في المملكة العربية السعودية، مع ضمان أعلى معايير الشفافية وسرية المعلومات.",
        image: "/images/our_story.webp",
      };
      const en: AboutOurStoryContent = {
        badge: "Our Story",
        title: "Pioneering Digital Legal Brokerage",
        description: "Elwaseet was established with a bold mission: making quality legal representation accessible and transparent for individuals and enterprises across Saudi Arabia, powered by secure legal-tech.",
        image: "/images/our_story.webp",
      };
      return { ar, en };
    }

    case "about_values": {
      const ar: AboutValuesContent = {
        badge: "قيمنا",
        title: "القيم والمبادئ التي توجه مسيرتنا",
        subtitle: "نلتزم بركائز مهنية وأخلاقية صارمة تضمن حماية حقوق ومصالح جميع أطراف المنظومة القانونية.",
        values: [
          {
            id: "val-1",
            title: "النزاهة والشفافية",
            description: "الالتزام بأعلى معايير الصدق والوضوح في التعاملات وتسعير الخدمات والوساطة.",
            icon: "ShieldCheckIcon",
          },
          {
            id: "val-2",
            title: "الجودة والاحترافية",
            description: "استقطاب المحامين المعتمدين لتقديم مخرجات واستشارات قانونية بأعلى درجات الإتقان.",
            icon: "AwardIcon",
          },
          {
            id: "val-3",
            title: "السرية التامة",
            description: "تشفير وحماية كافة وثائق وبيانات القضايا وفق أعلى المعايير الأمنية المعتمدة.",
            icon: "LockClosedIcon",
          },
          {
            id: "val-4",
            title: "الابتكار الرقمي",
            description: "تطوير حلول تقنية تسهل إجراءات الوساطة وإدارة الطلبات القانونية بذكاء وسرعة.",
            icon: "LightBulbIcon",
          },
        ],
      };
      const en: AboutValuesContent = {
        badge: "Our Values",
        title: "Core Principles Guiding Our Journey",
        subtitle: "We abide by rigorous professional and ethical standards safeguarding client rights and legal integrity.",
        values: [
          {
            id: "val-1",
            title: "Integrity & Transparency",
            description: "Unwavering commitment to honesty, clear fee structures, and unbiased brokerage.",
            icon: "ShieldCheckIcon",
          },
          {
            id: "val-2",
            title: "Quality & Excellence",
            description: "Curating verified licensed advocates to deliver exemplary legal counsel.",
            icon: "AwardIcon",
          },
          {
            id: "val-3",
            title: "Absolute Confidentiality",
            description: "Military-grade encryption protecting sensitive client dossiers and communications.",
            icon: "LockClosedIcon",
          },
          {
            id: "val-4",
            title: "Digital Innovation",
            description: "Continuously advancing legal-tech workflows for effortless dispute management.",
            icon: "LightBulbIcon",
          },
        ],
      };
      return { ar, en };
    }

    case "about_vision": {
      const ar: AboutVisionContent = {
        badge: "رؤيتنا",
        title: "بناء المنظومة القانونية الرقمية الأكثر موثوقية",
        statement: "أن نكون المنصة الرقمية الرائدة والمفضلة في الشرق الأوسط للوساطة القانونية وحلول التقنية العدلية.",
        footer_quote: "تمكين العدالة وسهولة الوصول للخدمات القانونية لكل فرد ومؤسسة.",
        pillars: [
          {
            id: "vis-1",
            title: "الريادة الرقمية",
            description: "أتمتة وتسهيل رحلة التقاضي والاستشارة القانونية بأحدث التقنيات السحابية.",
            icon: "RocketLaunchIcon",
          },
          {
            id: "vis-2",
            title: "التميز في الخدمة",
            description: "تجربة مستخدم استثنائية توفر الوقت والجهد وتضمن سرعة الاستجابة لطلبات العملاء.",
            icon: "StarIcon",
          },
          {
            id: "vis-3",
            title: "المسؤولية المهنية",
            description: "المساهمة الفاعلة في رفع الوعي القانوني ودعم بيئة ريادة الأعمال والاستثمار.",
            icon: "HeartIcon",
          },
        ],
      };
      const en: AboutVisionContent = {
        badge: "Our Vision",
        title: "Building the Most Trusted Digital Legal Ecosystem",
        statement: "To be the premier digital legal brokerage and legal-tech hub across the Middle East.",
        footer_quote: "Empowering justice and seamless legal accessibility for every individual and enterprise.",
        pillars: [
          {
            id: "vis-1",
            title: "Digital Leadership",
            description: "Automating legal advisory journeys through cutting-edge cloud infrastructure.",
            icon: "RocketLaunchIcon",
          },
          {
            id: "vis-2",
            title: "Service Excellence",
            description: "Unrivaled user experience minimizing turnaround time and optimizing client matches.",
            icon: "StarIcon",
          },
          {
            id: "vis-3",
            title: "Professional Responsibility",
            description: "Promoting legal literacy and fostering a thriving investment climate.",
            icon: "HeartIcon",
          },
        ],
      };
      return { ar, en };
    }

    case "about_mission": {
      const ar: AboutMissionContent = {
        badge: "رسالتنا",
        title: "ربط العملاء بالخبرات القانونية بأعلى موثوقية",
        statement: "توفير بيئة رقمية آمنة ومرنة تتيح لأصحاب القضايا الوصول لأفضل الكفاءات القانونية وتتيح للمحامين تقديم خدماتهم باحترافية وتنافسية.",
        pillars: [
          {
            id: "mis-1",
            title: "التواصل الفعال",
            description: "تسهيل قنوات الحوار والمتابعة المستمرة بين الموكل ومحاميه في أي وقت.",
            tag: "تواصل دائم",
            icon: "UsersIcon",
          },
          {
            id: "mis-2",
            title: "الشفافية الكاملة",
            description: "وضوح تام في تفاصيل العروض والأسعار والتقييمات المعتمدة بدون رسوم خفية.",
            tag: "وضوح تام",
            icon: "EyeIcon",
          },
          {
            id: "mis-3",
            title: "ضمان الجودة",
            description: "متابعة مستمرة لآليات التنفيذ وجودة الخدمات والالتزام بالمواعيد المحددة.",
            tag: "أعلى المعايير",
            icon: "CheckCircleIcon",
          },
        ],
      };
      const en: AboutMissionContent = {
        badge: "Our Mission",
        title: "Connecting Clients with Verified Legal Expertise",
        statement: "Delivering a reliable, intuitive platform empowering clients to find top counsel while offering lawyers a competitive digital practice.",
        pillars: [
          {
            id: "mis-1",
            title: "Active Communication",
            description: "Seamless real-time channels keeping clients updated on case developments.",
            tag: "Always Connected",
            icon: "UsersIcon",
          },
          {
            id: "mis-2",
            title: "Total Transparency",
            description: "Transparent fee quotes and verified client reviews with zero hidden surcharges.",
            tag: "Zero Surprises",
            icon: "EyeIcon",
          },
          {
            id: "mis-3",
            title: "Quality Assurance",
            description: "Strict performance monitoring ensuring timely milestone delivery.",
            tag: "Highest Standards",
            icon: "CheckCircleIcon",
          },
        ],
      };
      return { ar, en };
    }

    case "about_terms": {
      const ar: AboutTermsContent = {
        badge: "الشروط والأحكام",
        title: "الشروط والأحكام وسياسة الاستخدام",
        intro_title: "مقدمة وتعريفات أساسية",
        intro_content: "تحكم هذه الشروط والأحكام استخدام منصة الوسيط للوساطة القانونية. يُرجى قراءة هذه الوثيقة بعناية قبل إنشاء حسابك أو استخدام أي من خدماتنا.",
        sections: [
          {
            id: "sec-1",
            title: "1. التعريفات والمصطلحات",
            lead: "يقصد بالكلمات والعبارات التالية المعاني الموضحة أمام كل منها:",
            content: "المنصة: منصة الوسيط للوساطة القانونية. المستخدم: أي شخص طبيعي أو اعتباري ينشئ حساباً. المحامي: المحامي المرخص نظاماً والمقيد بالمنصة.",
            points: [
              "الطلب القانوني: الاستشارة أو القضية التي ينشرها العميل لطلب عروض أسعار.",
              "العرض: المقترح المالي والمهني المقدم من المحامي لتولي الطلب.",
            ],
          },
          {
            id: "sec-2",
            title: "2. المسؤولية القانونية وطبيعة الوساطة",
            lead: "تعمل المنصة كوسيط تقني يربط بين العميل والمحامي المستقل.",
            content: "يتحمل المحامي المسؤولية المهنية المباشرة عن الاستشارات والمذكرات المقدمة، وتقتصر مسؤولية المنصة على تنظيم قنوات الوساطة وسداد الأتعاب المحمية.",
          },
          {
            id: "sec-3",
            title: "3. سرية البيانات وحماية الخصوصية",
            content: "تلتزم المنصة بتشفير كافة بيانات القضايا والملفات المرفوعة، ولا يحق لأي طرف الاطلاع عليها سوى المحامي المختار لإنجاز العمل.",
          },
        ],
      };
      const en: AboutTermsContent = {
        badge: "Terms of Service",
        title: "Terms, Conditions & Usage Policy",
        intro_title: "Introduction & Key Definitions",
        intro_content: "These terms govern the use of Elwaseet Legal Brokerage platform. Please read them thoroughly prior to registering or ordering services.",
        sections: [
          {
            id: "sec-1",
            title: "1. Definitions & Interpretation",
            lead: "The following terms shall have their designated meanings:",
            content: "Platform: Elwaseet Legal Brokerage. User: Any registered natural person or legal entity. Lawyer: Licensed attorney registered on the portal.",
            points: [
              "Legal Request: The consultation or case posted by client to solicit bids.",
              "Quote/Offer: The professional fee proposal submitted by the lawyer.",
            ],
          },
          {
            id: "sec-2",
            title: "2. Brokerage Role & Liability",
            lead: "The platform operates as a digital intermediary connecting clients with independent attorneys.",
            content: "The attorney bears full professional liability for counsel delivered, while the platform guarantees secure escrow and escrowed payments.",
          },
          {
            id: "sec-3",
            title: "3. Confidentiality & Data Protection",
            content: "All uploaded dossiers and client messages are strictly encrypted and only accessible by the hired legal counsel.",
          },
        ],
      };
      return { ar, en };
    }

    case "contact_page": {
      const ar: ContactPageContent = {
        badge: "تواصل معنا",
        title: "نحن هنا لمساعدتك والإجابة على استفساراتك",
        description: "يسعد فريق الدعم بالرد على أسئلتكم ومساعدتكم في أي استفسار يخص الطلبات القانونية أو الانضمام للمنصة.",
        data_source: "contact_settings",
        complaint_title: "تقديم شكوى أو مقترح",
        complaint_subtitle: "في حال واجهتك أي مشكلة أو كان لديك مقترح لتحسين خدماتنا، يُرجى إرسال تفاصيل الشكوى مباشرة لمدير الجودة.",
      };
      const en: ContactPageContent = {
        badge: "Contact Us",
        title: "We Are Here to Assist & Answer Inquiries",
        description: "Our dedicated support team is available to assist with case requests, lawyer registration, or any questions.",
        data_source: "contact_settings",
        complaint_title: "File a Complaint or Suggestion",
        complaint_subtitle: "If you encounter any difficulty or have feedback, submit your report directly to our quality assurance desk.",
      };
      return { ar, en };
    }

    case "faq_accordion": {
      const ar: FAQAccordionContent = {
        badge: "الأسئلة الشائعة",
        title: "الإجابات على أكثر الأسئلة تكراراً",
        description: "دليل شامل للإجابة على جميع تساؤلات العملاء والمحامين حول تقديم الطلبات والرسوم وضمان الأتعاب.",
        data_source: "questions_api",
        search_placeholder: "ابحث في الأسئلة الشائعة...",
      };
      const en: FAQAccordionContent = {
        badge: "FAQ",
        title: "Answers to Frequently Asked Questions",
        description: "Everything you need to know about publishing legal inquiries, lawyer vetting, and protected escrow fees.",
        data_source: "questions_api",
        search_placeholder: "Search frequently asked questions...",
      };
      return { ar, en };
    }

    case "blog_page": {
      const ar: BlogPageContent = {
        badge: "المدونة القانونية",
        title: "المقالات والتحليلات القانونية",
        description: "مقالات واستشارات قانونية متخصصة بقلم نخبة من المحامين والمستشارين المعتمدين.",
        articles_heading: "أحدث المقالات القانونية",
        subscribers_badge: "للمشتركين فقط",
        data_source: "blogs_api",
      };
      const en: BlogPageContent = {
        badge: "Legal Blog",
        title: "Legal Insights & Articles",
        description: "Specialized legal analyses and thought leadership written by verified practitioners.",
        articles_heading: "Latest Legal Articles",
        subscribers_badge: "Subscribers Only",
        data_source: "blogs_api",
      };
      return { ar, en };
    }

    case "page_header_banner": {
      const ar: PageHeaderBannerContent = {
        badge: "منصة الوسيط",
        title: "الوساطة القانونية الرقمية",
        description: "بوابتك الموثوقة للتواصل مع نخبة المحامين المعتمدين في المملكة العربية السعودية.",
      };
      const en: PageHeaderBannerContent = {
        badge: "Elwaseet Platform",
        title: "Digital Legal Brokerage",
        description: "Your trusted gateway to connect with verified lawyers across Saudi Arabia.",
      };
      return { ar, en };
    }

    default:
      return { ar: {}, en: {} };
  }
}

// Initial Mock Pages aligned with D:\elwaset_new
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
    sections_count: 4,
    sections: [
      {
        id: "sec-101",
        page_id: 1,
        type: "home_header",
        sort_order: 0,
        is_active: true,
        content: createDefaultBlockContent("home_header"),
      },
      {
        id: "sec-102",
        page_id: 1,
        type: "home_services",
        sort_order: 1,
        is_active: true,
        content: createDefaultBlockContent("home_services"),
      },
      {
        id: "sec-103",
        page_id: 1,
        type: "how_to_work",
        sort_order: 2,
        is_active: true,
        content: createDefaultBlockContent("how_to_work"),
      },
      {
        id: "sec-104",
        page_id: 1,
        type: "how_to_get_service",
        sort_order: 3,
        is_active: true,
        content: createDefaultBlockContent("how_to_get_service"),
      },
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
    sections_count: 6,
    sections: [
      {
        id: "sec-200",
        page_id: 2,
        type: "page_header_banner",
        sort_order: 0,
        is_active: true,
        content: createDefaultBlockContent("page_header_banner"),
      },
      {
        id: "sec-201",
        page_id: 2,
        type: "about_our_story",
        sort_order: 1,
        is_active: true,
        content: createDefaultBlockContent("about_our_story"),
      },
      {
        id: "sec-202",
        page_id: 2,
        type: "about_values",
        sort_order: 2,
        is_active: true,
        content: createDefaultBlockContent("about_values"),
      },
      {
        id: "sec-203",
        page_id: 2,
        type: "about_vision",
        sort_order: 3,
        is_active: true,
        content: createDefaultBlockContent("about_vision"),
      },
      {
        id: "sec-204",
        page_id: 2,
        type: "about_mission",
        sort_order: 4,
        is_active: true,
        content: createDefaultBlockContent("about_mission"),
      },
      {
        id: "sec-205",
        page_id: 2,
        type: "about_terms",
        sort_order: 5,
        is_active: true,
        content: createDefaultBlockContent("about_terms"),
      },
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
    sections_count: 1,
    sections: [
      {
        id: "sec-301",
        page_id: 3,
        type: "contact_page",
        sort_order: 0,
        is_active: true,
        content: createDefaultBlockContent("contact_page"),
      },
    ],
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
    sections_count: 1,
    sections: [
      {
        id: "sec-401",
        page_id: 4,
        type: "faq_accordion",
        sort_order: 0,
        is_active: true,
        content: createDefaultBlockContent("faq_accordion"),
      },
    ],
  },
  {
    id: 5,
    slug: "terms",
    title: { ar: "الشروط والأحكام", en: "Terms & Conditions" },
    type: "policy",
    is_published: true,
    seo: {
      meta_title: { ar: "الشروط والأحكام - منصة الوسيط", en: "Terms of Service - Elwaseet" },
      meta_description: { ar: "الشروط والأحكام وسياسة الاستخدام لمنصة الوسيط للوساطة القانونية", en: "Platform usage terms and conditions" },
    },
    sections_count: 1,
    sections: [
      {
        id: "sec-501",
        page_id: 5,
        type: "about_terms",
        sort_order: 0,
        is_active: true,
        content: createDefaultBlockContent("about_terms"),
      },
    ],
  },
  {
    id: 6,
    slug: "privacy",
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    type: "policy",
    is_published: true,
    seo: {
      meta_title: { ar: "سياسة الخصوصية وسرية المعلومات", en: "Privacy Policy & Confidentiality" },
      meta_description: { ar: "سياسة حماية وسرية بيانات العملاء والقضايا", en: "User data confidentiality guidelines" },
    },
    sections_count: 1,
    sections: [
      {
        id: "sec-601",
        page_id: 6,
        type: "about_terms",
        sort_order: 0,
        is_active: true,
        content: {
          ar: {
            badge: "الخصوصية",
            title: "سياسة الخصوصية وسرية المعلومات القانونية",
            intro_title: "حماية بيانات الموكلين والمحامين",
            intro_content: "تولي منصة الوسيط أهمية قصوى لسرية وخصوصية البيانات القانونية وفق الأنظمة واللوائح المعتمدة في المملكة العربية السعودية.",
            sections: [
              {
                id: "priv-1",
                title: "1. جمع البيانات واستخدامها",
                content: "يتم جمع بيانات الاتصال والهوية الوطنية والوثائق لغرض التحقق وإسناد الطلبات القانونية للمحامين المعتمدين فقط.",
              },
              {
                id: "priv-2",
                title: "2. التشفير والحماية التقنية",
                content: "تُشفر كافة الوثائق والمراسلات بين الموكل والمحامي بأحدث بروتوكولات الأمان SSL/TLS مع عزل قواعد البيانات.",
              },
            ],
          },
          en: {
            badge: "Privacy",
            title: "Privacy Policy & Legal Confidentiality",
            intro_title: "Protection of Client & Attorney Information",
            intro_content: "Elwaseet upholds stringent data confidentiality standards complying with Saudi legal cybersecurity regulations.",
            sections: [
              {
                id: "priv-1",
                title: "1. Data Collection & Purpose",
                content: "Identity credentials and case documents are solely gathered to verify participants and facilitate legal representation.",
              },
              {
                id: "priv-2",
                title: "2. Encryption & Security",
                content: "All client-attorney dossiers are secured using enterprise SSL/TLS encryption with segregated access controls.",
              },
            ],
          },
        },
      },
    ],
  },
];

const STORAGE_KEY = "elwaseet_page_builder_pages_v9";

function loadFromStorage(): Page[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
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
          target.sections = sections.map((s, idx) => ({
            ...s,
            sort_order: idx,
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
