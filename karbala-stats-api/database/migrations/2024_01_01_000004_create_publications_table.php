<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar', 500);
            $table->string('title_en', 500)->nullable();
            $table->string('slug', 510)->unique();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->longText('description_ar')->nullable();
            $table->longText('description_en')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('file_path')->nullable();
            $table->enum('file_type', ['pdf', 'xlsx', 'xls', 'csv'])->nullable();
            $table->bigInteger('file_size')->unsigned()->nullable();
            $table->year('stat_year')->nullable()->index();
            $table->tinyInteger('stat_quarter')->unsigned()->nullable();
            $table->date('release_date')->nullable()->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('downloads_count')->default(0);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        DB::statement('ALTER TABLE publications ADD FULLTEXT ft_publications (title_ar, title_en, description_ar)');
    }

    public function down(): void { Schema::dropIfExists('publications'); }
};
