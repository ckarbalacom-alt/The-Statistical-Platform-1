<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name_ar' => 'السكان والتعداد',           'name_en' => 'Population & Census',        'slug' => 'population',   'icon' => 'Users'],
            ['name_ar' => 'الاقتصاد والناتج المحلي',   'name_en' => 'Economy & GDP',              'slug' => 'economy',      'icon' => 'TrendingUp'],
            ['name_ar' => 'سوق العمل والتوظيف',        'name_en' => 'Labour Market',              'slug' => 'labour',       'icon' => 'Briefcase'],
            ['name_ar' => 'الصحة والمستشفيات',         'name_en' => 'Health & Hospitals',         'slug' => 'health',       'icon' => 'Heart'],
            ['name_ar' => 'التعليم والمدارس',           'name_en' => 'Education & Schools',        'slug' => 'education',    'icon' => 'BookOpen'],
            ['name_ar' => 'الزراعة والثروة الحيوانية', 'name_en' => 'Agriculture & Livestock',    'slug' => 'agriculture',  'icon' => 'Leaf'],
            ['name_ar' => 'البيئة والمياه',             'name_en' => 'Environment & Water',        'slug' => 'environment',  'icon' => 'Droplets'],
            ['name_ar' => 'الطاقة والكهرباء',           'name_en' => 'Energy & Electricity',       'slug' => 'energy',       'icon' => 'Zap'],
            ['name_ar' => 'المرور والنقل',              'name_en' => 'Traffic & Transport',        'slug' => 'transport',    'icon' => 'Truck'],
            ['name_ar' => 'السياحة والزيارات الدينية', 'name_en' => 'Tourism & Religious Visits', 'slug' => 'tourism',      'icon' => 'MapPin'],
            ['name_ar' => 'الأسعار ومعدل التضخم',      'name_en' => 'Prices & Inflation',         'slug' => 'prices',       'icon' => 'BarChart2'],
            ['name_ar' => 'الإسكان والعقار',            'name_en' => 'Housing & Real Estate',      'slug' => 'housing',      'icon' => 'Home'],
            ['name_ar' => 'الصناعة والتجارة',           'name_en' => 'Industry & Trade',           'slug' => 'industry',     'icon' => 'Package'],
            ['name_ar' => 'المالية العامة والميزانية',  'name_en' => 'Public Finance & Budget',    'slug' => 'finance',      'icon' => 'DollarSign'],
            ['name_ar' => 'الأحوال المدنية',            'name_en' => 'Civil Status',               'slug' => 'civil-status', 'icon' => 'FileText'],
        ];

        foreach ($categories as $i => $cat) {
            Category::firstOrCreate(
                ['slug' => $cat['slug']],
                array_merge($cat, ['display_order' => $i + 1, 'is_active' => true])
            );
        }
    }
}
