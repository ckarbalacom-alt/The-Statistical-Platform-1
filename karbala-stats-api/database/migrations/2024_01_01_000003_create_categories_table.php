<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 200);
            $table->string('name_en', 200)->nullable();
            $table->string('slug', 200)->unique();
            $table->text('description_ar')->nullable();
            $table->string('icon', 100)->nullable();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->integer('display_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->foreign('parent_id')->references('id')->on('categories')->nullOnDelete();
        });
    }

    public function down(): void { Schema::dropIfExists('categories'); }
};
