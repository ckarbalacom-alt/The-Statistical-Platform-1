<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name_ar',    'value' => 'المنصة الإحصائية - مركز كربلاء للدراسات والبحوث',                          'type' => 'text',    'group' => 'general'],
            ['key' => 'site_name_en',    'value' => 'Statistical Platform - Karbala Center for Studies and Research',            'type' => 'text',    'group' => 'general'],
            ['key' => 'about_ar',        'value' => 'مركز كربلاء للدراسات والبحوث هو مؤسسة أكاديمية متخصصة في جمع وتحليل ونشر البيانات الإحصائية لمحافظة كربلاء المقدسة.', 'type' => 'text', 'group' => 'general'],
            ['key' => 'contact_email',   'value' => 'info@karbala-stats.iq',                                                     'type' => 'text',    'group' => 'contact'],
            ['key' => 'contact_phone',   'value' => '+964-32-000000',                                                            'type' => 'text',    'group' => 'contact'],
            ['key' => 'contact_address', 'value' => 'كربلاء المقدسة، مركز كربلاء للدراسات والبحوث',                            'type' => 'text',    'group' => 'contact'],
            ['key' => 'social_links',    'value' => '{"twitter":"","facebook":"","youtube":"","instagram":""}',                   'type' => 'json',    'group' => 'social'],
            ['key' => 'footer_text',     'value' => 'جميع الحقوق محفوظة © ' . date('Y') . ' مركز كربلاء للدراسات والبحوث',    'type' => 'text',    'group' => 'general'],
            ['key' => 'maintenance_mode','value' => 'false',                                                                     'type' => 'boolean', 'group' => 'general'],
        ];

        foreach ($settings as $s) {
            Setting::firstOrCreate(['key' => $s['key']], $s);
        }
    }
}
