<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@karbala-stats.iq'],
            [
                'name'     => 'مدير النظام',
                'name_ar'  => 'مدير النظام',
                'name_en'  => 'System Administrator',
                'password' => bcrypt('Admin@Karbala2024'),
                'role'     => 'superadmin',
                'is_active'=> true,
            ]
        );

        $user->assignRole('superadmin');
    }
}
