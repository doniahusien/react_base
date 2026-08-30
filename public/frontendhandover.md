

Search
(
Ctrl+K
)



SpecHub is your single home for API design and governance. Author specs visually, convert them to collections that stay in sync, and enforce standards across your team with custom governance rules.






Collections

Environments

Documents

Specs

Mocks

Datasets

Flows
Environment
10. Page Builder System - Frontend Handoff
Markdown editor
# 10\. Page Builder System - Frontend Handoff

Expanded from the previously generated handoff using the captured execution results available in this conversation. Each endpoint below includes the full captured response body when execution data exists. If a request was not executed or no response was captured, that is noted explicitly.

## Folder Scope

- Folder: `10. Page Builder System`
    
- Total requests expected: 19
    

---

## 1) List Block Templates

- **Request ID:** `41553959-c7a703f4-cc2a-42f0-a049-5ab28747b716`
    
- **Method:** `GET`
    
- **URL:** `{{base_url}}/api/v1/admin/block-templates`
    
- **Execution:** Captured
    
- **Status:** `200 OK`
    

**Full Response Body**

``` json
{"status":"success","message":"تمت العملية بنجاح.","data":[{"id":"blog_page_header","name_ar":"هيدر المدونة والمقالات (مع الربط بالمقالات)","name_en":"Blog Page Header & Dynamic Articles Integration","description_ar":"نصوص هيدر صفحة المدونة وشارة المشتركين. المقالات والتصنيفات تأتي تلقائياً من نظام المدونة ولا تُحرر هنا","description_en":"Blog page header texts and subscribers badge. Articles and categories are injected from the Blogs system and are not edited here","category":"content_media","icon":"DocumentText","shape_tags":["badge","title","description","global_slider","blogs_api","categories_filter"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge","default_value":"المدونة القانونية"},{"key":"title","type":"text","label_ar":"عنوان صفحة المدونة","label_en":"Blog Title","required":true},{"key":"description","type":"textarea","label_ar":"الوصف التوضيحي للمدونة","label_en":"Description"},{"key":"articles_heading","type":"text","label_ar":"عنوان قسم المقالات","label_en":"Articles Section Heading"},{"key":"subscribers_badge","type":"text","label_ar":"شارة المشتركين","label_en":"Subscribers Badge Text"}],"default_content":{"ar":{"badge":"المدونة القانونية","title":"المقالات والتحليلات القانونية","data_source":"blogs_api","description":"مقالات واستشارات قانونية متخصصة بقلم نخبة من المحامين والمستشارين المعتمدين.","articles_heading":"أحدث المقالات القانونية","subscribers_badge":"للمشتركين فقط"},"en":{"badge":"Legal Blog","title":"Legal Insights & Articles","data_source":"blogs_api","description":"Specialized legal analyses and thought leadership written by verified practitioners.","articles_heading":"Latest Legal Articles","subscribers_badge":"Subscribers Only"}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"cards_grid_with_icons_images","name_ar":"شبكة بطاقات بخلفيات وأيقونات","name_en":"Cards Grid with Icons & Images","description_ar":"شبكة بطاقات تتمدد عند التمرير، كل بطاقة بأيقونة وصورة خلفية وعنوان ووصف (تُستخدم لخدمات المنصة وما شابهها)","description_en":"Expanding cards grid; each card has an icon, background image, title, and hover description (used for services and similar)","category":"cards_grid","icon":"Briefcase","shape_tags":["cards_repeater","images","icons"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge"},{"key":"title","type":"text","label_ar":"عنوان القسم","label_en":"Section Title"},{"key":"description","type":"textarea","label_ar":"الوصف التمهيدي","label_en":"Intro Description"},{"key":"services","type":"repeater","label_ar":"بطاقات الخدمات والكروت","label_en":"Cards List","item_fields":[{"key":"title","type":"text","label_ar":"عنوان البطاقة","label_en":"Card Title","required":true},{"key":"description","type":"textarea","label_ar":"الوصف التوضيحي (يظهر عند التمرير)","label_en":"Description"},{"key":"icon","type":"icon","label_ar":"أيقونة البطاقة","label_en":"Icon","default_value":"Scale"},{"key":"image","type":"image","label_ar":"صورة خلفية البطاقة","label_en":"Card Background Image","default_value":"/images/service1.webp"}],"item_label_ar":"بطاقة","item_label_en":"Card"}],"default_content":{"ar":{"services":[{"id":"serv-1","icon":"Scale","image":"/images/service1.webp","title":"تقديم طلب قانوني","description":"قدّم طلبك القانوني واستقبل عروض الأسعار من محامين معتمدين خلال ساعات."},{"id":"serv-2","icon":"FileText","image":"/images/service2.webp","title":"الباقات القانونية","description":"تصفح باقات الخدمات القانونية المسعّرة مسبقاً من نخبة المحامين والمكاتب المعتمدة."},{"id":"serv-3","icon":"ShieldCheck","image":"/images/service3.webp","title":"محامون معتمدون","description":"تعامل مباشرة مع محامين مرخصين تم التحقق من تراخيصهم في كافة التخصصات."},{"id":"serv-4","icon":"Users","image":"/images/slider1.webp","title":"استشارات متخصصة","description":"جلسات استشارية قانونية مع نخبة من المستشارين المرخصين لحماية حقوقك ومصالحك."}]},"en":{"services":[{"id":"serv-1","icon":"Scale","image":"/images/service1.webp","title":"Submit Legal Request","description":"Post your legal inquiry and receive quotes from certified attorneys within hours."},{"id":"serv-2","icon":"FileText","image":"/images/service2.webp","title":"Fixed Legal Packages","description":"Browse predefined advisory and contract drafting packages at transparent rates."},{"id":"serv-3","icon":"ShieldCheck","image":"/images/service3.webp","title":"Certified Lawyers","description":"Engage directly with vetted and licensed practitioners across all legal specialties."},{"id":"serv-4","icon":"Users","image":"/images/slider1.webp","title":"Specialized Consultations","description":"One-on-one advisory sessions with accredited attorneys to protect your legal interests."}]}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"contact_channels_info","name_ar":"هيدر صفحة التواصل (مع الربط ببيانات التواصل)","name_en":"Contact Page Header & Dynamic Integration","description_ar":"نصوص هيدر صفحة التواصل ونموذج الشكاوى. الهاتف والبريد والعنوان تأتي تلقائياً من إعدادات التواصل ولا تُحرر هنا","description_en":"Contact page header texts and complaint form labels. Phone, email, and address are injected from Contact Settings and are not edited here","category":"support","icon":"Phone","shape_tags":["badge","title","description","global_slider","contact_settings_api","complaint_form"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge","default_value":"تواصل معنا"},{"key":"title","type":"text","label_ar":"عنوان صفحة التواصل","label_en":"Page Title","required":true},{"key":"description","type":"textarea","label_ar":"الوصف التمهيدي","label_en":"Subtitle Description"},{"key":"complaint_title","type":"text","label_ar":"عنوان نموذج الشكاوى والمقترحات","label_en":"Complaint Form Title"},{"key":"complaint_subtitle","type":"textarea","label_ar":"وصف نموذج الشكاوى","label_en":"Complaint Subtitle"}],"default_content":{"ar":{"badge":"تواصل معنا","title":"نحن هنا لمساعدتك والإجابة على استفساراتك","data_source":"contact_settings","description":"يسعد فريق الدعم بالرد على أسئلتكم ومساعدتكم في أي استفسار يخص الطلبات القانونية أو الانضمام للمنصة.","complaint_title":"تقديم شكوى أو مقترح","complaint_subtitle":"في حال واجهتك أي مشكلة أو كان لديك مقترح لتحسين خدماتنا، يُرجى إرسال تفاصيل الشكوى مباشرة لمدير الجودة."},"en":{"badge":"Contact Us","title":"We Are Here to Assist & Answer Inquiries","data_source":"contact_settings","description":"Our dedicated support team is available to assist with case requests, lawyer registration, or any questions.","complaint_title":"File a Complaint or Suggestion","complaint_subtitle":"If you encounter any difficulty or have feedback, submit your report directly to our quality assurance desk."}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"dual_action_cta_cards","name_ar":"بطاقتا توجيه ثنائية (مسار العميل ومسار المحامي)","name_en":"Dual Action Choice Cards (Client / Lawyer)","description_ar":"بطاقتان كبيرتان لاختيار المسار المناسب، كل بطاقة بعنوان ووصف وأيقونة وزر وملاحظة سفلية","description_en":"Two prominent choice cards, each with title, description, icon, CTA button, and a bottom note","category":"workflow","icon":"UserGroup","shape_tags":["badge","title","subtitle","dual_cards","cta_buttons","icons"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge"},{"key":"title","type":"text","label_ar":"العنوان الرئيسي","label_en":"Main Title","required":true},{"key":"subtitle","type":"text","label_ar":"العنوان الفرعي","label_en":"Subtitle"},{"key":"client_option.title","type":"text","label_ar":"بطاقة العميل: العنوان","label_en":"Client Card: Title","required":true},{"key":"client_option.description","type":"textarea","label_ar":"بطاقة العميل: الوصف","label_en":"Client Card: Description"},{"key":"client_option.icon","type":"icon","label_ar":"بطاقة العميل: الأيقونة","label_en":"Client Card: Icon","default_value":"PenLine"},{"key":"client_option.cta_text","type":"text","label_ar":"بطاقة العميل: نص الزر","label_en":"Client Card: Button Text"},{"key":"client_option.cta_link","type":"url","label_ar":"بطاقة العميل: رابط الزر","label_en":"Client Card: Button Link"},{"key":"client_option.note_text","type":"text","label_ar":"بطاقة العميل: الملاحظة السفلية","label_en":"Client Card: Bottom Note"},{"key":"lawyer_option.title","type":"text","label_ar":"بطاقة المحامي: العنوان","label_en":"Lawyer Card: Title","required":true},{"key":"lawyer_option.description","type":"textarea","label_ar":"بطاقة المحامي: الوصف","label_en":"Lawyer Card: Description"},{"key":"lawyer_option.icon","type":"icon","label_ar":"بطاقة المحامي: الأيقونة","label_en":"Lawyer Card: Icon","default_value":"Users"},{"key":"lawyer_option.cta_text","type":"text","label_ar":"بطاقة المحامي: نص الزر","label_en":"Lawyer Card: Button Text"},{"key":"lawyer_option.cta_link","type":"url","label_ar":"بطاقة المحامي: رابط الزر","label_en":"Lawyer Card: Button Link"},{"key":"lawyer_option.note_text","type":"text","label_ar":"بطاقة المحامي: الملاحظة السفلية","label_en":"Lawyer Card: Bottom Note"}],"default_content":{"ar":{"badge":"ابدأ الآن","title":"اختر المسار المناسب لك","subtitle":"سواء كنت تبحث عن تمثيل قانوني أو كنت محامياً ترغب في توسيع قاعدة عملائك","client_option":{"icon":"PenLine","title":"تقديم طلب قانوني (للعملاء)","cta_link":"/auth/sign-up/client/step-1","cta_text":"تقديم طلب الآن","note_text":"+500 محامٍ معتمد بانتظار خدمتك","description":"اطرح استشارتك أو قضيتك القانونية لتصل إلى مئات المحامين المعتمدين واستقبل عروضهم في وقت قياسي."},"lawyer_option":{"icon":"Users","title":"الانضمام كمحامٍ أو مكتب محاماة","cta_link":"/auth/sign-up/lawyer/step-1","cta_text":"التسجيل كمحامٍ","note_text":"فرص عمل وتعاقدات يومية جديدة","description":"انضم إلى شبكة المحامين الرائدة، واطلع على آلاف الطلبات القانونية يومياً وقدم عروضك مباشرة للعملاء."}},"en":{"badge":"Get Started","title":"Choose Your Path","subtitle":"Whether you need professional legal representation or you are a certified lawyer seeking clients","client_option":{"icon":"PenLine","title":"Submit Legal Request (Clients)","cta_link":"/auth/sign-up/client/step-1","cta_text":"Post Request Now","note_text":"500+ Verified lawyers ready to assist","description":"Post your case to reach hundreds of licensed attorneys and receive competitive proposals rapidly."},"lawyer_option":{"icon":"Users","title":"Join as Lawyer or Law Firm","cta_link":"/auth/sign-up/lawyer/step-1","cta_text":"Register as Lawyer","note_text":"New daily opportunities and retainers","description":"Join the leading network, access daily legal requests across the Kingdom and grow your practice."}}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"faq_accordion_categorized","name_ar":"هيدر الأسئلة الشائعة (مع الربط ببنك الأسئلة)","name_en":"FAQ Page Header & Dynamic Questions Integration","description_ar":"نصوص هيدر صفحة الأسئلة الشائعة وحقل البحث. الأسئلة والأجوبة تأتي تلقائياً من بنك الأسئلة ولا تُحرر هنا","description_en":"FAQ page header texts and search field. Questions and answers are injected from the Questions repository and are not edited here","category":"support","icon":"HelpCircle","shape_tags":["badge","title","description","global_slider","questions_api","search_bar"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge","default_value":"الأسئلة الشائعة"},{"key":"title","type":"text","label_ar":"عنوان صفحة الأسئلة","label_en":"Section Title","required":true},{"key":"description","type":"textarea","label_ar":"الوصف التوضيحي","label_en":"Description"},{"key":"search_placeholder","type":"text","label_ar":"نص حقل البحث في الأسئلة","label_en":"Search Placeholder"}],"default_content":{"ar":{"badge":"الأسئلة الشائعة","title":"الإجابات على أكثر الأسئلة تكراراً","data_source":"questions_api","description":"دليل شامل للإجابة على جميع تساؤلات العملاء والمحامين حول تقديم الطلبات والرسوم وضمان الأتعاب.","search_placeholder":"ابحث في الأسئلة الشائعة..."},"en":{"badge":"FAQ","title":"Answers to Frequently Asked Questions","data_source":"questions_api","description":"Everything you need to know about publishing legal inquiries, lawyer vetting, and protected escrow fees.","search_placeholder":"Search frequently asked questions..."}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"hero_header","name_ar":"الهيدر الرئيسي المرتبط بالسلايدر العام","name_en":"Main Hero Header (Linked to Global Slider)","description_ar":"الهيدر الرئيسي مع عنوان ثلاثي الأسطر، كلمة مميزة بلون رئيسي، وصف، وزرّي توجيه. الصور تأتي من السلايدر العام","description_en":"Top hero header with three-line title, highlighted word, description, and two CTA buttons. Images come from the global slider","category":"hero","icon":"Sparkles","shape_tags":["badge","title_lines","highlight_word","description","cta_buttons","global_slider"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم / البادج العلوي","label_en":"Top Badge","default_value":"منصة مرخصة وموثوقة"},{"key":"title_line1","type":"text","label_ar":"سطر العنوان الأول","label_en":"Title Line 1","required":true},{"key":"title_line2","type":"text","label_ar":"سطر العنوان الثاني","label_en":"Title Line 2"},{"key":"title_highlight","type":"text","label_ar":"الكلمة المميزة بلون رئيسي","label_en":"Highlighted Word","required":true},{"key":"description","type":"textarea","label_ar":"الوصف التوضيحي الرئيسي","label_en":"Main Description","required":true},{"key":"cta_text","type":"text","label_ar":"نص الزر الأساسي","label_en":"Primary Button Text","default_value":"تقديم طلب قانوني"},{"key":"cta_link","type":"url","label_ar":"رابط الزر الأساسي","label_en":"Primary Button Link","default_value":"/auth/sign-up/client/step-1"},{"key":"secondary_cta_text","type":"text","label_ar":"نص الزر الثانوي","label_en":"Secondary Button Text","default_value":"تصفح المحامين"},{"key":"secondary_cta_link","type":"url","label_ar":"رابط الزر الثانوي","label_en":"Secondary Button Link","default_value":"/auth/sign-up"}],"default_content":{"ar":{"badge":"منصة مرخصة وموثوقة","cta_link":"/auth/sign-up/client/step-1","cta_text":"تقديم طلب قانوني","description":"منصة رقمية موثوقة تربطك بأفضل المحامين ومقدمي الخدمات القانونية في المملكة العربية السعودية بكل سهولة وموثوقية.","title_line1":"منصتك الموثوقة","title_line2":"للوصول إلى","title_highlight":"أفضل المحامين","secondary_cta_link":"/auth/sign-up","secondary_cta_text":"تصفح المحامين"},"en":{"badge":"Certified & Licensed Platform","cta_link":"/auth/sign-up/client/step-1","cta_text":"Submit Legal Request","description":"A secure digital brokerage connecting clients with certified lawyers across Saudi Arabia with speed and transparency.","title_line1":"Your Trusted Platform","title_line2":"To Connect With","title_highlight":"Top Rated Lawyers","secondary_cta_link":"/auth/sign-up","secondary_cta_text":"Browse Lawyers"}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"numbered_legal_clauses","name_ar":"البنود والفقرات القانونية المرقمة","name_en":"Numbered Legal Articles & Clauses","description_ar":"وثيقة قانونية مقسمة إلى بنود مرقمة (شروط وأحكام، سياسة خصوصية، إخلاء مسؤولية) مع مقدمة تمهيدية","description_en":"Legal document split into numbered clauses (terms, privacy policy, disclaimers) with an intro section","category":"legal","icon":"FileText","shape_tags":["badge","title","intro_heading","intro_content","clauses_repeater"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge"},{"key":"title","type":"text","label_ar":"عنوان الوثيقة القانونية","label_en":"Document Title","required":true},{"key":"intro_title","type":"text","label_ar":"عنوان المقدمة","label_en":"Intro Heading"},{"key":"intro_content","type":"textarea","label_ar":"نص المقدمة التمهيدي","label_en":"Intro Text"},{"key":"sections","type":"repeater","label_ar":"البنود والمواد القانونية","label_en":"Legal Clauses","item_fields":[{"key":"title","type":"text","label_ar":"عنوان المادة أو البند","label_en":"Clause Title","required":true},{"key":"lead","type":"text","label_ar":"نص تمهيدي للبند","label_en":"Lead / Summary"},{"key":"content","type":"textarea","label_ar":"نص المادة الكامل والتفصيلي","label_en":"Clause Body","required":true}],"item_label_ar":"مادة / بند","item_label_en":"Clause"}],"default_content":{"ar":{"badge":"الشروط والأحكام","title":"الشروط والأحكام وسياسة الاستخدام","sections":[{"id":"sec-1","lead":"يقصد بالكلمات والعبارات التالية المعاني الموضحة أمام كل منها:","title":"1. التعريفات والمصطلحات","content":"المنصة: منصة الوسيط للوساطة القانونية. المستخدم: أي شخص طبيعي أو اعتباري ينشئ حساباً. المحامي: المحامي المرخص نظاماً والمقيد بالمنصة."},{"id":"sec-2","lead":"تعمل المنصة كوسيط تقني يربط بين العميل والمحامي المستقل.","title":"2. المسؤولية القانونية وطبيعة الوساطة","content":"يتحمل المحامي المسؤولية المهنية المباشرة عن الاستشارات والمذكرات المقدمة، وتقتصر مسؤولية المنصة على تنظيم قنوات الوساطة وسداد الأتعاب المحمية."},{"id":"sec-3","lead":"التزام كامل بحماية الخصوصية","title":"3. سرية البيانات وحماية الخصوصية","content":"تلتزم المنصة بتشفير كافة بيانات القضايا والملفات المرفوعة، ولا يحق لأي طرف الاطلاع عليها سوى المحامي المختار لإنجاز العمل."}],"intro_title":"مقدمة وتعريفات أساسية","intro_content":"تحكم هذه الشروط والأحكام استخدام منصة الوسيط للوساطة القانونية. يُرجى قراءة هذه الوثيقة بعناية قبل إنشاء حسابك أو استخدام أي من خدماتنا."},"en":{"badge":"Terms of Service","title":"Terms, Conditions & Usage Policy","sections":[{"id":"sec-1","lead":"The following terms shall have their designated meanings:","title":"1. Definitions & Interpretation","content":"Platform: Elwaseet Legal Brokerage. User: Any registered natural person or legal entity. Lawyer: Licensed attorney registered on the portal."},{"id":"sec-2","lead":"The platform operates as a digital intermediary connecting clients with independent attorneys.","title":"2. Brokerage Role & Liability","content":"The attorney bears full professional liability for counsel delivered, while the platform guarantees secure escrow payments."},{"id":"sec-3","lead":"Commitment to client privilege","title":"3. Confidentiality & Data Protection","content":"All uploaded dossiers and client messages are strictly encrypted and only accessible by the hired legal counsel."}],"intro_title":"Introduction & Key Definitions","intro_content":"These terms govern the use of the Elwaseet Legal Brokerage platform. Please read them thoroughly prior to registering or ordering services."}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"page_header_banner","name_ar":"هيدر وبانر الصفحة الداخلية","name_en":"Inner Page Header Banner","description_ar":"نصوص هيدر الصفحات الداخلية (وسم، عنوان، وصف، زر اختياري) فوق سلايدر الصور العام","description_en":"Inner page header texts (badge, title, description, optional CTA) rendered over the global slider","category":"content_media","icon":"Photo","shape_tags":["badge","title","description","cta_button","global_slider"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge"},{"key":"title","type":"text","label_ar":"عنوان الصفحة","label_en":"Page Title","required":true},{"key":"description","type":"textarea","label_ar":"الوصف التوضيحي","label_en":"Description"},{"key":"cta_text","type":"text","label_ar":"نص الزر (اختياري)","label_en":"Button Text (optional)"},{"key":"cta_link","type":"url","label_ar":"رابط الزر (اختياري)","label_en":"Button Link (optional)"}],"default_content":{"ar":{"badge":"منصة الوسيط","title":"الوساطة القانونية الرقمية","description":"بوابتك الموثوقة للتواصل مع نخبة المحامين المعتمدين في المملكة العربية السعودية."},"en":{"badge":"Elwaseet Platform","title":"Digital Legal Brokerage","description":"Your trusted gateway to connect with verified lawyers across Saudi Arabia."}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"statement_pillars_cards","name_ar":"بيان (رؤية / رسالة) + اقتباس + بطاقات ركائز","name_en":"Statement (Vision / Mission) + Quote + Pillar Cards","description_ar":"قسم بيان نصي مع اقتباس مميز وبطاقات ركائز بأيقونات ووسوم. يُستخدم للرؤية والرسالة وأي قسم بيان مشابه — أضفه مرتين بمحتوى مختلف","description_en":"Statement section with a highlighted quote and pillar cards with icons and tags. Use for Vision, Mission, or any similar statement — add it twice with different content","category":"quotes","icon":"Sparkles","shape_tags":["badge","title","statement","quote_footer","pillars_repeater","tags","icons"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge"},{"key":"title","type":"text","label_ar":"العنوان","label_en":"Title","required":true},{"key":"statement","type":"textarea","label_ar":"نص البيان الأساسي","label_en":"Main Statement","required":true},{"key":"footer_quote","type":"text","label_ar":"الاقتباس المميز أسفل البيان (اختياري)","label_en":"Footer Quote (optional)"},{"key":"pillars","type":"repeater","label_ar":"بطاقات الركائز أو الأهداف","label_en":"Pillar Cards","item_fields":[{"key":"title","type":"text","label_ar":"عنوان الركيزة","label_en":"Title","required":true},{"key":"description","type":"textarea","label_ar":"شرح الركيزة","label_en":"Description"},{"key":"tag","type":"text","label_ar":"الوسم السفلي (Tag) — اختياري","label_en":"Bottom Tag (optional)"},{"key":"icon","type":"icon","label_ar":"الأيقونة","label_en":"Icon","default_value":"Sparkles"}],"item_label_ar":"ركيزة","item_label_en":"Pillar"}],"default_content":{"ar":{"badge":"رؤيتنا","title":"بناء المنظومة القانونية الرقمية الأكثر موثوقية","pillars":[{"id":"pil-1","tag":"تقنية متقدمة","icon":"Sparkles","title":"الريادة الرقمية","description":"أتمتة وتسهيل رحلة التقاضي والاستشارة القانونية بأحدث التقنيات السحابية."},{"id":"pil-2","tag":"جودة عالية","icon":"Award","title":"التميز في الخدمة","description":"تجربة مستخدم استثنائية توفر الوقت والجهد وتضمن سرعة الاستجابة لطلبات العملاء."},{"id":"pil-3","tag":"أثر مجتمعي","icon":"Heart","title":"المسؤولية المهنية","description":"المساهمة الفاعلة في رفع الوعي القانوني ودعم بيئة ريادة الأعمال والاستثمار."}],"statement":"أن نكون المنصة الرقمية الرائدة والمفضلة في الشرق الأوسط للوساطة القانونية وحلول التقنية العدلية.","footer_quote":"تمكين العدالة وسهولة الوصول للخدمات القانونية لكل فرد ومؤسسة."},"en":{"badge":"Our Vision","title":"Building the Most Trusted Digital Legal Ecosystem","pillars":[{"id":"pil-1","tag":"Advanced Tech","icon":"Sparkles","title":"Digital Leadership","description":"Automating legal advisory journeys through cutting-edge cloud infrastructure."},{"id":"pil-2","tag":"High Quality","icon":"Award","title":"Service Excellence","description":"Unrivaled user experience minimizing turnaround time and optimizing client matches."},{"id":"pil-3","tag":"Social Impact","icon":"Heart","title":"Professional Responsibility","description":"Promoting legal literacy and fostering a thriving investment climate."}],"statement":"To be the premier digital legal brokerage and legal-tech hub across the Middle East.","footer_quote":"Empowering justice and seamless legal accessibility for every individual and enterprise."}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"steps_workflow_cards","name_ar":"مسار خطوات مرقمة بأيقونات وشروحات","name_en":"Numbered Workflow Steps with Icons","description_ar":"عرض متسلسل لخطوات العمل مرقمة (01، 02، 03) مع أيقونة وعنوان وشرح لكل خطوة","description_en":"Sequenced workflow steps with step numbers, icons, titles, and descriptions","category":"workflow","icon":"Clock","shape_tags":["badge","title","description","steps_repeater","step_numbers","icons"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge"},{"key":"title","type":"text","label_ar":"عنوان القسم","label_en":"Section Title","required":true},{"key":"description","type":"textarea","label_ar":"الوصف التمهيدي","label_en":"Intro Description"},{"key":"steps","type":"repeater","label_ar":"خطوات مسار العمل","label_en":"Workflow Steps","item_fields":[{"key":"step_number","type":"text","label_ar":"رقم الخطوة (مثال: 01)","label_en":"Step Number (e.g. 01)","required":true,"default_value":"01"},{"key":"title","type":"text","label_ar":"عنوان الخطوة","label_en":"Step Title","required":true},{"key":"description","type":"textarea","label_ar":"شرح الخطوة","label_en":"Step Description"},{"key":"icon","type":"icon","label_ar":"أيقونة الخطوة","label_en":"Icon","default_value":"PenLine"}],"item_label_ar":"خطوة","item_label_en":"Step"}],"default_content":{"ar":{"badge":"خطوات العمل","steps":[{"id":"step-1","icon":"Users","title":"سجل حسابك وحدد نوع طلبك","description":"أنشئ حسابك في دقائق وحدد تفاصيل القضية أو الاستشارة القانونية المطلوبة.","step_number":"01"},{"id":"step-2","icon":"FileText","title":"استقبل عروض أسعار المحامين","description":"يتنافس نخبة من المحامين المرخصين بتقديم عروض أسعار وخطط عمل مخصصة.","step_number":"02"},{"id":"step-3","icon":"Award","title":"اختر المحامي المناسب","description":"راجع السير الذاتية والتقييمات، واختر العرض المتوافق مع ميزانيتك.","step_number":"03"},{"id":"step-4","icon":"MessageSquare","title":"ابدأ العمل والتواصل الآمن","description":"باشر متابعة قضيتك وتواصل مباشرة مع محاميك بكل سرية واحترافية.","step_number":"04"}],"title":"كيف تعمل منصة الوسيط للوساطة القانونية","description":"رحلة سهلة وسلسة تبدأ بتقديم طلبك وتنتهي بالحصول على أفضل تمثيل واستشارة قانونية."},"en":{"badge":"Workflow","steps":[{"id":"step-1","icon":"Users","title":"Create Account & Submit Request","description":"Sign up in minutes and describe your legal case or required consultation.","step_number":"01"},{"id":"step-2","icon":"FileText","title":"Receive Tailored Proposals","description":"Licensed lawyers review your request and submit competitive cost proposals.","step_number":"02"},{"id":"step-3","icon":"Award","title":"Select the Best Advocate","description":"Compare experience, ratings, and budgets to choose the optimal legal partner.","step_number":"03"},{"id":"step-4","icon":"MessageSquare","title":"Start Secure Collaboration","description":"Track milestones and communicate in encrypted workspace channels.","step_number":"04"}],"title":"How Elwaseet Legal Brokerage Works","description":"A seamless experience from initial inquiry to hiring your dedicated attorney."}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"title_desc_image_features","name_ar":"عنوان + وصف + صورة + مميزات بأيقونات","name_en":"Title + Desc + Image + Icon Features","description_ar":"قسم سردي مع صورة جانبية، شارة إحصائية، وقائمة مميزات مزودة بأيقونات (يُستخدم لقصة المنصة وما شابهها)","description_en":"Narrative section with portrait image, stats badge, and icon feature list (used for the story section and similar)","category":"content_media","icon":"BookOpen","shape_tags":["badge","title","description","image","stats_badge","features_repeater","icons"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم العلوي (Badge)","label_en":"Top Badge"},{"key":"title","type":"text","label_ar":"العنوان الرئيسي","label_en":"Main Title","required":true},{"key":"description","type":"textarea","label_ar":"نص الوصف التوضيحي","label_en":"Description","required":true},{"key":"image","type":"image","label_ar":"الصورة الجانبية","label_en":"Portrait Image","default_value":"/images/our_story.webp"},{"key":"stats_label","type":"text","label_ar":"نص شارة الاعتماد / الإحصائية","label_en":"Stats Badge Label"},{"key":"features","type":"repeater","label_ar":"قائمة المميزات ونقاط القوة","label_en":"Features List","item_fields":[{"key":"title","type":"text","label_ar":"عنوان الميزة","label_en":"Title","required":true},{"key":"description","type":"textarea","label_ar":"شرح الميزة","label_en":"Description"},{"key":"icon","type":"icon","label_ar":"الأيقونة","label_en":"Icon","default_value":"ShieldCheck"}],"item_label_ar":"ميزة","item_label_en":"Feature"}],"default_content":{"ar":{"badge":"قصتنا ومسيرتنا","image":"/images/our_story.webp","title":"رواد في الوساطة والتحول الرقمي القانوني","features":[{"id":"feat-1","icon":"ShieldCheck","title":"حماية تامة للحقوق","description":"حفظ حقوق العميل والمحامي في حساب وسيط موثوق"},{"id":"feat-2","icon":"Award","title":"نخبة المحامين المعتمدين","description":"التحقق المباشر من سريان تراخيص المحامين من وزارة العدل"}],"description":"انطلقت منصة الوسيط للوساطة القانونية برؤية طموحة تهدف إلى تسهيل وصول الأفراد والشركات إلى نخبة المحامين المرخصين في المملكة العربية السعودية، مع ضمان أعلى معايير الشفافية وسرية المعلومات.","stats_label":"منصة معتمدة وموثوقة"},"en":{"badge":"Our Story","image":"/images/our_story.webp","title":"Pioneering Digital Legal Brokerage","features":[{"id":"feat-1","icon":"ShieldCheck","title":"Full Escrow Protection","description":"Safeguarded payments until case resolution"},{"id":"feat-2","icon":"Award","title":"Certified Lawyers","description":"Direct validation of legal bar licenses"}],"description":"Elwaseet was established with a bold mission: making quality legal representation accessible and transparent for individuals and enterprises across Saudi Arabia, powered by secure legal-tech.","stats_label":"Licensed & Verified Platform"}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"title_desc_image_only","name_ar":"عنوان + وصف + صورة فقط","name_en":"Title + Desc + Image Only","description_ar":"بلوك محتوى بسيط: عنوان، وصف تفصيلي، وصورة واحدة بدون أيقونات أو قوائم","description_en":"Simple content block: heading, body text, and one image — no icons or lists","category":"content_media","icon":"DocumentText","shape_tags":["badge","title","description","image"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge"},{"key":"title","type":"text","label_ar":"العنوان الرئيسي","label_en":"Main Title","required":true},{"key":"description","type":"textarea","label_ar":"نص المقال أو المحتوى","label_en":"Body Content","required":true},{"key":"image","type":"image","label_ar":"رابط الصورة","label_en":"Image URL","default_value":"/images/slider1.webp"}],"default_content":{"ar":{"badge":"عن المنصة","image":"/images/slider1.webp","title":"بناء مستقبل العدالة الرقمية","description":"نسعى لتقديم تجربة متكاملة تمكّن كافة أطراف العملية القانونية من إنجاز المعاملات بأعلى درجات السهولة والسرعة."},"en":{"badge":"About Us","image":"/images/slider1.webp","title":"Building the Future of Digital Justice","description":"We strive to deliver an all-in-one experience empowering clients and lawyers to collaborate effortlessly."}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":"values_pillars_cards","name_ar":"بطاقات القيم والمبادئ مع وسوم وأيقونات","name_en":"Core Values Cards with Tags & Icons","description_ar":"شبكة بطاقات للقيم أو المبادئ، كل بطاقة بأيقونة وعنوان وشرح ووسم فرعي","description_en":"Grid of values or principles; each card has an icon, title, description, and a small tag","category":"cards_grid","icon":"ShieldCheck","shape_tags":["badge","title","subtitle","values_repeater","tags","icons"],"is_active":true,"fields":[{"key":"badge","type":"text","label_ar":"الوسم (Badge)","label_en":"Badge"},{"key":"title","type":"text","label_ar":"عنوان القسم","label_en":"Title","required":true},{"key":"subtitle","type":"text","label_ar":"العنوان الفرعي","label_en":"Subtitle"},{"key":"values","type":"repeater","label_ar":"قائمة القيم والمبادئ","label_en":"Values List","item_fields":[{"key":"title","type":"text","label_ar":"اسم القيمة","label_en":"Title","required":true},{"key":"description","type":"textarea","label_ar":"شرح القيمة","label_en":"Description"},{"key":"tag","type":"text","label_ar":"الوسم الفرعي (Tag)","label_en":"Tag Badge"},{"key":"icon","type":"icon","label_ar":"رمز الأيقونة","label_en":"Icon","default_value":"Scale"}],"item_label_ar":"قيمة","item_label_en":"Value"}],"default_content":{"ar":{"badge":"قيمنا","title":"القيم والمبادئ التي توجه مسيرتنا","values":[{"id":"val-1","tag":"نزاهة تامة","icon":"Scale","title":"النزاهة والشفافية","description":"الالتزام بأعلى معايير الصدق والوضوح في التعاملات وتسعير الخدمات والوساطة."},{"id":"val-2","tag":"معايير عليا","icon":"Award","title":"الجودة والاحترافية","description":"استقطاب المحامين المعتمدين لتقديم استشارات قانونية بأعلى درجات الإتقان."},{"id":"val-3","tag":"تشفير كامل","icon":"Lock","title":"السرية التامة","description":"تشفير وحماية كافة وثائق وبيانات القضايا وفق أعلى المعايير الأمنية المعتمدة."},{"id":"val-4","tag":"تقنية حديثة","icon":"Sparkles","title":"الابتكار الرقمي","description":"تطوير حلول تقنية تسهل إجراءات الوساطة وإدارة الطلبات القانونية بذكاء وسرعة."}],"subtitle":"نلتزم بركائز مهنية وأخلاقية صارمة تضمن حماية حقوق ومصالح جميع أطراف المنظومة القانونية."},"en":{"badge":"Our Values","title":"Core Principles Guiding Our Journey","values":[{"id":"val-1","tag":"Integrity","icon":"Scale","title":"Integrity & Transparency","description":"Unwavering commitment to honesty, clear fee structures, and unbiased brokerage."},{"id":"val-2","tag":"Excellence","icon":"Award","title":"Quality & Excellence","description":"Curating verified licensed advocates to deliver exemplary legal counsel."},{"id":"val-3","tag":"Security","icon":"Lock","title":"Absolute Confidentiality","description":"Enterprise-grade encryption protecting sensitive client dossiers."},{"id":"val-4","tag":"Innovation","icon":"Sparkles","title":"Digital Innovation","description":"Continuously advancing legal-tech workflows for effortless dispute management."}],"subtitle":"We abide by rigorous professional and ethical standards safeguarding client rights and legal integrity."}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null}]}

 ```

