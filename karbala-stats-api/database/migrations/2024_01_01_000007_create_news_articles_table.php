<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('news_articles', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar', 500);
            $table->string('title_en', 500)->nullable();
            $table->string('slug', 510)->unique();
            $table->longText('body_ar')->nullable();
            $table->longText('body_en')->nullable();
            $table->string('thumbnail')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('article_type', ['news', 'event', 'announcement'])->default('news')->index();
            $table->json('tags')->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->unsignedInteger('views_count')->default(0);
            $table->dateTime('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void { Schema::dropIfExists('news_articles'); }
};
