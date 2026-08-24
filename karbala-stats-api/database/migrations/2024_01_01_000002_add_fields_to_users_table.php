<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name_en', 150)->nullable()->after('name');
            $table->string('name_ar', 150)->nullable()->after('name');
            $table->enum('role', ['superadmin', 'admin', 'editor', 'viewer'])->default('viewer')->after('email');
            $table->string('avatar')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->tinyInteger('login_attempts')->default(0);
            $table->dateTime('locked_until')->nullable();
            $table->dateTime('last_login_at')->nullable();
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['name_en','name_ar','role','avatar','is_active','login_attempts','locked_until','last_login_at']);
        });
    }
};
