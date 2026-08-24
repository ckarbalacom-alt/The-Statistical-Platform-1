<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view-dashboard', 'manage-publications', 'manage-indicators',
            'manage-requests', 'manage-users', 'manage-settings', 'view-reports', 'publish-content',
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'superadmin']);
        $admin      = Role::firstOrCreate(['name' => 'admin']);
        $editor     = Role::firstOrCreate(['name' => 'editor']);

        $superAdmin->givePermissionTo(Permission::all());
        $admin->givePermissionTo(['view-dashboard','manage-publications','manage-indicators','manage-requests','view-reports','publish-content']);
        $editor->givePermissionTo(['view-dashboard','manage-publications','manage-indicators','view-reports']);
    }
}