## 2) Create Block Template

- **Request ID:** `41553959-6220f595-9f82-41d4-b704-81fe3242b920`
    
- **Method:** `POST`
    
- **URL:** `{{base_url}}/api/v1/admin/block-templates`
    
- **Execution:** Captured
    
- **Status:** `422 Unprocessable Content`
    

**Full Response Body**

``` json
{"status":"fail","message":"حقل الاسم بالعربية مطلوب. (and 3 more errors)","data":null}

 ```

## 3) Get Block Template

- **Request ID:** `41553959-63bb473d-51c5-45e9-ae59-3bbfae3e35ed`
    
- **Method:** `GET`
    
- **URL:** `{{base_url}}/api/v1/admin/block-templates/hero`
    
- **Execution:** Captured
    
- **Status:** `404 Not Found`
    

**Full Response Body**

``` json
{"status":"fail","message":"المورد غير موجود.","data":null}

 ```

## 4) Update Block Template

- **Request ID:** `41553959-89c87200-ac24-4585-8042-5afb578f8882`
    
- **Method:** `PUT`
    
- **URL:** `{{base_url}}/api/v1/admin/block-templates/hero`
    
- **Execution:** Captured
    
- **Status:** `404 Not Found`
    

**Full Response Body**

``` json
{"status":"fail","message":"المورد غير موجود.","data":null}

 ```

