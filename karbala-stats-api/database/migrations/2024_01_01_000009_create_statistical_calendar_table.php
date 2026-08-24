<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('statistical_calendar', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar', 400);
            $table->string('title_en', 400)->nullable();
            $table->date('release_date')->index();
            $table->time('release_time')->default('09:00:00');
            $table->string('indicator_category', 200)->nullable();
            $table->text('notes_ar')->nullable();
            $table->enum('status', ['scheduled', 'released', 'delayed', 'cancelled'])->default('scheduled')->index();
            $table->foreignId('publication_id')->nullable()->constrained('publications')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('statistical_calendar'); }
};
