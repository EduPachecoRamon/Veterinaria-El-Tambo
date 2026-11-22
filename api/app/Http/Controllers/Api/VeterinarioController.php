<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Veterinario;

class VeterinarioController extends Controller
{
    public function index()
    {
        $veterinarios = Veterinario::query()
            ->where('activo', true)
            ->orderBy('nombre')
            ->get();

        return response()->json([
            'data' => $veterinarios->map(fn ($v) => [
                'id' => (string) $v->getKey(),
                'nombre' => $v->nombre,
                'especialidad' => $v->especialidad
            ])->values()->all()
        ]);
    }
}