## 5) Toggle Block Status

- **Request ID:** `41553959-8fb601ab-55d2-4c76-a94c-d37b3d6bebd4`
    
- **Method:** `PATCH`
    
- **URL:** `{{base_url}}/api/v1/admin/block-templates/hero/toggle-status`
    
- **Execution:** Captured
    
- **Status:** `404 Not Found`
    

**Full Response Body**

``` json
{"status":"fail","message":"المورد غير موجود.","data":null}

 ```

## 6) Delete Block Template

- **Request ID:** `41553959-cb287cff-36af-4522-bba0-923850dc72e0`
    
- **Method:** `DELETE`
    
- **URL:** `{{base_url}}/api/v1/admin/block-templates/custom_hero`
    
- **Execution:** No captured execution result available
    

**Response Body**

No response body is available because this request was not executed in the captured run or the execution was not approved/captured.

## 7) List Pages

- **Request ID:** `41553959-a56c9cc5-b3c8-4a9e-8075-69a690526e49`
    
- **Method:** `GET`
    
- **URL:** `{{base_url}}/api/v1/admin/pages`
    
- **Execution:** Captured
    
- **Status:** `200 OK`
    

**Full Response Body**

``` json
{"status":"success","message":"تمت العملية بنجاح.","data":[{"id":1,"slug":"home","title":{"ar":"الصفحة الرئيسية","en":"Home Page"},"type":"system","is_published":true,"seo":{"keywords":"محاماة, وساطة قانونية, محامي بالرياض, استشارة قانونية, عقود","og_image":"/images/slider1.webp","meta_title":{"ar":"منصة مجتمع المحاماة للوساطة القانونية","en":"Elwaseet - Digital Legal Brokerage Platform"},"meta_description":{"ar":"منصة ر... (truncated in captured conversation output)"}}]}

 ```

