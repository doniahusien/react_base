# Page Builder — Backend Specification

Contract for the Pages, Blocks, and Sliders system. The admin dashboard
(`elwaseet_dash`) is already built against this exact shape using mock services;
replacing the mocks with these endpoints requires no UI changes.

**Base URL:** `{{base_url}}` — e.g. `https://api.elwaseet.sa`
**Auth:** admin endpoints require the admin bearer token. `guest` endpoints are public.

---

## 1. The model in one paragraph

A **page** is a slug plus SEO metadata plus an ordered list of **sections**. A
section is one **block** (a reusable layout shape) holding bilingual content.
There are exactly **13 block types** — the full list is in section 4. A block is
a shape, not a page slot: the same block may appear on many pages, and twice on
the same page, with different content each time. Never add a new block type for
a page that reuses an existing shape.

Three rules that matter for implementation:

1. **Content is always bilingual.** Every section's `content` is
   `{"ar": {...}, "en": {...}}` with the same keys on both sides.
2. **Sliders are global, never per-page.** There is one pool of slider images.
   The backend attaches the active pool as a `sliders` array to *every* guest
   page response. Blocks store header texts only, never images.
3. **Three blocks receive injected data.** `contact_channels_info`,
   `faq_accordion_categorized`, and `blog_page_header` store only their header
   texts; the backend appends the real contact settings, questions, and articles.

---

## 2. Database schema

### `pages`

| Field | Type | Attributes | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | PK, auto increment | |
| `slug` | `VARCHAR(255)` | unique, not null, index | `home`, `about`, `contact`, `faq`, `privacy` |
| `title` | `JSON` | not null | `{"ar": "...", "en": "..."}` |
| `type` | `ENUM('system','landing','custom','policy')` | default `custom` | `system` pages must not be deletable |
| `is_published` | `BOOLEAN` | default true, index | |
| `seo` | `JSON` | nullable | see SEO object below |
| `created_at` / `updated_at` | `TIMESTAMP` | | |

### `page_sections`

| Field | Type | Attributes | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | PK, auto increment | |
| `page_id` | `BIGINT UNSIGNED` | FK → `pages(id)` on delete cascade | |
| `type` | `VARCHAR(60)` | not null, index | one of the 13 block ids |
| `is_active` | `BOOLEAN` | default true | hidden sections stay stored but are excluded from guest responses |
| `content` | `JSON` | not null | `{"ar": {...}, "en": {...}}` |
| `created_at` / `updated_at` | `TIMESTAMP` | | |

Validate `type` against the 13 ids on write and reject anything else.

**There is no `sort_order` column.** Sections render in the order the rows are
returned, which must be ascending `id`. Because the bulk save endpoint replaces
the whole list in one call (see section 3), inserting the rows in the order they
arrive is enough to preserve the order the admin built. Always add
`ORDER BY id ASC` when reading sections.

### `block_templates`

The catalog of available blocks and their editable field schemas. Seed it from
section 4; the admin "Blocks & Shapes" screen reads and edits it.

