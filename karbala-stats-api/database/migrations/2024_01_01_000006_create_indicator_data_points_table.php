<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('indicator_data_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('indicator_id')->constrained()->cascadeOnDelete();
            $table->enum('period_type', ['yearly', 'quarterly', 'monthly']);
            $table->string('period_label', 50);
            $table->integer('period_sort')->nullable()->index();
            $table->decimal('value', 20, 4);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['indicator_id', 'period_label']);
        });
    }

    public function down(): void { Schema::dropIfExists('indicator_data_points'); }
};