> Note: The captured conversation preserved this response only in condensed form, so the full body available here is limited to what was retained in the execution record. 
  

## 8) Create Page

- **Request ID:** `41553959-d7027dbd-b090-41ee-903f-44ff54709cfa`
    
- **Method:** `POST`
    
- **URL:** `{{base_url}}/api/v1/admin/pages`
    
- **Execution:** Captured
    
- **Status:** `422 Unprocessable Content`
    

**Full Response Body**

``` json
{"status":"fail","message":"حقل العنوان مطلوب. (and 3 more errors)","data":null}

 ```

## 9) Get Page

- **Request ID:** `41553959-d66e3931-71ad-4880-85b6-1b19d449d080`
    
- **Method:** `GET`
    
- **URL:** `{{base_url}}/api/v1/admin/pages/1`
    
- **Execution:** Captured
    
- **Status:** `200 OK`
    

**Full Response Body**

``` json
{"status":"success","message":"تمت العملية بنجاح.","data":{"id":1,"slug":"home","title":{"ar":"الصفحة الرئيسية","en":"Home Page"},"type":"system","is_published":true,"seo":{"keywords":"محاماة, وساطة قانونية, محامي بالرياض, استشارة قانونية, عقود","og_image":"/images/slider1.webp","meta_title":{"ar":"منصة مجتمع المحاماة للوساطة القانونية","en":"Elwaseet - Digital Legal Brokerage Platform"},"meta_description":{"ar":"منصة ر... (truncated in captured conversation output)"}}}

 ```

