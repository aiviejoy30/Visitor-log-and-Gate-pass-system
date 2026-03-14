<?php

use App\Http\Controllers\VisitorController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\QRController; 
use Inertia\Inertia;

// Welcome Page (React Inertia)
Route::get('/scanner', function () {
    return inertia::render('Scanner');
})->name('scanner');

Route::post('/scan-visitor',[QRController::class, 'scan']);

Route::inertia('/', 'welcome',[
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // Guard Dashboard
    Route::get('/dashboard', [VisitorController::class, 'dashboard'])->name('dashboard');

    // Show Visitor Registration Form
    Route::get('/visitor/register',[VisitorController::class, 'create'])->name('visitor.register');

    // Store Visitor
    Route::post('/visitor/store', [VisitorController::class, 'store'])->name('visitor.store');

    // Success Page (QR Page)
    Route::get('/visitor/success/{id}', [VisitorController::class, 'success'])->name('visitor.success');

    // ✅ ITO ANG SOLUSYON SA 404 ERROR (Edit at Delete Routes)
    Route::put('/visitor/{id}', [VisitorController::class, 'update'])->name('visitor.update');
    Route::delete('/visitor/{id}', [VisitorController::class, 'destroy'])->name('visitor.destroy');
});

require __DIR__.'/settings.php';
