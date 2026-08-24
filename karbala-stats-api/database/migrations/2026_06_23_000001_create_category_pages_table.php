<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('category_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->unique()->constrained('categories')->cascadeOnDelete();
            $table->string('title_ar', 300);
            $table->string('title_en', 300)->nullable();
            $table->longText('summary_ar')->nullable();
            $table->longText('body_ar')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_pages');
    }
};