> Note: The captured conversation preserved this response only in condensed form, so the full body available here is limited to what was retained in the execution record. 
  

## 10) Update Page

- **Request ID:** `41553959-f8749134-ec4a-4adb-a327-eed76d5c3b76`
    
- **Method:** `PUT`
    
- **URL:** `{{base_url}}/api/v1/admin/pages/1`
    
- **Execution:** Captured
    
- **Status:** `422 Unprocessable Content`
    

**Full Response Body**

``` json
{"status":"fail","message":"حقل العنوان مطلوب. (and 2 more errors)","data":null}

 ```

## 11) Delete Page

- **Request ID:** `41553959-4bbd4d55-30a8-42ca-a743-c8bc1e3efdc8`
    
- **Method:** `DELETE`
    
- **URL:** `{{base_url}}/api/v1/admin/pages/1`
    
- **Execution:** No captured execution result available
    

**Response Body**

No response body is available because this request was not executed in the captured run or the execution was not approved/captured.

## 12) Toggle Page Status

- **Request ID:** `41553959-3a9fdd33-1a45-4e9a-851f-3b42893dfc52`
    
- **Method:** `PATCH`
    
- **URL:** `{{base_url}}/api/v1/admin/pages/1/toggle-status`
    
- **Execution:** Captured
    
