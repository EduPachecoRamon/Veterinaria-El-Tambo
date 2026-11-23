<?php

use App\Http\Controllers\Api\AdminVeterinarioController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\FotoCitaController;
use App\Http\Controllers\Api\DisponibilidadController;
use App\Http\Controllers\Api\EstadisticaController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\VeterinarioController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/salud', fn () => response()->json(['estado' => 'activo', 'servicio' => 'Laravel']));
Route::middleware('throttle:60,1')->get('/productos', [ProductoController::class, 'index']);

Route::middleware(['firebase', 'throttle:60,1'])->group(function () {
    Route::get('/yo', function (Request $request) {
        $uid = $request->attributes->get('firebase_uid');
        $administradores = array_filter(array_map('trim', explode(',', (string) config('services.clinica.admin_uids', ''))));
        return response()->json(['rol' => in_array($uid, $administradores, true) ? 'administrador' : 'cliente']);
    });
    Route::get('/citas', [CitaController::class, 'index']);
    Route::post('/citas', [CitaController::class, 'store']);
    Route::put('/citas/{id}', [CitaController::class, 'update']);
    Route::delete('/citas/{id}', [CitaController::class, 'destroy']);
    Route::get('/veterinarios', [VeterinarioController::class, 'index']);
    Route::get('/veterinarios/{id}/disponibilidad', [DisponibilidadController::class, 'index']);
    Route::get('/estadisticas', [EstadisticaController::class, 'index']);
    Route::post('/citas/{id}/foto', [FotoCitaController::class, 'store'])->middleware('throttle:10,1');
    Route::get('/citas/{id}/foto', [FotoCitaController::class, 'show']);
    Route::delete('/citas/{id}/foto', [FotoCitaController::class, 'destroy']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/resumen', [AdminDashboardController::class, 'resumen']);
        Route::get('/agenda', [AdminDashboardController::class, 'agenda']);
        Route::get('/citas/{id}/foto', [FotoCitaController::class, 'showAdmin']);
        Route::get('/productos', [ProductoController::class, 'adminIndex']);
        Route::post('/productos', [ProductoController::class, 'store']);
        Route::put('/productos/{id}', [ProductoController::class, 'update']);
        Route::delete('/productos/{id}', [ProductoController::class, 'destroy']);
        Route::get('/veterinarios', [AdminVeterinarioController::class, 'index']);
        Route::post('/veterinarios', [AdminVeterinarioController::class, 'store']);
        Route::put('/veterinarios/{id}', [AdminVeterinarioController::class, 'update']);
        Route::put('/veterinarios/{id}/horarios/{dia}', [AdminVeterinarioController::class, 'horario'])->whereNumber('dia');
    });
});
