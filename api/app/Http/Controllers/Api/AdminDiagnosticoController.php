<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DiagnosticoService;

class AdminDiagnosticoController extends Controller
{
    public function index(DiagnosticoService $diagnostico)
    {
        return response()->json($diagnostico->obtener());
    }
}
