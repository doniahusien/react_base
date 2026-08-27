import type { BlockTemplate } from "../types/blocks";

export const INITIAL_BLOCK_TEMPLATES: BlockTemplate[] = [
  // 1. Title + Desc + Image + Features (with Icons)
  {
    id: "title_desc_image_features",
    name_ar: "عنوان + وصف + صورة + مميزات بأيقونات",
    name_en: "Title + Desc + Image + Icon Features",
    description_ar: "قسم نبذة مع صورة جانبية معتمدة وقائمة بنقاط قوة ومميزات مزودة بأيقونات مخصصة (مثل قسم قصة المنصة)",
    description_en: "Story narrative section with portrait image, stats badge, and highlight feature list with custom icons",
    category: "content_media",
    icon: "BookOpen",
    shape_tags: ["badge", "title", "description", "image", "stats_badge", "features_repeater", "icons"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم العلوي (Badge)", label_en: "Top Badge", type: "text" },
      { key: "title", label_ar: "العنوان الرئيسي", label_en: "Main Title", type: "text", required: true },
      { key: "description", label_ar: "نص الوصف التوضيحي", label_en: "Description", type: "textarea", required: true },
      { key: "image", label_ar: "الصورة الجانبية", label_en: "Portrait Image", type: "image", default_value: "/images/about.webp" },
      { key: "stats_label", label_ar: "نص شارة الاعتماد / الإحصائية", label_en: "Stats Badge Label", type: "text" },
      {
        key: "features",
        label_ar: "قائمة المميزات ونقاط القوة",
        label_en: "Features List",
        type: "repeater",
        item_label_ar: "ميزة",
        item_label_en: "Feature",
        item_fields: [
          { key: "title", label_ar: "عنوان الميزة", label_en: "Title", type: "text", required: true },
          { key: "description", label_ar: "شرح الميزة", label_en: "Description", type: "textarea" },
          { key: "icon", label_ar: "الأيقونة", label_en: "Icon", type: "icon", default_value: "ShieldCheck" },
        ],
      },
    ],
    default_content: {
      ar: {
        badge: "قصتنا ومسيرتنا",
        title: "رواد في الوساطة والتحول الرقمي القانوني",
        description: "انطلقت منصة الوسيط للوساطة القانونية برؤية طموحة تهدف إلى تسهيل وصول الأفراد والشركات إلى نخبة المحامين المرخصين في المملكة العربية السعودية.",
        image: "/images/about.webp",
        stats_label: "منصة معتمدة وموثوقة",
        features: [
          { title: "حماية تامة للحقوق", description: "حفظ حقوق العميل والمحامي في حساب وسيط موثوق", icon: "ShieldCheck" },
          { title: "نخبة المحامين المعتمدين", description: "التحقق المباشر من سريان تراخيص المحامين من وزارة العدل", icon: "Award" },
        ],
      },
      en: {
        badge: "Our Story",
        title: "Pioneering Digital Legal Brokerage",
        description: "Elwaseet was established to connect clients with licensed legal practitioners across Saudi Arabia with complete trust.",
        image: "/images/about.webp",
        stats_label: "Licensed & Verified Platform",
        features: [
          { title: "Full Escrow Protection", description: "Safeguarded payments until case resolution", icon: "ShieldCheck" },
          { title: "Certified Lawyers", description: "Direct validation of legal bar licenses", icon: "Award" },
        ],
      },
    },
  },

  // 2. Title + Desc + Image Only
  {
    id: "title_desc_image_only",
    name_ar: "عنوان + وصف + صورة فقط",
    name_en: "Title + Desc + Image Only",
    description_ar: "بلوك محتوى بسيط ومباشر يحتوي على عنوان ووصف تفصيلي وصورة عريضة أو جانبية بدون أيقونات",
    description_en: "Clean content block with heading, rich paragraph text, and featured image",
    category: "content_media",
    icon: "DocumentText",
    shape_tags: ["badge", "title", "description", "image"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم (Badge)", label_en: "Badge", type: "text" },
      { key: "title", label_ar: "العنوان الرئيسي", label_en: "Main Title", type: "text", required: true },
      { key: "description", label_ar: "نص المقال أو المحتوى", label_en: "Body Content", type: "textarea", required: true },
      { key: "image", label_ar: "رابط الصورة", label_en: "Image URL", type: "image", default_value: "/images/slider1.webp" },
    ],
    default_content: {
      ar: {
        badge: "عن المنصة",
        title: "بناء مستقبل العدالة الرقمية",
        description: "نسعى لتقديم تجربة متكاملة تمكّن كافة أطراف العملية القانونية من إنجاز المعاملات بأعلى درجات السهولة والسرعة.",
        image: "/images/slider1.webp",
      },
      en: {
        badge: "About Us",
        title: "Building the Future of Digital Justice",
        description: "We strive to deliver an all-in-one experience empowering clients and lawyers to collaborate effortlessly.",
        image: "/images/slider1.webp",
      },
    },
  },

  // 3. Cards Grid with Icons & Images (Services Grid)
  {
    id: "cards_grid_with_icons_images",
    name_ar: "شبكة بطاقات (كروت) بخلفيات وأيقونات",
    name_en: "Cards Grid with Icons & Images",
    description_ar: "شبكة بطاقات تفاعلية تتمدد عند التمرير، تحتوي كل بطاقة على أيقونة وصورة خلفية وعنوان ووصف يظهر عند التمرير (مثل خدمات المنصة)",
    description_en: "Interactive expanding cards grid with background images, custom icons, titles, and hover descriptions",
    category: "cards_grid",
    icon: "Briefcase",
    shape_tags: ["cards_repeater", "images", "icons"],
    is_active: true,
    fields: [
      {
        key: "services",
        label_ar: "بطاقات الخدمات والكروت",
        label_en: "Cards List",
        type: "repeater",
        item_label_ar: "بطاقة خدمة",
        item_label_en: "Service Card",
        item_fields: [
          { key: "title", label_ar: "عنوان البطاقة", label_en: "Card Title", type: "text", required: true },
          { key: "description", label_ar: "الوصف التوضيحي (يظهر عند التمرير)", label_en: "Description", type: "textarea" },
          { key: "icon", label_ar: "أيقونة البطاقة", label_en: "Icon", type: "icon", default_value: "Scale" },
          { key: "image", label_ar: "صورة خلفية البطاقة", label_en: "Card Background Image", type: "image", default_value: "/images/service1.webp" },
        ],
      },
    ],
    default_content: {
      ar: {
        services: [
          { title: "تقديم طلب قانوني", description: "قدّم طلبك القانوني واستقبل عروض الأسعار من محامين معتمدين خلال ساعات.", icon: "Scale", image: "/images/service1.webp" },
          { title: "الباقات القانونية", description: "تصفح باقات الخدمات القانونية المسعّرة مسبقاً من نخبة المحامين والمكاتب المعتمدة.", icon: "FileText", image: "/images/service2.webp" },
          { title: "محامون معتمدون", description: "تضع باقات الخدمات القانونية المسعّرة مسبقاً من نخبة المحامين والمكاتب المعتمدة.", icon: "ShieldCheck", image: "/images/service3.webp" },
          { title: "استشارات متخصصة", description: "جلسات استشارية قانونية مع نخبة من المستشارين المرخصين لحماية حقوقك ومصالحك.", icon: "Users", image: "/images/slider1.webp" },
        ],
      },
      en: {
        services: [
          { title: "Submit Legal Request", description: "Post your legal inquiry and receive quotes from certified attorneys within hours.", icon: "Scale", image: "/images/service1.webp" },
          { title: "Fixed Legal Packages", description: "Browse predefined advisory and contract drafting packages at transparent rates.", icon: "FileText", image: "/images/service2.webp" },
          { title: "Certified Lawyers", description: "Engage directly with vetted and licensed practitioners across all legal specialties.", icon: "ShieldCheck", image: "/images/service3.webp" },
          { title: "Specialized Consultations", description: "One-on-one advisory sessions with accredited attorneys to protect your legal interests.", icon: "Users", image: "/images/slider1.webp" },
        ],
      },
    },
  },

  // 4. Workflow Steps Cards with Numbers & Icons
  {
    id: "steps_workflow_cards",
    name_ar: "مسار خطوات مرقمة بأيقونات وشروحات",
    name_en: "Numbered Workflow Steps with Icons",
    description_ar: "عرض متسلسل لخطوات العمل مرقمة (01, 02, 03) مع أيقونة وعنوان وشرح مفصل وسهم توجيه (مثل قسم كيف نعمل)",
    description_en: "Sequenced 4-step workflow cards with step numbers, custom icons, titles, and descriptions",
    category: "workflow",
    icon: "Clock",
    shape_tags: ["badge", "title", "description", "steps_repeater", "step_numbers", "icons"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم (Badge)", label_en: "Badge", type: "text" },
      { key: "title", label_ar: "عنوان القسم", label_en: "Section Title", type: "text", required: true },
      { key: "description", label_ar: "الوصف التمهيدي", label_en: "Intro Description", type: "textarea" },
      {
        key: "steps",
        label_ar: "خطوات مسار العمل",
        label_en: "Workflow Steps",
        type: "repeater",
        item_label_ar: "خطوة",
        item_label_en: "Step",
        item_fields: [
          { key: "step_number", label_ar: "رقم الخطوة (مثال: 01)", label_en: "Step Number (e.g. 01)", type: "text", default_value: "01", required: true },
          { key: "title", label_ar: "عنوان الخطوة", label_en: "Step Title", type: "text", required: true },
          { key: "description", label_ar: "شرح الخطوة", label_en: "Step Description", type: "textarea" },
          { key: "icon", label_ar: "أيقونة الخطوة", label_en: "Icon", type: "icon", default_value: "PenLine" },
        ],
      },
    ],
    default_content: {
      ar: {
        badge: "خطوات العمل",
        title: "كيف تعمل منصة الوسيط للوساطة القانونية",
        description: "رحلة سهلة وسلسة تبدأ بتقديم طلبك وتنتهي بالحصول على أفضل تمثيل واستشارة قانونية.",
        steps: [
          { step_number: "01", title: "سجل حسابك وحدد نوع طلبك", description: "أنشئ حسابك وحدد تفاصيل القضية أو الاستشارة المطلوبة", icon: "Users" },
          { step_number: "02", title: "استقبل عروض أسعار المحامين", description: "يتنافس نخبة من المحامين المرخصين بتقديم عروضهم", icon: "FileText" },
          { step_number: "03", title: "اختر المحامي الأنسب", description: "راجع السير الذاتية والتقييمات واختر العرض المناسب", icon: "Award" },
          { step_number: "04", title: "ابدأ العمل والتواصل الآمن", description: "تواصل مع محاميك بكل سرية واحترافية", icon: "MessageSquare" },
        ],
      },
      en: {
        badge: "Workflow",
        title: "How Elwaseet Legal Brokerage Works",
        description: "A seamless 4-step experience from initial inquiry to hiring your dedicated attorney.",
        steps: [
          { step_number: "01", title: "Create Account & Submit", description: "Sign up and describe your legal case", icon: "Users" },
          { step_number: "02", title: "Receive Lawyer Quotes", description: "Licensed advocates submit tailored proposals", icon: "FileText" },
          { step_number: "03", title: "Select Best Advocate", description: "Compare profiles, ratings, and budgets", icon: "Award" },
          { step_number: "04", title: "Start Direct Collaboration", description: "Communicate in private encrypted channels", icon: "MessageSquare" },
        ],
      },
    },
  },

  // 5. Dual Action Cards (Client & Lawyer CTA Paths)
  {
    id: "dual_action_cta_cards",
    name_ar: "بطاقتي توجيه ثنائية (مسار العميل ومسار المحامي)",
    name_en: "Dual Action Choice Cards (Client / Lawyer)",
    description_ar: "بطاقتان كبيرتان لاختيار المسار المناسب (تقديم طلب للعملاء مقابل انضمام المحامين) مع أزرار وأيقونات وبادجات توضيحية",
    description_en: "Two prominent conversion cards for clients and lawyers with distinct CTA buttons, icons, and waitlist notes",
    category: "workflow",
    icon: "UserGroup",
    shape_tags: ["badge", "title", "subtitle", "dual_cards", "cta_buttons", "icons"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم (Badge)", label_en: "Badge", type: "text" },
      { key: "title", label_ar: "العنوان الرئيسي", label_en: "Main Title", type: "text", required: true },
      { key: "subtitle", label_ar: "العنوان الفرعي", label_en: "Subtitle", type: "text" },
    ],
    default_content: {
      ar: {
        badge: "ابدأ الآن",
        title: "اختر المسار المناسب لك",
        subtitle: "سواء كنت تبحث عن تمثيل قانوني أو كنت محامياً ترغب في توسيع قاعدة عملائك",
        client_option: {
          title: "تقديم طلب قانوني (للعملاء)",
          description: "اطرح استشارتك أو قضيتك القانونية لتصل إلى مئات المحامين المعتمدين واستقبل عروضهم في وقت قياسي.",
          cta_text: "تقديم طلب الآن",
          cta_link: "/auth/sign-up/client/step-1",
          icon: "PenLine",
          note_text: "+500 محامٍ معتمد بانتظار خدمتك",
        },
        lawyer_option: {
          title: "الانضمام كمحامٍ أو مكتب محاماة",
          description: "انضم إلى شبكة المحامين الرائدة، واطلع على آلاف الطلبات القانونية يومياً وقدم عروضك مباشرة للعملاء.",
          cta_text: "التسجيل كمحامٍ",
          cta_link: "/auth/sign-up/lawyer/step-1",
          icon: "Users",
          note_text: "فرص عمل وتعاقدات يومية جديدة",
        },
      },
      en: {
        badge: "Get Started",
        title: "Choose Your Path",
        subtitle: "Whether you need professional legal representation or you are a certified lawyer seeking clients",
        client_option: {
          title: "Submit Legal Request (Clients)",
          description: "Post your case to reach hundreds of licensed attorneys rapidly.",
          cta_text: "Post Request Now",
          cta_link: "/auth/sign-up/client/step-1",
          icon: "PenLine",
          note_text: "500+ Verified lawyers ready to assist",
        },
        lawyer_option: {
          title: "Join as Lawyer or Law Firm",
          description: "Access daily legal requests across the Kingdom and grow your practice.",
          cta_text: "Register as Lawyer",
          cta_link: "/auth/sign-up/lawyer/step-1",
          icon: "Users",
          note_text: "New daily opportunities and retainers",
        },
      },
    },
  },

  // 6. Values & Pillars Cards with Tags and Icons
  {
    id: "values_pillars_cards",
    name_ar: "بطاقات القيم والركائز مع وسوم وأيقونات",
    name_en: "Core Values Cards with Tags & Icons",
    description_ar: "أربع بطاقات للقيم المؤسسية (النزاهة، الجودة، السرية، الابتكار) مع أيقونة وشارة وسوم توضيحية وشرح موجز",
    description_en: "4-column core values cards with badges, icons, title, and detailed principle statements",
    category: "cards_grid",
    icon: "ShieldCheck",
    shape_tags: ["badge", "title", "subtitle", "values_repeater", "tags", "icons"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم (Badge)", label_en: "Badge", type: "text" },
      { key: "title", label_ar: "عنوان القسم", label_en: "Title", type: "text", required: true },
      { key: "subtitle", label_ar: "العنوان الفرعي", label_en: "Subtitle", type: "text" },
      {
        key: "values",
        label_ar: "قائمة القيم والركائز",
        label_en: "Values List",
        type: "repeater",
        item_label_ar: "قيمة",
        item_label_en: "Value",
        item_fields: [
          { key: "title", label_ar: "اسم القيمة", label_en: "Title", type: "text", required: true },
          { key: "description", label_ar: "شرح القيمة", label_en: "Description", type: "textarea" },
          { key: "tag", label_ar: "الوسم الفرعي (Tag)", label_en: "Tag Badge", type: "text", default_value: "ركيزة أساسية" },
          { key: "icon", label_ar: "رمز الأيقونة", label_en: "Icon", type: "icon", default_value: "Scale" },
        ],
      },
    ],
    default_content: {
      ar: {
        badge: "قيمنا",
        title: "القيم والمبادئ التي توجه مسيرتنا",
        subtitle: "نلتزم بركائز مهنية وأخلاقية صارمة تضمن حماية حقوق ومصالح جميع الأطراف.",
        values: [
          { title: "النزاهة والشفافية", description: "الالتزام بأعلى معايير الصدق والوضوح في التعاملات وتسعير الخدمات والوساطة.", tag: "نزاهة تامة", icon: "Scale" },
          { title: "الجودة والاحترافية", description: "استقطاب المحامين المعتمدين لتقديم استشارات قانونية بأعلى درجات الإتقان.", tag: "معايير عليا", icon: "Award" },
          { title: "السرية التامة", description: "تشفير وحماية كافة وثائق وبيانات القضايا وفق أعلى المعايير الأمنية.", tag: "تشفير كامل", icon: "Lock" },
          { title: "الابتكار الرقمي", description: "تطوير حلول تقنية تسهل إجراءات الوساطة وإدارة الطلبات بذكاء وسرعة.", tag: "تقنية حديثة", icon: "Sparkles" },
        ],
      },
      en: {
        badge: "Our Values",
        title: "Core Principles Guiding Our Journey",
        subtitle: "We abide by rigorous professional and ethical standards safeguarding client rights.",
        values: [
          { title: "Integrity & Transparency", description: "Unwavering commitment to honesty and clear fee structures.", tag: "Integrity", icon: "Scale" },
          { title: "Quality & Excellence", description: "Curating verified licensed advocates to deliver exemplary counsel.", tag: "Excellence", icon: "Award" },
          { title: "Absolute Confidentiality", description: "Military-grade encryption protecting sensitive client dossiers.", tag: "Security", icon: "Lock" },
          { title: "Digital Innovation", description: "Advancing legal-tech workflows for effortless dispute management.", tag: "Innovation", icon: "Sparkles" },
        ],
      },
    },
  },

  // 7. Vision & Mission Statement with Quote & Pillars
  {
    id: "vision_mission_statement_pillars",
    name_ar: "بيان الرؤية/الرسالة + اقتباس + ركائز بأيقونات",
    name_en: "Vision/Mission Statement + Quote + Pillars",
    description_ar: "قسم عريض بخلفية داكنة أو فاتحة يضم بيان الرؤية/الرسالة، اقتباساً مائلاً مميزاً، وبطاقات ركائز مزودة بأيقونات (مثل صفحة من نحن)",
    description_en: "Rich statement section with quote highlight and side pillar cards with custom icons",
    category: "quotes",
    icon: "Sparkles",
    shape_tags: ["badge", "title", "statement", "quote_footer", "pillars_repeater", "icons"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم (Badge)", label_en: "Badge", type: "text" },
      { key: "title", label_ar: "عنوان الرؤية / الرسالة", label_en: "Title", type: "text", required: true },
      { key: "statement", label_ar: "نص البيان الأساسي", label_en: "Main Statement", type: "textarea", required: true },
      { key: "footer_quote", label_ar: "الاقتباس المميز أسفل البيان", label_en: "Footer Quote", type: "text" },
      {
        key: "pillars",
        label_ar: "ركائز الرؤية / أهداف الرسالة",
        label_en: "Pillars List",
        type: "repeater",
        item_label_ar: "ركيزة",
        item_label_en: "Pillar",
        item_fields: [
          { key: "title", label_ar: "عنوان الركيزة", label_en: "Title", type: "text", required: true },
          { key: "description", label_ar: "شرح الركيزة", label_en: "Description", type: "textarea" },
          { key: "icon", label_ar: "الأيقونة", label_en: "Icon", type: "icon", default_value: "Sparkles" },
        ],
      },
    ],
    default_content: {
      ar: {
        badge: "رؤيتنا المستقبلية",
        title: "بناء المنظومة القانونية الرقمية الأكثر موثوقية",
        statement: "أن نكون المنصة الرقمية الرائدة والمفضلة في الشرق الأوسط للوساطة القانونية وحلول التقنية العدلية.",
        footer_quote: "تمكين العدالة وسهولة الوصول للخدمات القانونية لكل فرد ومؤسسة.",
        pillars: [
          { title: "الريادة الرقمية", description: "أتمتة وتسهيل رحلة التقاضي والاستشارة القانونية بأحدث التقنيات السحابية.", icon: "Sparkles" },
          { title: "التميز في الخدمة", description: "تجربة مستخدم استثنائية توفر الوقت والجهد وتضمن سرعة الاستجابة.", icon: "Award" },
          { title: "المسؤولية المهنية", description: "المساهمة الفاعلة في رفع الوعي القانوني ودعم بيئة الاستثمار.", icon: "Heart" },
        ],
      },
      en: {
        badge: "Our Vision",
        title: "Building the Most Trusted Digital Legal Ecosystem",
        statement: "To be the premier digital legal brokerage and legal-tech hub across the Middle East.",
        footer_quote: "Empowering justice and seamless legal accessibility for every individual and enterprise.",
        pillars: [
          { title: "Digital Leadership", description: "Automating legal advisory journeys through cutting-edge cloud tech.", icon: "Sparkles" },
          { title: "Service Excellence", description: "Unrivaled user experience minimizing turnaround time.", icon: "Award" },
          { title: "Professional Duty", description: "Promoting legal literacy and fostering a thriving investment climate.", icon: "Heart" },
        ],
      },
    },
  },

  // 8. Contact Channels & Complaint Form
  {
    id: "contact_channels_info",
    name_ar: "هيدر صفحة التواصل (مع الربط التلقائي ببيانات التواصل)",
    name_en: "Contact Page Header & Dynamic Integration",
    description_ar: "هيدر وبانر صفحة التواصل مع نصوص الترحيب، صورة الخلفية/السلايدر، والربط التلقائي ببيانات التواصل الرسمية (الهاتف، البريد، العنوان، ونموذج الشكاوى)",
    description_en: "Contact page banner header with auto-integration to official Contact Settings (phone, email, address, complaints)",
    category: "support",
    icon: "Phone",
    shape_tags: ["badge", "title", "description", "global_slider", "contact_settings_api", "complaint_form"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم (Badge)", label_en: "Badge", type: "text", default_value: "تواصل معنا" },
      { key: "title", label_ar: "عنوان صفحة التواصل", label_en: "Page Title", type: "text", required: true },
      { key: "description", label_ar: "الوصف التمهيدي", label_en: "Subtitle Description", type: "textarea" },
      { key: "complaint_title", label_ar: "عنوان نموذج الشكاوى والمقترحات", label_en: "Complaint Form Title", type: "text", default_value: "تقديم شكوى أو مقترح" },
      { key: "complaint_subtitle", label_ar: "وصف نموذج الشكاوى", label_en: "Complaint Subtitle", type: "textarea" },
    ],
    default_content: {
      ar: {
        badge: "تواصل معنا",
        title: "نحن هنا لمساعدتك والإجابة عن استفساراتك",
        description: "فريق الدعم الفني وخدمة العملاء جاهز للرد على استفساراتك على مدار الساعة.",
        complaint_title: "تقديم شكوى أو مقترح لمدير الجودة",
        complaint_subtitle: "في حال واجهتك أي مشكلة يُرجى إرسال تفاصيل الشكوى مباشرة لمدير الجودة وسنعاود الاتصال بك.",
      },
      en: {
        badge: "Contact Us",
        title: "We Are Here to Assist Your Inquiries",
        description: "Our legal support and customer success team is available 24/7.",
        complaint_title: "Submit a Complaint or Suggestion",
        complaint_subtitle: "If you encounter any issues, submit your concerns directly to Quality Management.",
      },
    },
  },

  // 9. FAQ Page Header & Dynamic Integration
  {
    id: "faq_accordion_categorized",
    name_ar: "هيدر الأسئلة الشائعة (مع الربط التلقائي ببنك الأسئلة)",
    name_en: "FAQ Page Header & Dynamic Questions Integration",
    description_ar: "هيدر وبانر صفحة الأسئلة الشائعة مع نصوص العنوان، صورة الخلفية، ومصدر السلايدر، حيث يجلب الباك إند الأسئلة تلقائياً من بنك الأسئلة (/questions)",
    description_en: "FAQ page banner header with auto-integration to dynamic backend Questions & Inquiries repository",
    category: "support",
    icon: "HelpCircle",
    shape_tags: ["badge", "title", "description", "global_slider", "questions_api", "search_bar"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم (Badge)", label_en: "Badge", type: "text", default_value: "الأسئلة الشائعة" },
      { key: "title", label_ar: "عنوان صفحة الأسئلة", label_en: "Section Title", type: "text", required: true },
      { key: "description", label_ar: "الوصف التوضيحي", label_en: "Description", type: "textarea" },
      { key: "search_placeholder", label_ar: "نص حقل البحث في الأسئلة", label_en: "Search Placeholder", type: "text", default_value: "ابحث في الأسئلة الشائعة..." },
    ],
    default_content: {
      ar: {
        badge: "الأسئلة الشائعة",
        title: "الإجابات على أكثر الأسئلة تكراراً",
        description: "دليل شامل للإجابة على تساؤلات العملاء والمحامين حول تقديم الطلبات والرسوم والوساطة.",
        search_placeholder: "ابحث في الأسئلة الشائعة...",
      },
      en: {
        badge: "FAQs",
        title: "Frequently Asked Questions",
        description: "Comprehensive guide answering common questions about case requests, fees, and lawyer licensing.",
        search_placeholder: "Search frequently asked questions...",
      },
    },
  },

  // 10. Blog Page Header & Dynamic Integration
  {
    id: "blog_page_header",
    name_ar: "هيدر المدونة والمقالات (مع الربط التلقائي بالمقالات)",
    name_en: "Blog Page Header & Dynamic Articles Integration",
    description_ar: "هيدر وبانر صفحة المدونة القانونية مع نصوص التعريف وشارة المشتركين وصورة الخلفية، حيث يجلب الباك إند المقالات والتصنيفات تلقائياً من نظام المدونة (/blogs)",
    description_en: "Legal blog page header with auto-integration to dynamic backend Blogs & Categories repository",
    category: "content_media",
    icon: "DocumentText",
    shape_tags: ["badge", "title", "description", "global_slider", "blogs_api", "categories_filter"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم (Badge)", label_en: "Badge", type: "text", default_value: "المدونة القانونية" },
      { key: "title", label_ar: "عنوان صفحة المدونة", label_en: "Blog Title", type: "text", required: true },
      { key: "description", label_ar: "الوصف التوضيحي للمدونة", label_en: "Description", type: "textarea" },
      { key: "articles_heading", label_ar: "عنوان قسم المقالات", label_en: "Articles Section Heading", type: "text", default_value: "أحدث المقالات القانونية" },
      { key: "subscribers_badge", label_ar: "شارة المشتركين", label_en: "Subscribers Badge Text", type: "text", default_value: "للمشتركين فقط" },
    ],
    default_content: {
      ar: {
        badge: "المدونة القانونية",
        title: "المقالات والتحليلات القانونية",
        description: "مقالات واستشارات قانونية متخصصة بقلم نخبة من المحامين والمستشارين المعتمدين.",
        articles_heading: "أحدث المقالات القانونية",
        subscribers_badge: "للمشتركين فقط",
      },
      en: {
        badge: "Legal Blog",
        title: "Legal Insights & Articles",
        description: "Specialized legal analyses and thought leadership written by verified practitioners.",
        articles_heading: "Latest Legal Articles",
        subscribers_badge: "Subscribers Only",
      },
    },
  },

  // 10. Numbered Legal Terms & Clauses
  {
    id: "numbered_legal_clauses",
    name_ar: "البنود والفقرات القانونية المرقمة (الشروط والأحكام)",
    name_en: "Numbered Legal Articles & Clauses",
    description_ar: "نصوص الشروط والأحكام، التعريفات، البنود القانونية، إخلاء المسؤولية مقسمة إلى بنود مرقمة وواضحة (مثل صفحة الشروط)",
    description_en: "Structured numbered legal articles, policy clauses, disclaimers, and terms definitions",
    category: "legal",
    icon: "FileText",
    shape_tags: ["badge", "title", "intro_heading", "intro_content", "clauses_repeater", "articles"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم (Badge)", label_en: "Badge", type: "text" },
      { key: "title", label_ar: "عنوان الوثيقة القانونية", label_en: "Document Title", type: "text", required: true },
      { key: "intro_title", label_ar: "عنوان المقدمة", label_en: "Intro Heading", type: "text" },
      { key: "intro_content", label_ar: "نص المقدمة التمهيدي", label_en: "Intro Text", type: "textarea" },
      {
        key: "sections",
        label_ar: "البنود والمواد القانونية",
        label_en: "Legal Clauses",
        type: "repeater",
        item_label_ar: "مادة / بند",
        item_label_en: "Clause",
        item_fields: [
          { key: "title", label_ar: "عنوان المادة أو البند", label_en: "Clause Title", type: "text", required: true },
          { key: "lead", label_ar: "نص تمهيدي للبند", label_en: "Lead / Summary", type: "text" },
          { key: "content", label_ar: "نص المادة الكامل والتفصيلي", label_en: "Clause Body", type: "textarea", required: true },
        ],
      },
    ],
    default_content: {
      ar: {
        badge: "وثيقة الشروط",
        title: "الشروط والأحكام والاتفاقية القانونية",
        intro_title: "مقدمة عامة وأهلية الاستخدام",
        intro_content: "تنظم هذه الاتفاقية العلاقة القانونية بين منصة الوسيط ومستخدميها من عملاء ومحامين معتمدين.",
        sections: [
          { title: "المادة الأولى: التعريفات والمصطلحات", lead: "المفاهيم المعتمدة في هذه الاتفاقية", content: "تُقصد بكلمة (المنصة) منصة الوسيط للوساطة القانونية، ويُقصد بـ (العميل) كل شخص طبيعي أو اعتباري يطلب خدمة قانونية." },
          { title: "المادة الثانية: طبيعة الخدمة والوساطة", lead: "دور المنصة كوسيط تقني وإداري", content: "تعمل المنصة كوسيط إلكتروني يربط طالبي الخدمات بالمحامين المرخصين دون التدخل المباشر في الرأي القانوني." },
          { title: "المادة الثالثة: سرية وأمان البيانات", lead: "التزام كامل بحماية الخصوصية", content: "تلتزم المنصة بتشفير كافة المستندات والمعلومات المتبادلة وعدم إفشائها لأي طرف ثالث خارج نطاق القضية." },
        ],
      },
      en: {
        badge: "Terms & Conditions",
        title: "Terms of Service & User Agreement",
        intro_title: "General Introduction & Eligibility",
        intro_content: "This agreement governs the contractual relationship between Elwaseet platform, clients, and verified advocates.",
        sections: [
          { title: "Article 1: Definitions & Interpretations", lead: "Key legal terms defined", content: "'Platform' refers to Elwaseet Legal Brokerage. 'Client' means any individual or corporate entity requesting counsel." },
          { title: "Article 2: Nature of Brokerage Service", lead: "Technological intermediary role", content: "The platform functions as a certified digital gateway connecting clients with bar-licensed attorneys." },
          { title: "Article 3: Confidentiality & Data Protection", lead: "Commitment to client privilege", content: "All client dossiers and communications remain encrypted under high-grade data protection protocols." },
        ],
      },
    },
  },

  // 11. Main Hero Carousel Header (Linked to Global Slider)
  {
    id: "home_hero_header",
    name_ar: "بانر الهيدر الرئيسي (Hero) المرتبط بالسلايدر العام",
    name_en: "Main Hero Header (Linked to Global Slider)",
    description_ar: "الهيدر الرئيسي للصفحة الأولى مع نصوص ثلاثية الأسطر، كلمة ملونة مميزة، أزرار توجيه، ومصدر السلايدر العام المدار في Banners CRUD",
    description_en: "Top home hero header with multi-line title, highlight word, CTA action button, and auto-integrated global slider",
    category: "hero",
    icon: "Sparkles",
    shape_tags: ["badge", "title_lines", "highlight_word", "description", "cta_button", "global_slider"],
    is_active: true,
    fields: [
      { key: "badge", label_ar: "الوسم / البادج العلوي", label_en: "Top Badge", type: "text", default_value: "منصة مرخصة وموثوقة" },
      { key: "title_line1", label_ar: "سطر العنوان الأول", label_en: "Title Line 1", type: "text", required: true },
      { key: "title_line2", label_ar: "سطر العنوان الثاني", label_en: "Title Line 2", type: "text" },
      { key: "title_highlight", label_ar: "الكلمة المميزة بلون رئيسي", label_en: "Highlighted Word", type: "text", required: true },
      { key: "description", label_ar: "الوصف التوضيحي الرئيسي", label_en: "Main Description", type: "textarea", required: true },
      { key: "cta_text", label_ar: "نص الزر الأساسي", label_en: "Primary Button Text", type: "text", default_value: "تقديم طلب قانوني" },
      { key: "cta_link", label_ar: "رابط الزر الأساسي", label_en: "Primary Button Link", type: "url", default_value: "/auth/sign-up/client/step-1" },
      { key: "secondary_cta_text", label_ar: "نص الزر الثانوي", label_en: "Secondary Button Text", type: "text", default_value: "تصفح المحامين" },
      { key: "secondary_cta_link", label_ar: "رابط الزر الثانوي", label_en: "Secondary Button Link", type: "url", default_value: "/auth/sign-up" },
    ],
    default_content: {
      ar: {
        badge: "منصة مرخصة وموثوقة",
        title_line1: "منصتك الموثوقة",
        title_line2: "للوصول إلى",
        title_highlight: "أفضل المحامين",
        description: "منصة رقمية موثوقة تربطك بأفضل المحامين ومقدمي الخدمات القانونية في المملكة العربية السعودية بكل سهولة وموثوقية.",
        cta_text: "تقديم طلب قانوني",
        cta_link: "/auth/sign-up/client/step-1",
        secondary_cta_text: "تصفح المحامين",
        secondary_cta_link: "/auth/sign-up",
      },
      en: {
        badge: "Certified & Licensed Platform",
        title_line1: "Your Trusted Platform",
        title_line2: "To Connect With",
        title_highlight: "Top Rated Lawyers",
        description: "A secure digital brokerage connecting clients with certified lawyers across Saudi Arabia with speed and transparency.",
        cta_text: "Submit Legal Request",
        cta_link: "/auth/sign-up/client/step-1",
        secondary_cta_text: "Browse Lawyers",
        secondary_cta_link: "/auth/sign-up",
      },
    },
  },
];