| Field | Type | Attributes | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(60)` | PK | canonical block id, e.g. `hero_header` |
| `name_ar` / `name_en` | `VARCHAR(255)` | not null | |
| `description_ar` / `description_en` | `TEXT` | | |
| `category` | `ENUM('hero','content_media','cards_grid','workflow','quotes','support','legal')` | not null | |
| `icon` | `VARCHAR(60)` | | icon identifier |
| `shape_tags` | `JSON` | | `["badge","title","image"]` — display only |
| `is_active` | `BOOLEAN` | default true | inactive blocks are hidden from "Add Section" |
| `fields` | `JSON` | not null | field schema, see below |
| `default_content` | `JSON` | not null | `{"ar": {...}, "en": {...}}` used when a section is created |
| `created_at` / `updated_at` | `TIMESTAMP` | | |

A `fields` entry:

```json
{
  "key": "title",
  "label_ar": "العنوان",
  "label_en": "Title",
  "type": "text",
  "required": true,
  "default_value": "",
  "placeholder_ar": "", "placeholder_en": "",
  "help_text_ar": "", "help_text_en": "",
  "item_fields": [],
  "item_label_ar": "", "item_label_en": "",
  "min_items": 0, "max_items": 0
}
```

`type` is one of `text`, `textarea`, `rich_text`, `image`, `icon`, `url`,
`switch`, `repeater`. For `repeater`, `item_fields` describes each row and
`item_label_ar` / `item_label_en` name a single row.

### `sliders`

| Field | Type | Attributes | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | PK, auto increment | |
| `image` | `VARCHAR(500)` | not null | stored image path |
| `alt` | `JSON` | nullable | `{"ar": "...", "en": "..."}` |
| `is_active` | `BOOLEAN` | default true | |
| `created_at` / `updated_at` | `TIMESTAMP` | | |

Sliders have no `sort_order` either. They display in the order they were added,
so read them with `ORDER BY id ASC`.

### SEO object

```json
{
  "meta_title":       { "ar": "...", "en": "..." },
  "meta_description": { "ar": "...", "en": "..." },
  "meta_keywords":    { "ar": "...", "en": "..." },
  "og_image": "/images/slider1.webp",
  "canonical_url": "https://elwaseet.sa/about",
  "no_index": false
}
```

---

## 3. Endpoints

### Pages — admin

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/pages` | list, params `page`, `per_page`, `search`, `type`, `is_published` |
| `POST` | `/api/v1/admin/pages` | create |
| `GET` | `/api/v1/admin/pages/{id}` | page with all its sections, `ORDER BY id ASC` |
| `PUT` | `/api/v1/admin/pages/{id}` | update slug, title, type, SEO |
| `DELETE` | `/api/v1/admin/pages/{id}` | delete; reject when `type = system` |
| `PATCH` | `/api/v1/admin/pages/{id}/toggle-status` | flip `is_published`, returns the new value |
| `PUT` | `/api/v1/admin/pages/{id}/sections` | replace the whole section list in one call |

The list response returns `sections_count` per page instead of full sections.

**Bulk section save** is how the builder saves. It sends the complete desired
list, and **the array order is the render order** — persist the rows so that
reading them back with `ORDER BY id ASC` reproduces exactly the array that was
sent. The simplest correct implementation is to delete the page's existing
sections and re-insert the array in order inside one transaction.

Sections absent from the array are deleted. Ids sent by the client may be
existing numeric ids or new client-generated strings (e.g. `sec-1735820000000`);
treat the latter as new rows.

```json
PUT /api/v1/admin/pages/2/sections
{
  "sections": [
    {
      "id": "sec-200",
      "type": "page_header_banner",
      "is_active": true,
      "content": { "ar": { "title": "..." }, "en": { "title": "..." } }
    }
  ]
}
```

### Blocks — admin

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/block-templates` | list, optional `category` (`all` or a category value) |
| `POST` | `/api/v1/admin/block-templates` | create |
| `GET` | `/api/v1/admin/block-templates/{id}` | single |
| `PUT` | `/api/v1/admin/block-templates/{id}` | update |
| `PATCH` | `/api/v1/admin/block-templates/{id}/toggle-status` | flip `is_active` |
| `DELETE` | `/api/v1/admin/block-templates/{id}` | reject when any `page_sections` row still uses it |

### Sliders — admin

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/sliders` | list, `ORDER BY id ASC` |
| `POST` | `/api/v1/admin/sliders` | add images, body `{ "images": ["<path>", ...] }` |
| `PUT` | `/api/v1/admin/sliders/{id}` | update `image`, `alt`, `is_active` |
| `DELETE` | `/api/v1/admin/sliders/{id}` | delete |
| `PATCH` | `/api/v1/admin/sliders/{id}/toggle-status` | flip `is_active` |

Slider images need a real upload endpoint returning a stored path. The dashboard
currently produces base64 data URLs as a mock stand-in; it will send multipart
uploads once an endpoint exists.

