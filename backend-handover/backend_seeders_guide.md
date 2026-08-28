# دليل بذور قاعدة البيانات (Backend Seeders Guide)

> هذا الدليل وملف البيانات `backend_seeders_and_responses.json` مُعدّان لمطور الباك إند
> لبناء الـ Migrations والـ Seeders ومعالجة استجابات الـ API.
>
> **العقد الكامل للـ API موجود في `page_builder_api.md` — هو المرجع الأساسي.**
> هذا الملف مكمل له ولا يخالفه.

---

## 1. محتويات الحزمة

1. **ملف البيانات الجاهز:** `backend_seeders_and_responses.json`
   - `database_tables` — صفوف الجداول الأربعة الجاهزة للإدخال: `sliders`, `pages`, `page_sections`, `block_templates`.
   - `sample_api_responses` — نماذج الاستجابات المطلوبة للأدمن والموقع العام.
2. **مواصفات الـ API الكاملة:** `page_builder_api.md`

### ملاحظتان مهمتان

- **لا يوجد عمود `sort_order` في أي جدول.** الترتيب مستنتج من `id` تصاعدياً.
  استخدم دائماً `ORDER BY id ASC` عند قراءة `page_sections` و `sliders`.
- **عدد البلوكات 13 فقط.** أي اسم بلوك خارج هذه القائمة مرفوض. القائمة الكاملة
  والأسماء القديمة الملغاة موجودة في القسم 4 و 7 من `page_builder_api.md`.

---

## 2. هيكل الجداول (Database Schema)

### 1) جدول `sliders` (مكتبة صور السلايدر العامة)

> مكتبة صور واحدة مشتركة بين **كل** صفحات الموقع. لا عناوين ولا أزرار ولا تصنيف
> بحسب الصفحة — صور فقط. الباك إند يرجعها كمصفوفة `sliders` مع استجابة كل صفحة،
> وكل صفحة تتحكم في نصوص الهيدر/البانر الخاصة بها فقط.
> الصور تظهر بترتيب إضافتها (`id` تصاعدياً).

```sql
CREATE TABLE sliders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(500) NOT NULL,    -- Image path or URL
    alt JSON NULL,                  -- {"ar": "...", "en": "..."}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sliders_active (is_active)
);
```

### 2) جدول `pages` (الصفحات)

```sql
CREATE TABLE pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL, -- home, about, contact, faq, privacy
    title JSON NOT NULL,               -- {"ar": "...", "en": "..."}
    type ENUM('system', 'landing', 'custom', 'policy') DEFAULT 'custom',
    is_published BOOLEAN DEFAULT TRUE,
    seo JSON NULL,
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
    type VARCHAR(60) NOT NULL,        -- hero_header, cards_grid_with_icons_images, ... (13 أسماء فقط)
    is_active BOOLEAN DEFAULT TRUE,
    content JSON NOT NULL,            -- {"ar": { ... }, "en": { ... }}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    INDEX idx_sections_page (page_id)
);
```

> عند الحفظ الجماعي (`PUT /admin/pages/{id}/sections`) يُرسل الفرونت إند القائمة
> كاملة بالترتيب المطلوب. احذف أقسام الصفحة القديمة وأعد الإدخال بنفس ترتيب
> المصفوفة داخل Transaction واحدة، حتى تعيد `ORDER BY id ASC` نفس الترتيب.

### 4) جدول `block_templates` (قوالب وأشكال البلوكات)

> لاحظ أن أسماء الأعمدة مفصولة باللغة (`name_ar`, `name_en`) وليست JSON،
> لأن لوحة التحكم ترسلها بهذا الشكل.

