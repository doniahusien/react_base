# Elwaseet Legal Brokerage Page & Section Content API Specification

> Complete documentation and request/response contracts for the dynamic Page Content & Section Management system across Admin Dashboard (`elwaseet_dash`) and Public Client Website (`elwaset`).

**Base URL:** `{{base_url}}` (e.g., `https://api.elwaseet.sa`)

---

## Table of Contents
1. [Architecture & Database Schema](#1-architecture--database-schema)
2. [Block Types Catalog & Schemas (11 Verified Blocks)](#2-block-types-catalog--schemas-11-verified-blocks)
3. [Admin Endpoints (Dashboard)](#3-admin-endpoints-dashboard)
   - [List Pages](#1-list-pages)
   - [Create Page](#2-create-page)
   - [Get Page Details & Sections](#3-get-page-details--sections)
   - [Update Page Metadata & SEO](#4-update-page-metadata--seo)
   - [Delete Page](#5-delete-page)
   - [Toggle Page Publish Status](#6-toggle-page-publish-status)
   - [Save / Bulk Update Page Sections](#7-save--bulk-update-page-sections)
4. [Public / Guest Endpoints (Website)](#4-public--guest-endpoints-website)
   - [Get Page by Slug](#1-get-page-by-slug)
   - [List Public Pages](#2-list-public-pages)

---

## 1. Architecture & Database Schema

### Table: `pages`
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT`, `PK` | Unique Identifier |
| `slug` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL`, `INDEX` | URL slug (e.g. `home`, `about`, `contact`, `faq`, `terms`) |
| `title` | `JSON` | `NOT NULL` | Localized title: `{"ar": "...", "en": "..."}` |
| `type` | `ENUM('system', 'landing', 'custom', 'policy')` | `DEFAULT 'custom'` | System core pages cannot be deleted |
| `is_published` | `BOOLEAN` | `DEFAULT TRUE`, `INDEX` | Publish state |
| `seo` | `JSON` | `NULLABLE` | Meta tags, title, description, keywords, og_image |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation date |
| `updated_at` | `TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Last updated |

### Table: `page_sections`
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT`, `PK` | Section unique ID |
| `page_id` | `BIGINT UNSIGNED` | `FK -> pages(id)`, `CASCADE` | Parent page reference |
| `type` | `VARCHAR(60)` | `NOT NULL`, `INDEX` | Block type key (e.g., `home_header`, `home_services`) |
| `sort_order` | `INT` | `DEFAULT 0`, `INDEX` | Ascending order for page rendering |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Visibility toggle |
| `content` | `JSON` | `NOT NULL` | Localized content payload: `{"ar": { ... }, "en": { ... }}` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation date |
| `updated_at` | `TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Last update date |

---

## 2. Block Types Catalog & Schemas (11 Verified Blocks)

### 1. `home_header` (Hero Carousel)
> **Note on Slider integration:** Pages never store slider images. There is a single global pool of slider images managed in the Sliders CRUD (`/api/v1/admin/sliders`), and the backend attaches it as a plain `sliders` array to **every** page response. This block only stores the header texts and its two CTA buttons.

```json
{
  "badge": "منصة مرخصة وموثوقة",
  "title_line1": "منصتك الموثوقة",
  "title_line2": "للوصول إلى",
  "title_highlight": "أفضل المحامين",
  "description": "منصة رقمية موثوقة تربطك بأفضل المحامين ومقدمي الخدمات القانونية في المملكة العربية السعودية.",
  "cta_text": "تقديم طلب قانوني",
  "cta_link": "/auth/sign-up/client/step-1",
  "secondary_cta_text": "تصفح المحامين",
  "secondary_cta_link": "/auth/sign-up"
}
```

### 2. `home_services` (Platform Services Grid)
```json
{
  "badge": "خدماتنا",
  "title": "ماذا نقدم لك في منصة الوسيط",
  "description": "نوفر مجموعة شاملة من الخدمات القانونية المصممة لتلبية احتياجاتك الفردية والمهنية.",
  "services": [
    {
      "id": "serv-1",
      "title": "نشر طلبات قانونية",
      "description": "صف مشكلتك القانونية وارفع المستندات، واستقبل عروض أسعار من محامين مرخصين.",
      "icon": "PencilSquareIcon",
      "link": "/client/submit-request"
    }
  ]
}
```

### 3. `how_to_work` (Workflow Steps)
```json
{
  "badge": "خطوات العمل",
  "title": "كيف تعمل منصة الوسيط للوساطة القانونية",
  "description": "رحلة سهلة وسلسة تبدأ بتقديم طلبك وتنتهي بالحصول على أفضل استشارة قانونية.",
  "steps": [
    {
      "id": "step-1",
      "step_number": "01",
      "title": "سجل حسابك وحدد نوع طلبك",
      "description": "أنشئ حسابك في دقائق وحدد تفاصيل القضية أو الاستشارة القانونية المطلوبة.",
      "icon": "UserPlusIcon"
    }
  ]
}
```

### 4. `how_to_get_service` (Action Cards)
```json
{
  "badge": "ابدأ الآن",
  "title": "اختر المسار المناسب لك",
  "subtitle": "سواء كنت تبحث عن تمثيل قانوني أو كنت محامياً ترغب في توسيع عملائك",
  "client_option": {
    "title": "تقديم طلب قانوني (للعملاء)",
    "description": "اطرح استشارتك لتصل إلى مئات المحامين المعتمدين واستقبل عروضهم فوراً.",
    "cta_text": "تقديم طلب الآن",
    "cta_link": "/auth/sign-up/client/step-1",
    "note_text": "+500 محامٍ معتمد بانتظار خدمتك"
  },
  "lawyer_option": {
    "title": "الانضمام كمحامٍ أو مكتب محاماة",
    "description": "انضم إلى شبكة المحامين الرائدة واطلع على آلاف الطلبات القانونية يومياً.",
    "cta_text": "التسجيل كمحامٍ",
    "cta_link": "/auth/sign-up/lawyer/step-1",
    "note_text": "فرص عمل وتعاقدات يومية جديدة"
  }
}
```

### 5. `about_our_story` (Our Story)
```json
{
  "badge": "قصتنا",
  "title": "رواد في الوساطة والتحول الرقمي القانوني",
  "description": "انطلقت منصة الوسيط برؤية تهدف إلى تسهيل وصول الجميع لنخبة المحامين المرخصين.",
  "image": "/images/our_story.webp"
}
```

### 6. `about_values` (Core Values)
```json
{
  "badge": "قيمنا",
  "title": "القيم والمبادئ التي توجه مسيرتنا",
  "subtitle": "نلتزم بركائز مهنية وأخلاقية صارمة تضمن حماية حقوق جميع أطراف المنظومة.",
  "values": [
    {
      "id": "val-1",
      "title": "النزاهة والشفافية",
      "description": "الالتزام بأعلى معايير الصدق والوضوح في تسعير الخدمات والوساطة.",
      "icon": "ShieldCheckIcon"
    }
  ]
}
```

### 7. `about_vision` (Vision & Pillars)
```json
{
  "badge": "رؤيتنا",
  "title": "بناء المنظومة القانونية الرقمية الأكثر موثوقية",
  "statement": "أن نكون المنصة الرقمية الرائدة في الشرق الأوسط للوساطة القانونية والتقنية العدلية.",
  "footer_quote": "تمكين العدالة وسهولة الوصول للخدمات القانونية لكل فرد ومؤسسة.",
  "pillars": [
    {
      "id": "vis-1",
      "title": "الريادة الرقمية",
      "description": "أتمتة وتسهيل رحلة التقاضي والاستشارة القانونية بأحدث التقنيات.",
      "icon": "RocketLaunchIcon"
    }
  ]
}
```

### 8. `about_mission` (Mission & Objectives)
```json
{
  "badge": "رسالتنا",
  "title": "ربط العملاء بالخبرات القانونية بأعلى موثوقية",
  "statement": "توفير بيئة رقمية آمنة تتيح لأصحاب القضايا الوصول لأفضل الكفاءات القانونية.",
  "pillars": [
    {
      "id": "mis-1",
      "title": "التواصل الفعال",
      "description": "تسهيل قنوات الحوار والمتابعة المستمرة بين الموكل ومحاميه.",
      "tag": "تواصل دائم",
      "icon": "UsersIcon"
    }
  ]
}
```

### 9. `about_terms` (Legal Clauses & Articles)
```json
{
  "badge": "الشروط والأحكام",
  "title": "الشروط والأحكام وسياسة الاستخدام",
  "intro_title": "مقدمة وتعريفات أساسية",
  "intro_content": "تحكم هذه الشروط والأحكام استخدام منصة الوسيط للوساطة القانونية.",
  "sections": [
    {
      "id": "sec-1",
      "title": "1. التعريفات والمصطلحات",
      "lead": "يقصد بالكلمات والعبارات التالية المعاني الموضحة أمام كل منها:",
      "content": "المنصة: منصة الوسيط للوساطة القانونية. المستخدم: أي شخص ينشئ حساباً.",
      "points": [
        "الطلب القانوني: الاستشارة أو القضية التي ينشرها العميل.",
        "العرض: المقترح المالي والمهني المقدم من المحامي."
      ]
    }
  ]
}
```

### 10. `contact_page` / `contact_channels_info` (Contact Header & Dynamic Backend Settings)
> **Dynamic Integration:** Official contact details (phone, email, physical office address, social links) are automatically served by the backend from the Contact Settings module (`/api/v1/admin/contact-settings`). The Page Builder manages only the header badge, title, subtitle, and complaint form texts. Header images come from the global `sliders` array.

```json
{
  "badge": "تواصل معنا",
  "title": "نحن هنا لمساعدتك والإجابة على استفساراتك",
  "description": "يسعد فريق الدعم بالرد على أسئلتكم ومساعدتكم في أي استفسار يخص الطلبات القانونية أو الانضمام للمنصة.",
  "complaint_title": "تقديم شكوى أو مقترح",
  "complaint_subtitle": "في حال واجهتك أي مشكلة يُرجى إرسال تفاصيل الشكوى مباشرة لمدير الجودة."
}
```

### 11. `faq_accordion` / `faq_accordion_categorized` (FAQ Header & Dynamic Backend Questions)
> **Dynamic Integration:** Questions, answers, and category filters are automatically served by the backend from the Questions module (`/api/v1/admin/questions`). The Page Builder configures only the header badge, title, subtitle description, and search placeholder. Header images come from the global `sliders` array.

```json
{
  "badge": "الأسئلة الشائعة",
  "title": "الإجابات على أكثر الأسئلة تكراراً",
  "description": "دليل شامل للإجابة على جميع تساؤلات العملاء والمحامين حول تقديم الطلبات والرسوم وضمان الأتعاب.",
  "search_placeholder": "ابحث في الأسئلة الشائعة..."
}
```

### 12. `blog_page` / `blog_page_header` (Blog Header & Dynamic Backend Articles)
> **Dynamic Integration:** Blog articles, categories, and tags are automatically served by the backend from the Blogs module (`/api/v1/admin/blogs`). The Page Builder manages only the header badge, title, subtitle description, and section headings. Header images come from the global `sliders` array.

```json
{
  "badge": "المدونة القانونية",
  "title": "المقالات والتحليلات القانونية",
  "description": "مقالات واستشارات قانونية متخصصة بقلم نخبة من المحامين والمستشارين المعتمدين.",
  "articles_heading": "أحدث المقالات القانونية",
  "subscribers_badge": "للمشتركين فقط"
}
```

---

## 3. Admin Endpoints (Dashboard)

### 1. List Pages
- **Method:** `GET`
- **Endpoint:** `/api/v1/admin/pages`
- **Query Params:** `?page=1&per_page=15&search=home&type=system&is_published=1`

### 2. Create Page
- **Method:** `POST`
- **Endpoint:** `/api/v1/admin/pages`

### 3. Get Page Details & Sections
- **Method:** `GET`
- **Endpoint:** `/api/v1/admin/pages/{id}`

### 4. Update Page Metadata & SEO
- **Method:** `PUT`
- **Endpoint:** `/api/v1/admin/pages/{id}`

### 5. Delete Page
- **Method:** `DELETE`
- **Endpoint:** `/api/v1/admin/pages/{id}`

### 6. Toggle Page Publish Status
- **Method:** `PATCH`
- **Endpoint:** `/api/v1/admin/pages/{id}/toggle-status`

### 7. Save / Bulk Update Page Sections
- **Method:** `PUT`
- **Endpoint:** `/api/v1/admin/pages/{id}/sections`

---

## 4. Block Shapes & Templates CRUD Endpoints

Manage reusable block shapes and input schemas across all pages.

### Table: `block_templates`
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(60)` | `PK`, `NOT NULL` | Unique slug (e.g. `title_desc_image_features`, `cards_grid`) |
| `name` | `JSON` | `NOT NULL` | Localized name: `{"ar": "...", "en": "..."}` |
| `description` | `JSON` | `NULLABLE` | Localized explanation of block layout and shape |
| `category` | `ENUM(...)` | `INDEX` | `content_media`, `cards_grid`, `workflow`, `quotes`, `support`, `legal`, `hero` |
| `icon` | `VARCHAR(60)` | `NOT NULL` | Primary icon identifier |
| `shape_tags` | `JSON` | `NOT NULL` | Elements tags: `["title", "description", "image", "icon", "cards"]` |
| `fields` | `JSON` | `NOT NULL` | Schema of inputs (text, textarea, image, icon, repeater) |
| `default_content` | `JSON` | `NOT NULL` | Seed content for `ar` and `en` |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE`, `INDEX` | Availability in page builder |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation date |
| `updated_at` | `TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Last updated |

### Endpoints:
1. **List Block Templates:** `GET /api/v1/admin/block-templates?category=all`
2. **Create Block Template:** `POST /api/v1/admin/block-templates`
3. **Get Block Template:** `GET /api/v1/admin/block-templates/{id}`
4. **Update Block Template:** `PUT /api/v1/admin/block-templates/{id}`
5. **Delete Block Template:** `DELETE /api/v1/admin/block-templates/{id}`
6. **Toggle Block Status:** `PATCH /api/v1/admin/block-templates/{id}/toggle-status`

---

## 5. Global Slider Images CRUD Endpoints

A single global pool of slider images shared by **all** website pages. There are no
placements, no titles, and no CTA content here — only images and their order. The
backend returns these images as a plain `sliders` array with every page response,
and each page header/banner block renders its own texts over them.

### Table: `sliders`
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT`, `PK` | Unique ID |
| `image` | `VARCHAR(500)` | `NOT NULL` | Image asset path or URL |
| `alt` | `JSON` | `NULLABLE` | Localized alt text: `{"ar": "...", "en": "..."}` |
| `sort_order` | `INT` | `DEFAULT 0`, `INDEX` | Carousel order |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE`, `INDEX` | Visibility toggle |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation date |
| `updated_at` | `TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Last updated |

### Endpoints:
1. **List Slider Images (Admin):** `GET /api/v1/admin/sliders`
2. **Add Slider Images (bulk upload):** `POST /api/v1/admin/sliders` — body: `{ "images": ["/images/slider1.webp", "..."] }`
3. **Update Slider Image:** `PUT /api/v1/admin/sliders/{id}`
4. **Delete Slider Image:** `DELETE /api/v1/admin/sliders/{id}`
5. **Toggle Status:** `PATCH /api/v1/admin/sliders/{id}/toggle-status`
6. **Reorder Slider Images:** `PUT /api/v1/admin/sliders/reorder`
7. **Public List:** `GET /api/v1/guest/sliders` — returns active images ordered by `sort_order ASC`

---

## 5. Public / Guest Endpoints (Website)

### 1. Get Page by Slug (With Injected Global Sliders)
- **Method:** `GET`
- **Endpoint:** `/api/v1/guest/pages/{slug}`
- **Headers:** `Accept-Language: ar` (or `en`)

**Backend Responsibilities during Page Response:**
1. Fetch page metadata and active sections ordered by `sort_order ASC`.
2. **Global Sliders Injection:** Always attach a top-level `sliders` array containing every active image from the `sliders` table ordered by `sort_order ASC`. This is identical for all pages — no placement filtering.
3. **Dynamic FAQs Injection (for FAQ pages):** If the page is `faq` or section is `faq_accordion` / `faq_accordion_categorized`, query published questions from the `questions` repository and attach them as `content.faqs` (or supply the dedicated `/api/v1/guest/questions` endpoint).
4. **Dynamic Contact Settings (for Contact page):** If the page is `contact` or section is `contact_channels_info`, automatically attach active contact settings (phone, email, physical address, social links).
5. **Dynamic Blog Posts (for Blog page):** If the page is `blog` or section is `blog_page_header`, attach latest featured/published blog posts from `/api/v1/guest/blogs`.

**Example Response Payload:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "slug": "home",
    "title": "الصفحة الرئيسية",
    "sliders": [
      "/images/slider1.webp",
      "/images/slider2.webp",
      "/images/slider3.webp",
      "/images/slider4.webp",
      "/images/slider5.webp",
      "/images/slider6.webp",
      "/images/slider7.webp"
    ],
    "sections": [
      {
        "id": "sec-1",
        "type": "home_header",
        "sort_order": 0,
        "is_active": true,
        "content": {
          "badge": "منصة مرخصة وموثوقة",
          "title_line1": "منصتك الموثوقة",
          "title_line2": "للوصول إلى",
          "title_highlight": "أفضل المحامين",
          "description": "منصة رقمية موثوقة تربطك بأفضل المحامين ومقدمي الخدمات القانونية...",
          "cta_text": "تقديم طلب قانوني",
          "cta_link": "/auth/sign-up/client/step-1",
          "secondary_cta_text": "تصفح المحامين",
          "secondary_cta_link": "/auth/sign-up"
        }
      }
    ]
  }
}
```

### 2. List Public Pages
- **Method:** `GET`
- **Endpoint:** `/api/v1/guest/pages`
