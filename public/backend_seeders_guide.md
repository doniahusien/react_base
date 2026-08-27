# دليل ومواصفات بذور قاعدة البيانات (Backend Seeders & Dynamic Integration Guide)

> هذا الدليل والملف المرفق `backend_seeders_and_responses.json` مُعدان خصيصاً لمطوري الباك إند (Backend Developers) لتسهيل بناء الـ Seeders، وإنشاء الـ Migrations، ومعالجة الـ API Responses المطلوبة للوحة التحكم والموقع العام.

---

## 1. محتويات الحزمة

1. **ملف البيانات الجاهز (JSON):** `public/backend_seeders_and_responses.json`
   - يحتوي على كافة البيانات الافتراضية للجداول (`sliders`, `pages`, `page_sections`, `block_templates`).
   - يحتوي على نماذج استجابة الـ API كاملة (للأدمن والموقع العام).
2. **ملف مواصفات الـ API الكامل:** `public/page_builder_api.md`
   - يحتوي على جميع مسارات ونقاط الـ REST Endpoints.

---

## 2. هيكل الجداول ومفاتيحها (Database Schema)

### 1) جدول `sliders` (مكتبة صور السلايدر العامة)

> مكتبة صور واحدة مشتركة بين **كل** صفحات الموقع. لا يوجد بها عناوين ولا أزرار ولا تصنيف
> بحسب الصفحة — صور فقط مع ترتيبها. الباك إند يرجعها كمصفوفة `sliders` مع استجابة كل صفحة،
> وكل صفحة تتحكم في نصوص الهيدر/البانر الخاصة بها فقط.

```sql
CREATE TABLE sliders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(500) NOT NULL,    -- Image path or URL
    alt JSON NULL,                  -- {"ar": "...", "en": "..."}
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sliders_active (is_active),
    INDEX idx_sliders_order (sort_order)
);
```

### 2) جدول `pages` (الصفحات)
```sql
CREATE TABLE pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL, -- home, about, contact, faq, terms, privacy
    title JSON NOT NULL,              -- {"ar": "...", "en": "..."}
    type ENUM('system', 'landing', 'custom', 'policy') DEFAULT 'custom',
    is_published BOOLEAN DEFAULT TRUE,
    seo JSON NULL,                    -- {"meta_title": {...}, "meta_description": {...}, "og_image": "...", "keywords": "..."}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pages_slug (slug),
    INDEX idx_pages_published (is_published)
);
```

### 3) جدول `page_sections` (أقسام ومحتوى الصفحات)
```sql
CREATE TABLE page_sections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    page_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(60) NOT NULL,        -- home_header, home_services, how_to_work, about_our_story, ...
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    content JSON NOT NULL,            -- {"ar": { ... }, "en": { ... }}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    INDEX idx_sections_page_order (page_id, sort_order)
);
```