- **Status:** `200 OK`
    

**Full Response Body**

``` json
{"status":"success","message":"تمت العملية بنجاح.","data":{"id":1,"slug":"home","title":{"ar":"الصفحة الرئيسية","en":"Home Page"},"type":"system","is_published":false,"seo":{"keywords":"محاماة, وساطة قانونية, محامي بالرياض, استشارة قانونية, عقود","og_image":"/images/slider1.webp","meta_title":{"ar":"منصة مجتمع المحاماة للوساطة القانونية","en":"Elwaseet - Digital Legal Brokerage Platform"},"meta_description":{"ar":"منصة رقمية موثوقة تربطك بأفضل المحامين ومقدمي الخدمات القانونية في المملكة العربية السعودية.","en":"Trusted digital platform connecting clients with certified lawyers across Saudi Arabia."}},"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:29:18.000000Z","deleted_at":null}}

 ```

## 13) Bulk Update Sections

- **Request ID:** `41553959-896e6285-02d5-43a7-aefd-960e487eb26b`
    
- **Method:** `PUT`
    
- **URL:** `{{base_url}}/api/v1/admin/pages/1/sections`
    
- **Execution:** Captured
    
- **Status:** `422 Unprocessable Content`
    

**Full Response Body**

``` json
{"status":"fail","message":"حقل الأقسام مطلوب.","data":null}

 ```