```sql
CREATE TABLE block_templates (
    id VARCHAR(60) PRIMARY KEY,       -- hero_header, cards_grid_with_icons_images, ...
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_ar TEXT NULL,
    description_en TEXT NULL,
    category ENUM('hero','content_media','cards_grid','workflow','quotes','support','legal') NOT NULL,
    icon VARCHAR(60) NOT NULL,
    shape_tags JSON NOT NULL,         -- ["badge", "title", "description", "image", "icons"]
    fields JSON NOT NULL,             -- مخطط الحقول القابلة للتحرير
    default_content JSON NOT NULL,    -- {"ar": { ... }, "en": { ... }}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 3. الحقن التلقائي للبيانات (Dynamic Content Injection)

عند طلب صفحة للموقع العام عبر `GET /api/v1/guest/pages/{slug}`:

1. اقرأ لغة الطلب من `Accept-Language: ar` أو `en`.
2. اجلب الصفحة وأقسامها النشطة فقط (`is_active = true`) بترتيب `ORDER BY id ASC`.
3. **صور السلايدر:** اجلب كل الصور النشطة من `sliders` بترتيب `id` تصاعدياً،
   وأرجعها كمصفوفة `sliders` في المستوى الأعلى من استجابة الصفحة — نفس الصور
   لكل الصفحات بدون أي تصنيف.
4. **البلوكات الثلاثة الديناميكية:** ثلاثة بلوكات فقط تخزّن نصوص الهيدر ولا تخزّن
   البيانات الفعلية. ألحق البيانات بها كما في الجدول التالي:

| البلوك | `data_source` | المفتاح المُلحق |
| :--- | :--- | :--- |
| `contact_channels_info` | `contact_settings` | `channels` |
| `faq_accordion_categorized` | `questions_api` | `faqs` |
| `blog_page_header` | `blogs_api` | `articles` و `categories` |

الأشكال التفصيلية لهذه المفاتيح موجودة في القسم 5 من ملف `page_builder_api.md`،
ونماذج جاهزة منها في `sample_api_responses` داخل ملف الـ JSON.

---

## 4. مثال Seeder (Laravel)

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class PageBuilderSeeder extends Seeder
{
    public function run(): void
    {
        // انسخ ملف الـ JSON إلى database/seeders/data/ في مشروع الباك إند
        $jsonPath = database_path('seeders/data/backend_seeders_and_responses.json');

        $data = json_decode(File::get($jsonPath), true)['database_tables'];

        DB::transaction(function () use ($data) {
            // 1. صور السلايدر
            foreach ($data['sliders'] as $slider) {
                DB::table('sliders')->updateOrInsert(
                    ['id' => $slider['id']],
                    [
                        'image'      => $slider['image'],
                        'alt'        => isset($slider['alt']) ? json_encode($slider['alt'], JSON_UNESCAPED_UNICODE) : null,
                        'is_active'  => $slider['is_active'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            // 2. الصفحات
            foreach ($data['pages'] as $page) {
                DB::table('pages')->updateOrInsert(
                    ['id' => $page['id']],
                    [
                        'slug'         => $page['slug'],
                        'title'        => json_encode($page['title'], JSON_UNESCAPED_UNICODE),
                        'type'         => $page['type'],
                        'is_published' => $page['is_published'],
                        'seo'          => isset($page['seo']) ? json_encode($page['seo'], JSON_UNESCAPED_UNICODE) : null,
                        'created_at'   => now(),
                        'updated_at'   => now(),
                    ]
                );
            }

            // 3. أقسام الصفحات — الترتيب من الـ id، لذا أدخلها بنفس ترتيب المصفوفة
            foreach ($data['page_sections'] as $sec) {
                DB::table('page_sections')->updateOrInsert(
                    ['id' => $sec['id']],
                    [
                        'page_id'    => $sec['page_id'],
                        'type'       => $sec['type'],
                        'is_active'  => $sec['is_active'],
                        'content'    => json_encode($sec['content'], JSON_UNESCAPED_UNICODE),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            // 4. قوالب البلوكات (13 قالباً)
            foreach ($data['block_templates'] as $tpl) {
                DB::table('block_templates')->updateOrInsert(
                    ['id' => $tpl['id']],
                    [
                        'name_ar'         => $tpl['name_ar'],
                        'name_en'         => $tpl['name_en'],
                        'description_ar'  => $tpl['description_ar'] ?? null,
                        'description_en'  => $tpl['description_en'] ?? null,
                        'category'        => $tpl['category'],
                        'icon'            => $tpl['icon'],
                        'shape_tags'      => json_encode($tpl['shape_tags'], JSON_UNESCAPED_UNICODE),
                        'fields'          => json_encode($tpl['fields'], JSON_UNESCAPED_UNICODE),
                        'default_content' => json_encode($tpl['default_content'], JSON_UNESCAPED_UNICODE),
                        'is_active'       => $tpl['is_active'],
                        'created_at'      => now(),
                        'updated_at'      => now(),
                    ]
                );
            }
        });
    }
}
```

---

## 5. التحقق بعد التشغيل (Verification)

| الجدول | العدد المتوقع |
| :--- | :--- |
| `sliders` | 7 |
| `pages` | 5 |
| `page_sections` | 13 |
| `block_templates` | 13 |

توزيع الأقسام على الصفحات:

| الصفحة | الأقسام بالترتيب |
| :--- | :--- |
| `home` | `hero_header`, `cards_grid_with_icons_images`, `steps_workflow_cards`, `dual_action_cta_cards` |
| `about` | `page_header_banner`, `title_desc_image_features`, `values_pillars_cards`, `statement_pillars_cards` (الرؤية), `statement_pillars_cards` (الرسالة), `numbered_legal_clauses` (الشروط والأحكام) |
| `contact` | `contact_channels_info` |
| `faq` | `faq_accordion_categorized` |
| `privacy` | `numbered_legal_clauses` |

لاحظ أن صفحة `about` تستخدم `statement_pillars_cards` مرتين، وأن صفحتين
تتشاركان `numbered_legal_clauses`. هذا التكرار مقصود: البلوك شكل قابل لإعادة
الاستخدام، وليس مكاناً مخصصاً لصفحة واحدة.

### الشروط والأحكام ليست صفحة مستقلة

**لا توجد صفحة `terms` ولا endpoint باسم `/api/v1/guest/pages/terms`. لا تنشئها.**

الشروط والأحكام هي آخر قسم (`numbered_legal_clauses`) داخل صفحة `about`. يتم
تعديلها من لوحة التحكم ضمن صفحة "من نحن"، وتُرجع تلقائياً مع باقي أقسام الصفحة
في استجابة `GET /api/v1/guest/pages/about`. الموقع يعرضها أسفل صفحة "من نحن".
لا حاجة لأي معالجة خاصة أو تكرار للمحتوى: هي مجرد صف عادي في `page_sections`
قيمة `page_id` فيه تشير إلى صفحة `about`.

صفحة `privacy` منفصلة تماماً ولها قسمها ومحتواها المستقل.