### 4) جدول `block_templates` (قوالب وأشكال البلوكات)
```sql
CREATE TABLE block_templates (
    id VARCHAR(60) PRIMARY KEY,       -- title_desc_image_features, cards_grid_with_icons_images, ...
    name JSON NOT NULL,               -- {"ar": "...", "en": "..."}
    description JSON NULL,            -- {"ar": "...", "en": "..."}
    category VARCHAR(50) NOT NULL,    -- content_media, cards_grid, workflow, quotes, support, legal, hero
    icon VARCHAR(60) NOT NULL,
    shape_tags JSON NOT NULL,         -- ["badge", "title", "description", "image", "icons"]
    fields JSON NOT NULL,             -- Array of field definitions schema
    default_content JSON NOT NULL,    -- {"ar": { ... }, "en": { ... }}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 3. آلية الدمج التلقائي في الباك إند (Dynamic Content Injection)

عند طلب صفحة للموقع العام عبر `GET /api/v1/guest/pages/{slug}`:
يقوم الباك إند بالآتي:

1. قراءة لغة الطلب من الترويسة `Accept-Language: ar` (أو `en`) لإرجاع نصوص اللغة المحددة مباشرة دون تعقيد الفرونت إند.
2. جلب الصفحة وأقسامها النشطة مرتبة حسب `sort_order ASC`.
3. **الحقن التلقائي لصور السلايدر (Sliders Injection):**
   - يتم دائماً جلب كل الصور النشطة من جدول `sliders` مرتبة حسب `sort_order ASC`.
   - وإرجاعها كمصفوفة `sliders` في المستوى الأعلى من استجابة الصفحة (نفس الصور لكل الصفحات، بدون أي تصنيف).
4. **الحقن التلقائي للأسئلة الشائعة (FAQ Dynamic Injection):**
   - لصفحة `faq` أو بلوك `faq_accordion` / `faq_accordion_categorized`:
   - يتم جلب الأسئلة المنشورة من جدول `questions` وإلحاقها داخل `content.faqs`.
5. **الحقن التلقائي لبيانات التواصل (Contact Dynamic Injection):**
   - لصفحة `contact` أو بلوك `contact_page` / `contact_channels_info`:
   - يتم جلب بيانات التواصل الرسمية من جدول `contact_settings` وإلحاقها داخل `content.contact_settings`.
6. **الحقن التلقائي للمدونة (Blogs Dynamic Injection):**
   - لصفحة `blog` أو بلوك `blog_page_header`:
   - يتم جلب أحدث المقالات من جدول `blogs` وإلحاقها داخل `content.latest_blogs`.

---

## 4. مثال كود Seeder (Laravel PHP Example)

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class PageBuilderSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = public_path('backend_seeders_and_responses.json');
        if (!File::exists($jsonPath)) {
            $jsonPath = base_path('../elwaseet_dash/public/backend_seeders_and_responses.json');
        }

        $data = json_decode(File::get($jsonPath), true)['database_tables'];

        // 1. Seed Slider Images
        foreach ($data['sliders'] as $slider) {
            DB::table('sliders')->updateOrInsert(
                ['id' => $slider['id']],
                [
                    'image' => $slider['image'],
                    'alt' => json_encode($slider['alt'] ?? null, JSON_UNESCAPED_UNICODE),
                    'sort_order' => $slider['sort_order'],
                    'is_active' => $slider['is_active'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 2. Seed Pages
        foreach ($data['pages'] as $page) {
            DB::table('pages')->updateOrInsert(
                ['id' => $page['id']],
                [
                    'slug' => $page['slug'],
                    'title' => json_encode($page['title'], JSON_UNESCAPED_UNICODE),
                    'type' => $page['type'],
                    'is_published' => $page['is_published'],
                    'seo' => isset($page['seo']) ? json_encode($page['seo'], JSON_UNESCAPED_UNICODE) : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 3. Seed Page Sections
        foreach ($data['page_sections'] as $sec) {
            DB::table('page_sections')->updateOrInsert(
                ['id' => $sec['id']],
                [
                    'page_id' => $sec['page_id'],
                    'type' => $sec['type'],
                    'sort_order' => $sec['sort_order'],
                    'is_active' => $sec['is_active'],
                    'content' => json_encode($sec['content'], JSON_UNESCAPED_UNICODE),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 4. Seed Block Templates
        foreach ($data['block_templates'] as $tpl) {
            DB::table('block_templates')->updateOrInsert(
                ['id' => $tpl['id']],
                [
                    'name' => json_encode($tpl['name'], JSON_UNESCAPED_UNICODE),
                    'description' => isset($tpl['description']) ? json_encode($tpl['description'], JSON_UNESCAPED_UNICODE) : null,
                    'category' => $tpl['category'],
                    'icon' => $tpl['icon'],
                    'shape_tags' => json_encode($tpl['shape_tags'], JSON_UNESCAPED_UNICODE),
                    'fields' => json_encode($tpl['fields'], JSON_UNESCAPED_UNICODE),
                    'default_content' => json_encode($tpl['default_content'] ?? [], JSON_UNESCAPED_UNICODE),
                    'is_active' => $tpl['is_active'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
```
