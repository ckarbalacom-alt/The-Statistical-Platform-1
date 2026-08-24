<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class SiteCategorySeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['title' => 'الصفحة الرئيسية', 'slug' => 'home', 'children' => [
                ['title' => 'البيانات الصحفية', 'slug' => 'press-releases'],
                ['title' => 'آخر الأخبار والنشاطات', 'slug' => 'latest-news-activities'],
                ['title' => 'الإنفوجراف', 'slug' => 'infographics'],
                ['title' => 'الإصدارات', 'slug' => 'publications'],
                ['title' => 'التعاقدات وأسماء الشركات والمشاريع', 'slug' => 'contracts-companies-projects'],
                ['title' => 'المؤشرات الرئيسية', 'slug' => 'main-indicators'],
                ['title' => 'الإحصاءات حسب السنوات', 'slug' => 'statistics-by-year', 'children' => [
                    ['title' => 'إحصاءات 2020', 'slug' => 'statistics-2020'],
                    ['title' => 'إحصاءات 2019', 'slug' => 'statistics-2019'],
                ]],
                ['title' => 'منصة أهداف التنمية المستدامة', 'slug' => 'sdg-platform'],
                ['title' => 'الإحصاءات حسب الترتيب الأبجدي', 'slug' => 'statistics-a-z'],
            ]],
            ['title' => 'عن الهيئة', 'slug' => 'about-authority', 'children' => [
                ['title' => 'من نحن', 'slug' => 'who-we-are'],
                ['title' => 'بروشور', 'slug' => 'brochure'],
            ]],
            ['title' => 'الخدمات الإلكترونية', 'slug' => 'e-services', 'children' => [
                ['title' => 'الاستفسارات والاتصال بنا', 'slug' => 'contact-inquiries'],
                ['title' => 'نموذج طلب البيانات الإحصائية', 'slug' => 'statistical-data-request-form'],
            ]],
            ['title' => 'مركز التدريب والبحوث الإحصائية', 'slug' => 'training-research-center', 'children' => [
                ['title' => 'نبذة ومهام المركز', 'slug' => 'center-about-tasks'],
                ['title' => 'الدورات التدريبية 2026', 'slug' => 'training-courses-2026'],
                ['title' => 'الدورات التدريبية 2025', 'slug' => 'training-courses-2025'],
                ['title' => 'قطاع التدريب', 'slug' => 'training-sector'],
                ['title' => 'الندوات والحلقات النقاشية', 'slug' => 'seminars-panels'],
                ['title' => 'الدراسات والبحوث المنجزة', 'slug' => 'completed-studies-research'],
                ['title' => 'الفعاليات الشهرية', 'slug' => 'monthly-events'],
                ['title' => 'الإنجازات السنوية', 'slug' => 'annual-achievements'],
                ['title' => 'الاجتماعات عن بعد', 'slug' => 'remote-meetings'],
                ['title' => 'التدريب الصيفي', 'slug' => 'summer-training'],
            ]],
            ['title' => 'مركز النشر والترويج', 'slug' => 'publishing-promotion-center', 'children' => [
                ['title' => 'آخر أخبار الهيئة', 'slug' => 'authority-latest-news'],
            ]],
            ['title' => 'الأدلة والمعايير والتصانيف', 'slug' => 'guides-standards-classifications', 'children' => [
                ['title' => 'أدلة النوع الاجتماعي', 'slug' => 'gender-guides'],
                ['title' => 'دليل البيان الصحفي', 'slug' => 'press-release-guide'],
                ['title' => 'دليل التقارير الإحصائية', 'slug' => 'statistical-reports-guide'],
                ['title' => 'سياسة نشر البيانات', 'slug' => 'data-dissemination-policy'],
                ['title' => 'الإطار العام للبيانات الوصفية', 'slug' => 'metadata-framework'],
            ]],
            ['title' => 'البيانات الوصفية', 'slug' => 'metadata', 'children' => [
                ['title' => 'الزراعة', 'slug' => 'metadata-agriculture'],
                ['title' => 'الصناعة', 'slug' => 'metadata-industry'],
                ['title' => 'التجارة الداخلية', 'slug' => 'metadata-internal-trade'],
                ['title' => 'النقل', 'slug' => 'metadata-transport'],
                ['title' => 'الحسابات القومية', 'slug' => 'metadata-national-accounts'],
                ['title' => 'التربية والتعليم', 'slug' => 'metadata-education'],
                ['title' => 'الاتصالات', 'slug' => 'metadata-communications'],
                ['title' => 'البيئة', 'slug' => 'metadata-environment'],
                ['title' => 'التنمية البشرية', 'slug' => 'metadata-human-development'],
            ]],
            ['title' => 'المواضيع الإحصائية', 'slug' => 'statistical-topics', 'children' => [
                ['title' => 'الزراعة', 'slug' => 'topic-agriculture'],
                ['title' => 'الصناعة', 'slug' => 'topic-industry'],
                ['title' => 'البناء والتشييد', 'slug' => 'topic-construction'],
                ['title' => 'التجارة الخارجية', 'slug' => 'topic-foreign-trade'],
                ['title' => 'التجارة الداخلية', 'slug' => 'topic-internal-trade'],
                ['title' => 'السياحة', 'slug' => 'topic-tourism'],
                ['title' => 'النقل', 'slug' => 'topic-transport'],
                ['title' => 'الحسابات القومية', 'slug' => 'topic-national-accounts'],
                ['title' => 'التربية والتعليم', 'slug' => 'topic-education'],
                ['title' => 'السكان والمساكن والتعداد', 'slug' => 'topic-population-housing-census'],
                ['title' => 'التكنولوجيا والاتصالات', 'slug' => 'topic-technology-communications'],
                ['title' => 'أحوال المعيشة', 'slug' => 'topic-living-conditions'],
                ['title' => 'البيئة', 'slug' => 'topic-environment'],
                ['title' => 'الأسعار والأرقام القياسية والتضخم', 'slug' => 'topic-prices-indices-inflation'],
                ['title' => 'التنمية البشرية والنوع الاجتماعي', 'slug' => 'topic-human-development-gender'],
                ['title' => 'الرعاية الاجتماعية', 'slug' => 'topic-social-care'],
                ['title' => 'النازحين', 'slug' => 'topic-displaced-people'],
                ['title' => 'المسوحات الإحصائية', 'slug' => 'topic-statistical-surveys'],
            ]],
            ['title' => 'صفحات مساعدة', 'slug' => 'help-pages', 'children' => [
                ['title' => 'أسئلة متكررة', 'slug' => 'faq'],
                ['title' => 'روابط ذات صلة', 'slug' => 'related-links'],
                ['title' => 'بريد الإحصاء', 'slug' => 'statistics-mail'],
            ]],
        ];

        $this->seedItems($items);
    }

    private function seedItems(array $items, ?int $parentId = null): void
    {
        foreach ($items as $index => $item) {
            $category = Category::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'name_ar' => $item['title'],
                    'name_en' => $item['name_en'] ?? null,
                    'description_ar' => $item['description_ar'] ?? null,
                    'icon' => $parentId === null ? 'SiteSection' : ($item['icon'] ?? 'FolderTree'),
                    'parent_id' => $parentId,
                    'display_order' => $index + 1,
                    'is_active' => true,
                ],
            );

            if (!empty($item['children'])) {
                $this->seedItems($item['children'], $category->id);
            }
        }
    }
}