### Public — guest

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/guest/pages` | published pages, slug and title only |
| `GET` | `/api/v1/guest/pages/{slug}` | one page, resolved for rendering |
| `GET` | `/api/v1/guest/sliders` | active slider images |

`GET /api/v1/guest/pages/{slug}` must:

- return `404` when the page is missing or `is_published = false`
- include only sections where `is_active = true`, `ORDER BY id ASC`
- attach the active slider pool as a top-level `sliders` array
- append injected data to the three dynamic blocks (see section 5)

```json
{
  "status": true,
  "data": {
    "id": 2,
    "slug": "about",
    "title": { "ar": "من نحن", "en": "About Us" },
    "seo": { "...": "..." },
    "sliders": [
      { "id": 1, "image": "/images/slider1.webp", "alt": { "ar": "...", "en": "..." } }
    ],
    "sections": [
      {
        "id": 200,
        "type": "page_header_banner",
        "content": { "ar": { "...": "..." }, "en": { "...": "..." } }
      }
    ]
  }
}
```

---

## 4. The 13 blocks

Each block below shows its `content.ar` / `content.en` keys. Repeater fields are
arrays; each row carries a client-side `id` string that may be persisted as-is.

### 1. `hero_header` — category `hero`

Home page top banner rendered over the global slider.

```json
{
  "badge": "منصة مرخصة وموثوقة",
  "title_line1": "منصتك الموثوقة",
  "title_line2": "للوصول إلى",
  "title_highlight": "أفضل المحامين",
  "description": "...",
  "cta_text": "تقديم طلب قانوني",
  "cta_link": "/auth/sign-up/client/step-1",
  "secondary_cta_text": "تصفح المحامين",
  "secondary_cta_link": "/auth/sign-up"
}
```

Required: `title_line1`, `title_highlight`, `description`.

### 2. `page_header_banner` — category `content_media`

Inner page header over the global slider. Used by every page except home.

```json
{
  "badge": "منصة الوسيط",
  "title": "الوساطة القانونية الرقمية",
  "description": "...",
  "cta_text": "",
  "cta_link": ""
}
```

Required: `title`.

### 3. `title_desc_image_features` — category `content_media`

Narrative section with a side image, a stats badge, and an icon feature list.

```json
{
  "badge": "قصتنا ومسيرتنا",
  "title": "...",
  "description": "...",
  "image": "/images/our_story.webp",
  "stats_label": "منصة معتمدة وموثوقة",
  "features": [
    { "id": "feat-1", "title": "...", "description": "...", "icon": "ShieldCheck" }
  ]
}
```

Required: `title`, `description`.

### 4. `title_desc_image_only` — category `content_media`

Simple content block. Same as block 3 without the feature list.

```json
{
  "badge": "عن المنصة",
  "title": "...",
  "description": "...",
  "image": "/images/slider1.webp"
}
```

Required: `title`, `description`.

### 5. `cards_grid_with_icons_images` — category `cards_grid`

Grid of cards, each with an icon and a background image.

```json
{
  "badge": "",
  "title": "",
  "description": "",
  "services": [
    {
      "id": "serv-1",
      "title": "تقديم طلب قانوني",
      "description": "...",
      "icon": "Scale",
      "image": "/images/service1.webp"
    }
  ]
}
```

Required per row: `title`.

### 6. `steps_workflow_cards` — category `workflow`

Numbered sequential steps.

```json
{
  "badge": "خطوات العمل",
  "title": "...",
  "description": "...",
  "steps": [
    { "id": "step-1", "step_number": "01", "title": "...", "description": "...", "icon": "Users" }
  ]
}
```

Required: `title`; per row `step_number` and `title`.

### 7. `dual_action_cta_cards` — category `workflow`

Two conversion cards side by side.

```json
{
  "badge": "ابدأ الآن",
  "title": "اختر المسار المناسب لك",
  "subtitle": "...",
  "client_option": {
    "title": "...", "description": "...",
    "cta_text": "...", "cta_link": "/auth/sign-up/client/step-1",
    "icon": "PenLine", "note_text": "..."
  },
  "lawyer_option": {
    "title": "...", "description": "...",
    "cta_text": "...", "cta_link": "/auth/sign-up/lawyer/step-1",
    "icon": "Users", "note_text": "..."
  }
}
```

Required: `title`, `client_option.title`, `lawyer_option.title`.

### 8. `values_pillars_cards` — category `cards_grid`

Grid of values or principles, each with an icon and a small tag.

```json
{
  "badge": "قيمنا",
  "title": "...",
  "subtitle": "...",
  "values": [
    { "id": "val-1", "title": "النزاهة والشفافية", "description": "...", "tag": "نزاهة تامة", "icon": "Scale" }
  ]
}
```

Required: `title`; per row `title`.

### 9. `statement_pillars_cards` — category `quotes`

Statement text, an optional highlighted quote, and pillar cards. **This one block
serves Vision, Mission, and any similar statement section** — add it twice on the
About page with different content rather than asking for two block types. Leave
`footer_quote` empty when the section does not need a quote, and leave a pillar's
`tag` empty when it does not need a badge.

```json
{
  "badge": "رؤيتنا",
  "title": "...",
  "statement": "...",
  "footer_quote": "...",
  "pillars": [
    { "id": "pil-1", "title": "الريادة الرقمية", "description": "...", "tag": "تقنية متقدمة", "icon": "Sparkles" }
  ]
}
```

Required: `title`, `statement`; per row `title`.

### 10. `numbered_legal_clauses` — category `legal`

Legal document split into numbered clauses. Serves the Terms & Conditions section
of the About page, the Privacy page, and any other policy content.

```json
{
  "badge": "الشروط والأحكام",
  "title": "...",
  "intro_title": "مقدمة وتعريفات أساسية",
  "intro_content": "...",
  "sections": [
    { "id": "sec-1", "title": "1. التعريفات والمصطلحات", "lead": "...", "content": "..." }
  ]
}
```

Required: `title`; per row `title` and `content`.

### 11. `contact_channels_info` — category `support`

Contact page header and complaint form labels only.

```json
{
  "badge": "تواصل معنا",
  "title": "...",
  "description": "...",
  "data_source": "contact_settings",
  "complaint_title": "تقديم شكوى أو مقترح",
  "complaint_subtitle": "..."
}
```

Required: `title`. The phone, email, and address are **not** stored here — see
section 5.

### 12. `faq_accordion_categorized` — category `support`

FAQ page header and search field label only.

```json
{
  "badge": "الأسئلة الشائعة",
  "title": "...",
  "description": "...",
  "data_source": "questions_api",
  "search_placeholder": "ابحث في الأسئلة الشائعة..."
}
```

Required: `title`. The questions are injected — see section 5.

### 13. `blog_page_header` — category `content_media`

Blog page header only.

```json
{
  "badge": "المدونة القانونية",
  "title": "...",
  "description": "...",
  "data_source": "blogs_api",
  "articles_heading": "أحدث المقالات القانونية",
  "subscribers_badge": "للمشتركين فقط"
}
```

Required: `title`. The articles are injected — see section 5.

---

## 5. Injected data on guest responses

Blocks 11, 12, and 13 declare a `data_source`. On
`GET /api/v1/guest/pages/{slug}`, append the live data to those sections so the
website needs only one request per page. The admin never edits these arrays.

| `data_source` | Append | Suggested shape |
| :--- | :--- | :--- |
| `contact_settings` | `channels` | `{ "phone": "...", "email": "...", "address": { "ar": "...", "en": "..." }, "whatsapp": "...", "social": { "...": "..." } }` |
| `questions_api` | `faqs` | `[{ "id": 1, "question": "...", "answer": "...", "category": "..." }]` |
| `blogs_api` | `articles`, `categories` | `[{ "id": 1, "title": "...", "excerpt": "...", "image_url": "...", "published_at": "...", "author": { "name": "..." } }]` |

Append these next to the block's stored keys, inside the localized content or as
a sibling of `content` — pick one and keep it consistent across the three.

---

## 6. Seeding

Seed five pages so the website has content on first deploy. Section content comes
from each block's `default_content`.

| Page | Slug | Type | Sections in order |
| :--- | :--- | :--- | :--- |
| Home | `home` | system | `hero_header`, `cards_grid_with_icons_images`, `steps_workflow_cards`, `dual_action_cta_cards` |
| About | `about` | system | `page_header_banner`, `title_desc_image_features`, `values_pillars_cards`, `statement_pillars_cards` (Vision), `statement_pillars_cards` (Mission), `numbered_legal_clauses` (Terms & Conditions) |
| Contact | `contact` | system | `contact_channels_info` |
| FAQ | `faq` | system | `faq_accordion_categorized` |
| Privacy | `privacy` | policy | `numbered_legal_clauses` |

Note how the About page uses `statement_pillars_cards` twice and two pages share
`numbered_legal_clauses`. That repetition is the intended design.

### Terms & Conditions has no page of its own

There is **no `terms` page and no `/api/v1/guest/pages/terms` endpoint.** Do not
create one.

Terms & Conditions is the last `numbered_legal_clauses` section of the **About**
page. The admin edits it in the dashboard under About, and it is returned as part
of the normal `GET /api/v1/guest/pages/about` response together with the other
About sections. The public site renders that section at the bottom of its About
page. No special-casing, no duplication, no cross-page reference — it is an
ordinary section row whose `page_id` points at About.

The `privacy` page is separate and unaffected; it keeps its own page row and its
own `numbered_legal_clauses` section with independent content.

Also seed the 13 `block_templates` rows and a handful of `sliders` rows.

---

## 7. Legacy block ids

An earlier iteration of the dashboard used a second set of names that duplicated
the shapes above. They are gone from the product. If any data was captured with
them, map it on import and never emit them again.

| Legacy id | Canonical id |
| :--- | :--- |
| `home_header`, `home_hero_header`, `hero_header_slider` | `hero_header` |
| `general_page_header` | `page_header_banner` |
| `about_our_story` | `title_desc_image_features` |
| `home_services` | `cards_grid_with_icons_images` |
| `how_to_work` | `steps_workflow_cards` |
| `how_to_get_service` | `dual_action_cta_cards` |
| `about_values` | `values_pillars_cards` |
| `about_vision`, `about_mission`, `vision_statement_pillars`, `mission_objectives_tags`, `vision_mission_statement_pillars` | `statement_pillars_cards` |
| `about_terms`, `legal_terms_clauses` | `numbered_legal_clauses` |
| `contact_page` | `contact_channels_info` |
| `faq_accordion`, `faq_accordion_items` | `faq_accordion_categorized` |
| `blog_page` | `blog_page_header` |

The same map lives in code at `src/mocks/blockTemplatesMock.ts`
(`LEGACY_BLOCK_TYPE_MAP`).

---

## 8. Response envelope

All endpoints use the project's standard envelope.

```json
{ "status": true, "message": "...", "data": { } }
```

Validation errors return `422` with `{ "status": false, "message": "...", "errors": { "field": ["..."] } }`.

---

## 9. How the dashboard connects

The dashboard already calls every function listed here through a service layer,
so no screen needs to change when the backend goes live:

- `src/services/pagesService.ts`
- `src/services/blockTemplatesService.ts`
- `src/services/slidersService.ts`

Each function has two implementations behind one signature — local mock data, or
the real endpoint above. The choice is a single flag in `.env`:

```
VITE_USE_MOCK_PAGE_BUILDER="true"   # mock data, backend not ready
VITE_USE_MOCK_PAGE_BUILDER="false"  # real endpoints
```

This means the endpoints must match this document exactly — paths, methods,
request bodies, and the response envelope. If something has to differ, tell the
frontend before building it, so the change happens in one service file instead
of across the screens.

Two things still needed from the backend beyond the tables and endpoints:

1. **An image upload endpoint** returning a stored path, for slider images and
   for the `image` fields inside blocks. The dashboard currently produces base64
   data URLs as a mock stand-in and will switch to multipart upload.
2. **Confirmation of the injected-data shape** in section 5, since the website
   templates will read those keys directly.
