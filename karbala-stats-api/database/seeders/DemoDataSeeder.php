<?php

namespace Database\Seeders;

use App\Models\Indicator;
use App\Models\IndicatorDataPoint;
use App\Models\NewsArticle;
use App\Models\Publication;
use App\Models\StatisticalCalendar;
use App\Models\StatisticalRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = User::first()->id;

        $this->seedPublications($adminId);
        $this->seedIndicators($adminId);
        $this->seedNews($adminId);
        $this->seedRequests();
        $this->seedCalendar();
    }

    private function seedPublications(int $adminId): void
    {
        $publications = [
            ['title_ar' => 'النشرة الإحصائية السنوية لمحافظة كربلاء 2023',      'category_id' => 1,  'stat_year' => 2023, 'downloads' => 342],
            ['title_ar' => 'مسح القوى العاملة في محافظة كربلاء 2023',            'category_id' => 3,  'stat_year' => 2023, 'downloads' => 187],
            ['title_ar' => 'الإحصاء الزراعي السنوي لمحافظة كربلاء 2022',         'category_id' => 6,  'stat_year' => 2022, 'downloads' => 210],
            ['title_ar' => 'إحصاءات الصحة والمستشفيات 2023',                     'category_id' => 4,  'stat_year' => 2023, 'downloads' => 455],
            ['title_ar' => 'التقرير الاقتصادي لمحافظة كربلاء 2022',              'category_id' => 2,  'stat_year' => 2022, 'downloads' => 298],
            ['title_ar' => 'إحصاءات التعليم والمدارس 2023-2024',                  'category_id' => 5,  'stat_year' => 2024, 'downloads' => 376],
            ['title_ar' => 'بيانات السياحة الدينية والزيارات 2023',               'category_id' => 10, 'stat_year' => 2023, 'downloads' => 891],
            ['title_ar' => 'مؤشرات الأسعار ومعدل التضخم 2023',                   'category_id' => 11, 'stat_year' => 2023, 'downloads' => 264],
            ['title_ar' => 'إحصاءات الإسكان والتعداد السكاني 2020',               'category_id' => 12, 'stat_year' => 2020, 'downloads' => 519],
            ['title_ar' => 'التقرير الربعي للنشاط الاقتصادي الربع الأول 2024',    'category_id' => 2,  'stat_year' => 2024, 'downloads' => 143],
            ['title_ar' => 'إحصاءات البيئة والمياه 2022',                         'category_id' => 7,  'stat_year' => 2022, 'downloads' => 132],
            ['title_ar' => 'مؤشرات الطاقة والكهرباء في المحافظة 2023',            'category_id' => 8,  'stat_year' => 2023, 'downloads' => 178],
        ];

        foreach ($publications as $pub) {
            Publication::create([
                'title_ar'        => $pub['title_ar'],
                'title_en'        => null,
                'slug'            => Str::slug($pub['title_ar'] . '-' . $pub['stat_year']),
                'category_id'     => $pub['category_id'],
                'description_ar'  => 'يتضمن هذا الإصدار أحدث البيانات والإحصاءات المتعلقة بمحافظة كربلاء المقدسة، ويشمل مؤشرات تفصيلية وتحليلات معمّقة تُعنى بالتخطيط والتنمية.',
                'stat_year'       => $pub['stat_year'],
                'status'          => 'published',
                'is_featured'     => in_array($pub['category_id'], [1, 4, 10]),
                'views_count'     => rand(500, 3000),
                'downloads_count' => $pub['downloads'],
                'release_date'    => now()->subDays(rand(10, 400))->toDateString(),
                'published_at'    => now()->subDays(rand(10, 400)),
                'file_type'       => 'pdf',
                'file_size'       => rand(800000, 8000000),
                'created_by'      => $adminId,
            ]);
        }
    }

    private function seedIndicators(int $adminId): void
    {
        $indicators = [
            [
                'name_ar'     => 'عدد السكان',
                'unit_ar'     => 'نسمة',
                'category_id' => 1,
                'is_featured' => true,
                'points'      => [
                    [2018, 1200000], [2019, 1240000], [2020, 1280000],
                    [2021, 1320000], [2022, 1365000], [2023, 1412000],
                ],
            ],
            [
                'name_ar'     => 'معدل البطالة',
                'unit_ar'     => '%',
                'category_id' => 3,
                'is_featured' => true,
                'points'      => [
                    [2018, 12.4], [2019, 11.8], [2020, 14.2],
                    [2021, 13.6], [2022, 12.1], [2023, 11.3],
                ],
            ],
            [
                'name_ar'     => 'عدد الزوار الدينيين السنوياً',
                'unit_ar'     => 'زائر',
                'category_id' => 10,
                'is_featured' => true,
                'points'      => [
                    [2018, 14000000], [2019, 17500000], [2020, 3200000],
                    [2021, 8900000],  [2022, 19400000], [2023, 22000000],
                ],
            ],
            [
                'name_ar'     => 'معدل التضخم السنوي',
                'unit_ar'     => '%',
                'category_id' => 11,
                'is_featured' => false,
                'points'      => [
                    [2018, 2.1], [2019, 1.8], [2020, 3.4],
                    [2021, 6.2], [2022, 5.4], [2023, 4.1],
                ],
            ],
            [
                'name_ar'     => 'عدد المستشفيات العامة',
                'unit_ar'     => 'مستشفى',
                'category_id' => 4,
                'is_featured' => false,
                'points'      => [
                    [2018, 14], [2019, 15], [2020, 16],
                    [2021, 16], [2022, 18], [2023, 19],
                ],
            ],
            [
                'name_ar'     => 'عدد الطلاب في المدارس الحكومية',
                'unit_ar'     => 'طالب',
                'category_id' => 5,
                'is_featured' => false,
                'points'      => [
                    [2018, 280000], [2019, 294000], [2020, 301000],
                    [2021, 315000], [2022, 328000], [2023, 342000],
                ],
            ],
            [
                'name_ar'     => 'الناتج المحلي الإجمالي للمحافظة',
                'unit_ar'     => 'مليار دينار',
                'category_id' => 2,
                'is_featured' => true,
                'points'      => [
                    [2018, 4200], [2019, 4650], [2020, 3900],
                    [2021, 4400], [2022, 5100], [2023, 5800],
                ],
            ],
            [
                'name_ar'     => 'الإنتاج الزراعي',
                'unit_ar'     => 'طن',
                'category_id' => 6,
                'is_featured' => false,
                'points'      => [
                    [2018, 180000], [2019, 195000], [2020, 172000],
                    [2021, 188000], [2022, 204000], [2023, 219000],
                ],
            ],
        ];

        foreach ($indicators as $ind) {
            $indicator = Indicator::create([
                'name_ar'     => $ind['name_ar'],
                'unit_ar'     => $ind['unit_ar'],
                'category_id' => $ind['category_id'],
                'is_featured' => $ind['is_featured'],
                'is_active'   => true,
                'source'      => 'مركز كربلاء للدراسات والبحوث',
            ]);

            foreach ($ind['points'] as $i => [$year, $value]) {
                IndicatorDataPoint::create([
                    'indicator_id' => $indicator->id,
                    'period_type'  => 'yearly',
                    'period_label' => (string) $year,
                    'period_sort'  => $year,
                    'value'        => $value,
                ]);
            }

            $indicator->updateLatestStats();
        }
    }

    private function seedNews(int $adminId): void
    {
        $articles = [
            [
                'title_ar'     => 'إطلاق النشرة الإحصائية الشاملة لعام 2023',
                'body_ar'      => 'أعلن مركز كربلاء للدراسات والبحوث عن إطلاق النشرة الإحصائية الشاملة لعام 2023، والتي تتضمن بيانات تفصيلية حول جميع القطاعات الحيوية في المحافظة. تُعدّ هذه النشرة مرجعاً أساسياً للباحثين وصانعي القرار والمخططين.',
                'article_type' => 'announcement',
                'is_featured'  => true,
                'tags'         => ['إحصاء', 'كربلاء', '2023'],
                'days_ago'     => 5,
            ],
            [
                'title_ar'     => 'ارتفاع أعداد الزوار الدينيين إلى 22 مليون زائر في 2023',
                'body_ar'      => 'كشفت أحدث الإحصاءات الصادرة عن مركز كربلاء للدراسات والبحوث أن أعداد الزوار الدينيين لمحافظة كربلاء المقدسة بلغت نحو 22 مليون زائر خلال عام 2023، بارتفاع ملحوظ مقارنةً بالعام السابق. ويُشير المركز إلى أن هذا الرقم القياسي يعكس الأهمية الدينية والروحية التي تحتلها المحافظة.',
                'article_type' => 'news',
                'is_featured'  => true,
                'tags'         => ['سياحة دينية', 'زيارات', 'إحصاء'],
                'days_ago'     => 12,
            ],
            [
                'title_ar'     => 'ورشة عمل حول منهجيات جمع البيانات الإحصائية',
                'body_ar'      => 'نظّم مركز كربلاء للدراسات والبحوث ورشة عمل متخصصة تناولت أحدث المنهجيات والأساليب العلمية في جمع وتحليل البيانات الإحصائية. شارك في الورشة نخبة من الخبراء والمختصين في مجال الإحصاء التطبيقي.',
                'article_type' => 'event',
                'is_featured'  => false,
                'tags'         => ['ورشة عمل', 'إحصاء', 'تدريب'],
                'days_ago'     => 20,
            ],
            [
                'title_ar'     => 'انخفاض معدل البطالة إلى 11.3% في محافظة كربلاء',
                'body_ar'      => 'أظهرت نتائج مسح القوى العاملة الأخير الذي أجراه مركز كربلاء للدراسات والبحوث انخفاضاً ملموساً في معدل البطالة ليصل إلى 11.3% خلال عام 2023. ويُعزى هذا التحسن إلى تنامي فرص العمل في قطاعات السياحة والخدمات والبناء.',
                'article_type' => 'news',
                'is_featured'  => false,
                'tags'         => ['سوق العمل', 'بطالة', 'اقتصاد'],
                'days_ago'     => 30,
            ],
            [
                'title_ar'     => 'إعلان عن فتح باب التقدم لطلبات البيانات الإحصائية',
                'body_ar'      => 'يُعلن مركز كربلاء للدراسات والبحوث عن فتح باب التقدم لطلبات البيانات الإحصائية المخصصة للباحثين والمؤسسات الأكاديمية والجهات الحكومية. يمكن تقديم الطلبات عبر المنصة الإلكترونية طوال أيام الأسبوع.',
                'article_type' => 'announcement',
                'is_featured'  => false,
                'tags'         => ['طلبات', 'بيانات', 'خدمات'],
                'days_ago'     => 45,
            ],
            [
                'title_ar'     => 'نمو الناتج المحلي الإجمالي لكربلاء بنسبة 13.7%',
                'body_ar'      => 'رصد المركز نمواً لافتاً في الناتج المحلي الإجمالي لمحافظة كربلاء بلغت نسبته 13.7% مقارنةً بعام 2022، مدفوعاً بتوسع القطاع السياحي وتحسّن الأوضاع الأمنية وزيادة الاستثمارات المحلية والأجنبية.',
                'article_type' => 'news',
                'is_featured'  => true,
                'tags'         => ['اقتصاد', 'ناتج محلي', 'نمو'],
                'days_ago'     => 60,
            ],
            [
                'title_ar'     => 'مؤتمر الإحصاء والتخطيط في المحافظات العراقية',
                'body_ar'      => 'يستضيف مركز كربلاء للدراسات والبحوث مؤتمراً إحصائياً بارزاً يجمع خبراء الإحصاء والتخطيط من مختلف المحافظات العراقية، بهدف تبادل الخبرات والتجارب وتعزيز منظومة العمل الإحصائي على المستوى الوطني.',
                'article_type' => 'event',
                'is_featured'  => false,
                'tags'         => ['مؤتمر', 'إحصاء', 'عراق'],
                'days_ago'     => 8,
            ],
            [
                'title_ar'     => 'ارتفاع أعداد الطلاب في المدارس الحكومية لعام 2023',
                'body_ar'      => 'سجّلت إحصاءات التعليم لعام 2023 ارتفاعاً في أعداد الطلاب الملتحقين بالمدارس الحكومية في محافظة كربلاء، إذ بلغ إجماليهم نحو 342 ألف طالب وطالبة، بزيادة 4.3% عن العام الدراسي السابق.',
                'article_type' => 'news',
                'is_featured'  => false,
                'tags'         => ['تعليم', 'مدارس', 'كربلاء'],
                'days_ago'     => 90,
            ],
        ];

        foreach ($articles as $art) {
            NewsArticle::create([
                'title_ar'     => $art['title_ar'],
                'body_ar'      => $art['body_ar'],
                'article_type' => $art['article_type'],
                'is_featured'  => $art['is_featured'],
                'tags'         => $art['tags'],
                'author_id'    => User::first()->id,
                'published_at' => now()->subDays($art['days_ago']),
                'views_count'  => rand(80, 1200),
                'slug'         => Str::slug($art['title_ar']) . '-' . rand(100, 999),
            ]);
        }
    }

    private function seedRequests(): void
    {
        $requests = [
            ['name' => 'د. أحمد الموسوي',    'email' => 'ahmed@uokerbala.edu.iq',  'type' => 'report',       'status' => 'completed', 'desc' => 'أطلب تقريراً إحصائياً مفصلاً عن معدلات النمو السكاني في محافظة كربلاء للفترة من 2010 إلى 2023 لأغراض بحثية أكاديمية.'],
            ['name' => 'م. فاطمة الزهراء',   'email' => 'fatima.plan@karbala.gov.iq','type' => 'data',        'status' => 'processing','desc' => 'نحتاج بيانات إحصائية تفصيلية حول التوزيع الجغرافي للمشاريع الاستثمارية في المحافظة لدعم خطة التنمية الاقتصادية.'],
            ['name' => 'الباحث علي الكعبي',  'email' => 'ali.research@gmail.com',  'type' => 'consultation', 'status' => 'pending',   'desc' => 'أرغب في الاستفادة من خبرة المركز في منهجيات جمع البيانات وتحليلها لإعداد أطروحة دكتوراه حول التنمية الاقتصادية المحلية.'],
            ['name' => 'شركة الرافدين للاستشارات','email' => 'info@rafidain.iq',   'type' => 'partnership', 'status' => 'pending',   'desc' => 'نسعى إلى إقامة شراكة استراتيجية مع المركز في مجال إجراء الدراسات الاقتصادية والاجتماعية المشتركة.'],
            ['name' => 'أ. زينب الحسيني',    'email' => 'zainab.h@ministry.iq',   'type' => 'data',         'status' => 'completed', 'desc' => 'نطلب بيانات مفصلة حول إحصاءات قطاع الصحة ومستوى الخدمات الطبية في المحافظة للفترة 2020-2023.'],
            ['name' => 'جامعة كربلاء',       'email' => 'research@uokerbala.edu.iq','type' => 'report',      'status' => 'rejected',  'desc' => 'نطلب إعداد تقرير مقارن بين محافظة كربلاء وعدد من المحافظات العراقية في المؤشرات الاجتماعية والاقتصادية.'],
        ];

        foreach ($requests as $i => $req) {
            $r = StatisticalRequest::create([
                'requester_name'  => $req['name'],
                'requester_email' => $req['email'],
                'request_type'    => $req['type'],
                'status'          => $req['status'],
                'description'     => $req['desc'],
                'created_at'      => now()->subDays(rand(5, 90)),
            ]);
            $r->request_code = 'REQ-' . date('Y') . '-' . str_pad($r->id, 4, '0', STR_PAD_LEFT);
            $r->save();
        }
    }

    private function seedCalendar(): void
    {
        $events = [
            ['title_ar' => 'إصدار التقرير الربعي الثاني 2024',       'category' => 'الاقتصاد',       'days' => 15,  'status' => 'scheduled'],
            ['title_ar' => 'نشر إحصاءات السياحة الدينية — ربع أول', 'category' => 'السياحة',        'days' => 22,  'status' => 'scheduled'],
            ['title_ar' => 'الإعلان عن نتائج مسح القوى العاملة',     'category' => 'سوق العمل',      'days' => 38,  'status' => 'scheduled'],
            ['title_ar' => 'إصدار مؤشرات الأسعار — مايو 2024',       'category' => 'الأسعار',        'days' => 7,   'status' => 'scheduled'],
            ['title_ar' => 'إصدار إحصاءات التعليم 2023-2024',        'category' => 'التعليم',        'days' => -10, 'status' => 'released'],
            ['title_ar' => 'نشر إحصاءات الصحة الشهرية — أبريل',     'category' => 'الصحة',          'days' => -5,  'status' => 'released'],
            ['title_ar' => 'التقرير السنوي الشامل 2023',              'category' => 'عام',            'days' => 60,  'status' => 'scheduled'],
            ['title_ar' => 'إحصاءات البيئة والمياه — النصف الأول',   'category' => 'البيئة',         'days' => 45,  'status' => 'scheduled'],
        ];

        foreach ($events as $ev) {
            StatisticalCalendar::create([
                'title_ar'           => $ev['title_ar'],
                'indicator_category' => $ev['category'],
                'release_date'       => now()->addDays($ev['days'])->toDateString(),
                'release_time'       => '09:00:00',
                'status'             => $ev['status'],
            ]);
        }
    }
}