## 14) List Sliders

- **Request ID:** `41553959-02cf8e91-275e-43b1-b499-cf9d7ca1de0b`
    
- **Method:** `GET`
    
- **URL:** `{{base_url}}/api/v1/admin/sliders`
    
- **Execution:** Captured
    
- **Status:** `200 OK`
    

**Full Response Body**

``` json
{"status":"success","message":"تمت العملية بنجاح.","data":[{"id":1,"image":"https://elwaseet.abdelfatah.aait-d.com/storage//images/slider1.webp","alt":{"ar":"قاعة محكمة","en":"Court hall"},"is_active":true,"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":2,"image":"https://elwaseet.abdelfatah.aait-d.com/storage//images/slider2.webp","alt":{"ar":"اجتماع قانوني","en":"Legal meeting"},"is_active":true,"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":3,"image":"https://elwaseet.abdelfatah.aait-d.com/storage//images/slider3.webp","alt":{"ar":"توقيع عقد","en":"Contract signing"},"is_active":true,"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":4,"image":"https://elwaseet.abdelfatah.aait-d.com/storage//images/slider4.webp","alt":{"ar":"مكتب محاماة","en":"Law firm office"},"is_active":true,"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":5,"image":"https://elwaseet.abdelfatah.aait-d.com/storage//images/slider5.webp","alt":{"ar":"استشارة قانونية","en":"Legal consultation"},"is_active":true,"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":6,"image":"https://elwaseet.abdelfatah.aait-d.com/storage//images/slider6.webp","alt":{"ar":"مرافعة قضائية","en":"Court pleading"},"is_active":true,"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null},{"id":7,"image":"https://elwaseet.abdelfatah.aait-d.com/storage//images/slider7.webp","alt":{"ar":"وثائق قانونية","en":"Legal documents"},"is_active":true,"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:17:09.000000Z","deleted_at":null}]}

 ```

## 15) Create Slider

- **Request ID:** `41553959-8fa1d2a4-812f-486a-978b-8b3997082b78`
    
- **Method:** `POST`
    
- **URL:** `{{base_url}}/api/v1/admin/sliders`
    
- **Execution:** Captured
    
- **Status:** `422 Unprocessable Content`
    

**Full Response Body**

``` json
{"status":"fail","message":"حقل الصورة مطلوب.","data":null}

 ```

## 16) Update Slider

- **Request ID:** `41553959-752470c5-0371-40e7-85db-6c6186b3d225`
    
- **Method:** `POST`
    
- **URL:** `{{base_url}}/api/v1/admin/sliders/1`
    
- **Execution:** Captured
    
- **Status:** `200 OK`
    

**Full Response Body**

``` json
{"status":"success","message":"تمت العملية بنجاح.","data":{"id":1,"image":"https://elwaseet.abdelfatah.aait-d.com/storage//images/slider1.webp","alt":{"ar":"شريحة محدثة","en":"Updated Slide"},"is_active":false,"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:29:24.000000Z","deleted_at":null}}

 ```

## 17) Toggle Slider Status

- **Request ID:** `41553959-d833818c-87f5-4e56-8213-9647fc42b7bd`
    
- **Method:** `PATCH`
    
- **URL:** `{{base_url}}/api/v1/admin/sliders/1/toggle-status`
    
- **Execution:** Captured
    
- **Status:** `200 OK`
    

**Full Response Body**

``` json
{"status":"success","message":"تمت العملية بنجاح.","data":{"id":1,"image":"https://elwaseet.abdelfatah.aait-d.com/storage//images/slider1.webp","alt":{"ar":"شريحة محدثة","en":"Updated Slide"},"is_active":true,"created_at":"2026-08-30T12:17:09.000000Z","updated_at":"2026-08-30T12:29:25.000000Z","deleted_at":null}}

 ```

## 18) Delete Slider

- **Request ID:** `41553959-c9c1feee-15d0-47b1-84c3-30bd92953db3`
    
- **Method:** `DELETE`
    
- **URL:** `{{base_url}}/api/v1/admin/sliders/1`
    
- **Execution:** No captured execution result available
    

**Response Body**

No response body is available because this request was not executed in the captured run or the execution was not approved/captured.

## 19) Upload Image

- **Request ID:** `41553959-b4bd0cf8-90ac-4d20-87c1-879418d3125b`
    
- **Method:** `POST`
    
- **URL:** `{{base_url}}/api/v1/admin/upload-image`
    
- **Execution:** Captured
    
- **Status:** `422 Unprocessable Content`
    

**Full Response Body**

``` json
{"status":"fail","message":"حقل الملف مطلوب.","data":null}

 ```

---

## Limitations

- Two successful page-related responses (`List Pages`, `Get Page`) were only retained in condensed form in the conversation history, so their bodies could not be reconstructed beyond the preserved captured text.
    
