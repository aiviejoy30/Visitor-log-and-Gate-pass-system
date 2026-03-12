<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('visitors', function (Blueprint $table) {
        $table->id();
        $table->string('name');
            $table->string('contact_info')->nullable(); 
        
        $table->string('purpose');
        $table->string('person_to_visit');
        $table->string('qr_code')->nullable();
        $table->timestamp('time_in')->nullable();
        $table->timestamp('time_out')->nullable();
        $table->string('status')->default('Inside');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitors');
    }
};
