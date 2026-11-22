<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DisponibilidadService;
use Illuminate\Http\Request;

class DisponibilidadController extends Controller
{
    public function __construct(
        private DisponibilidadService $service
    ) {}

    public function index(Request $request, string $id)
    {
        $datos = $request->validate([
            'fecha' => 'required|date_format:Y-m-d'
        ]);

        return response()->json(
            $this->service->consultar($id, $datos['fecha'])
        );
    }
}