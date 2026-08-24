<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('indicators', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 300);
            $table->string('name_en', 300)->nullable();
            $table->string('slug', 310)->unique()->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('unit_ar', 100)->nullable();
            $table->string('unit_en', 100)->nullable();
            $table->string('source', 255)->nullable();
            $table->text('methodology_ar')->nullable();
            $table->decimal('latest_value', 20, 4)->nullable();
            $table->string('latest_period', 50)->nullable();
            $table->enum('trend', ['up', 'down', 'stable'])->default('stable');
            $table->decimal('change_percentage', 8, 2)->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('indicators'); }
};