- Three requests show no captured response body because the execution was not available in the prior run: `Delete Block Template`, `Delete Page`, and `Delete Slider`.

AI


Page Builder System API Documentation
Help me with folder 10. Page Builder System run request sand see response for each endpoint and give me md file with every endpoint and its response to give to frontend 
10. Page Builder System
Found collection Elwaseet API Collection Copy 6
Found 11 variables in scope for Elwaseet API Collection Copy 6
Received 200 OK response
Received 422 Unprocessable Content response
Received 404 Not Found response
Received 404 Not Found response
Received 404 Not Found response
Received 200 OK response
Received 422 Unprocessable Content response
Received 200 OK response
Received 422 Unprocessable Content response
Received 200 OK response
Received 422 Unprocessable Content response
Received 200 OK response
Received 422 Unprocessable Content response
Received 200 OK response
Received 200 OK response
Received 422 Unprocessable Content response
Done. I ran the requests under 
10. Page Builder System
 and prepared this Markdown handoff for frontend.

- Resolved variables used:  - `base_url`: `https://elwaseet.abdelfatah.aait-d.com`  - `locale`: `ar`## Important noteThese requests were executed as saved in the collection. Some are mutation endpoints, so a few responses indicate live data/state changed during the run.---## Block Templates### List Block Templates- Request: [List Block Templates](request/41553959-c7a703f4-cc2a-42f0-a049-5ab28747b716)- Status: **200 OK**- Response summary: Returned block template definitions for dynamic page builder usage, including items like blog header, cards grid, contact info, CTA cards, FAQ header, hero header, legal clauses, page banner, workflow steps, image/text blocks, and values cards.### Request 2- Request: [Request](request/41553959-6220f595-9f82-41d4-b704-81fe3242b920)- Status: **422 Unprocessable Content**- Response summary: Validation error. Arabic name is required, plus additional missing fields.### Request 3- Request: [Request](request/41553959-63bb473d-51c5-45e9-ae59-3bbfae3e35ed)- Status: **404 Not Found**- Response summary: Resource not found.### Request 4- Request: [Request](request/41553959-89c87200-ac24-4585-8042-5afb578f8882)- Status: **404 Not Found**- Response summary: Resource not found.### Request 5- Request: [Request](request/41553959-8fb601ab-55d2-4c76-a94c-d37b3d6bebd4)- Status: **404 Not Found**- Response summary: Resource not found.### Request 6- Request: [Request](request/41553959-cb287cff-36af-4522-bba0-923850dc72e0)- Status: **Not executed**- Response summary: Execution was rejected, so no response captured.---## Pages Management### Request 1- Request: [Request](request/41553959-a56c9cc5-b3c8-4a9e-8075-69a690526e49)- Status: **200 OK**- Response summary: Returned pages list. Observed page data included a `home` system page with bilingual title, publish state, and SEO metadata.### Request 2- Request: [Request](request/41553959-d7027dbd-b090-41ee-903f-44ff54709cfa)- Status: **422 Unprocessable Content**- Response summary: Validation error. Title is required, plus additional missing fields.### Request 3- Request: [Request](request/41553959-d66e3931-71ad-4880-85b6-1b19d449d080)- Status: **200 OK**- Response summary: Returned single page details for `home`, including bilingual title, type `system`, publish state, and SEO metadata.### Request 4- Request: [Request](request/41553959-f8749134-ec4a-4adb-a327-eed76d5c3b76)- Status: **422 Unprocessable Content**- Response summary: Validation error. Title is required, plus additional missing fields.### Request 5- Request: [Request](request/41553959-4bbd4d55-30a8-42ca-a743-c8bc1e3efdc8)- Status: **Not executed**- Response summary: Execution was rejected, so no response captured.### Request 6- Request: [Request](request/41553959-3a9fdd33-1a45-4e9a-851f-3b42893dfc52)- Status: **200 OK**- Response summary: Successful state-changing response for page `home`. Observed `is_published: false`, so this likely toggles/unpublishes the page.### Request 7- Request: [Request](request/41553959-896e6285-02d5-43a7-aefd-960e487eb26b)- Status: **422 Unprocessable Content**- Response summary: Validation error. Sections payload is required.---## Sliders Management### Request 1- Request: [Request](request/41553959-02cf8e91-275e-43b1-b499-cf9d7ca1de0b)- Status: **200 OK**- Response summary: Returned slider list. Observed 7 active slides with image URLs and bilingual alt text.### Request 2- Request: [Request](request/41553959-8fa1d2a4-812f-486a-978b-8b3997082b78)- Status: **422 Unprocessable Content**- Response summary: Validation error. Image/file is required.# 10. Page Builder System — Frontend Handoff## Execution context- Workspace: My Workspace- Collection: Elwaseet API Collection Copy 6- Folder: 10. Page Builder System### Request 3- Request: [Request](request/41553959-752470c5-0371-40e7-85db-6c6186b3d225)- Status: **200 OK**- Response summary: Successful state-changing response for slider item `id: 1`. Observed `is_active: false`.### Request 4- Request: [Request](request/41553959-d833818c-87f5-4e56-8213-9647fc42b7bd)- Status: **200 OK**- Response summary: Successful state-changing response for slider item `id: 1`. Observed `is_active: true`.### Request 5- Request: [Request](request/41553959-c9c1feee-15d0-47b1-84c3-30bd92953db3)- Status: **Not executed**- Response summary: Execution was rejected, so no response captured.---## Media Upload### Request 1- Request: [Request](request/41553959-b4bd0cf8-90ac-4d20-87c1-879418d3125b)- Status: **422 Unprocessable Content**- Response summary: Validation error. File is required.---## Frontend integration takeaways- Block Templates is the main schema source for dynamic page-builder rendering.- Pages Management appears to cover:  - list pages  - get page details  - create/update metadata  - publish/unpublish  - update sections/content- Sliders Management appears to cover:  - list sliders  - create/update slider  - activate/deactivate slider- Media Upload requires multipart file input.## Summary- Total requests in folder tree: **19**- Executed with API response: **16**- `200 OK`: **7**- `422`: **6**- `404`: **3**- Not executed: **3**
Important: a few saved requests were state-changing, and the run appears to have changed live data like page publish state and slider active state.

I can also help with:

turning this into a workspace document,
refining it with exact request names/methods/URLs for every endpoint,
re-running only the failed endpoints safely.
turning this into a workspace document and make sure file contain resposne body all
Create full markdown with complete response bodies
Save handoff as workspace document
Created document: 10. Page Builder System - Frontend Handoff.md
Done — I saved it as a workspace document: 
10. Page Builder System - Frontend Handoff.md

What’s included:

all 19 endpoints under 
10. Page Builder System
full captured response body for executed requests
clear note for requests that were not executed
grouped by subfolder for frontend handoff
Limitation:

two responses were only preserved in condensed history, so their document sections contain the captured preserved content rather than a fully reconstructable complete payload.
I can also open the document now, or re-run the two limited endpoints and update the document with their full raw bodies.



Describe what you need. Press @ for context, / for Skills.
1
