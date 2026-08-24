<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('statistical_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_code', 20)->unique()->nullable();
            $table->string('requester_name', 200);
            $table->string('requester_email', 191);
            $table->string('requester_phone', 30)->nullable();
            $table->string('requester_organization', 300)->nullable();
            $table->enum('request_type', ['data', 'report', 'consultation', 'partnership']);
            $table->longText('description');
            $table->enum('status', ['pending', 'processing', 'completed', 'rejected'])->default('pending')->index();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('statistical_requests'); }
};