const STORAGE_KEY = "elwaseet_block_templates_storage_v7";

function loadTemplates(): BlockTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not load block templates from localStorage", e);
  }
  saveTemplates(INITIAL_BLOCK_TEMPLATES);
  return INITIAL_BLOCK_TEMPLATES;
}

function saveTemplates(templates: BlockTemplate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error("Failed to save block templates", e);
  }
}

export const blockTemplatesMockService = {
  getTemplates: async (category?: string): Promise<BlockTemplate[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const templates = loadTemplates();
        const filtered = category && category !== "all"
          ? templates.filter((t) => t.category === category)
          : templates;
        resolve(filtered);
      }, 150);
    });
  },

  getTemplateById: async (id: string): Promise<BlockTemplate | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const templates = loadTemplates();
        const found = templates.find((t) => t.id === id);
        resolve(found ? JSON.parse(JSON.stringify(found)) : null);
      }, 150);
    });
  },

  saveTemplate: async (data: Partial<BlockTemplate> & { id: string }): Promise<BlockTemplate> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const templates = loadTemplates();
        const index = templates.findIndex((t) => t.id === data.id);
        let target: BlockTemplate;

        if (index !== -1) {
          target = {
            ...templates[index],
            ...data,
            updated_at: new Date().toISOString(),
          } as BlockTemplate;
          templates[index] = target;
        } else {
          target = {
            id: data.id,
            name_ar: data.name_ar || "قالب بلوك جديد",
            name_en: data.name_en || "New Block Template",
            description_ar: data.description_ar || "",
            description_en: data.description_en || "",
            category: data.category || "content_media",
            icon: data.icon || "Sparkles",
            shape_tags: data.shape_tags || ["title", "description"],
            is_active: data.is_active ?? true,
            fields: data.fields || [
              { key: "title", label_ar: "العنوان", label_en: "Title", type: "text", required: true },
              { key: "description", label_ar: "الوصف", label_en: "Description", type: "textarea" },
            ],
            default_content: data.default_content || {
              ar: { title: "عنوان جديد", description: "وصف توضيحي" },
              en: { title: "New Title", description: "Description text" },
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          templates.push(target);
        }

        saveTemplates(templates);
        resolve(JSON.parse(JSON.stringify(target)));
      }, 200);
    });
  },

  toggleTemplateStatus: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const templates = loadTemplates();
        const target = templates.find((t) => t.id === id);
        if (target) {
          target.is_active = !target.is_active;
          saveTemplates(templates);
          resolve(target.is_active);
        } else {
          resolve(false);
        }
      }, 100);
    });
  },

  deleteTemplate: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const templates = loadTemplates();
        const filtered = templates.filter((t) => t.id !== id);
        saveTemplates(filtered);
        resolve(true);
      }, 150);
    });
  },

  resetDefaults: (): BlockTemplate[] => {
    saveTemplates(INITIAL_BLOCK_TEMPLATES);
    return INITIAL_BLOCK_TEMPLATES;
  },
};
