<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CitaService;
use Illuminate\Http\Request;

class CitaController extends Controller
{
    public function __construct(
        private CitaService $service
    ) {}

    public function index(Request $request)
    {
        $data = $request->validate([
            'page' => 'sometimes|integer|min:1|max:10000',
            'perPage' => 'sometimes|integer|min:1|max:25',
            'periodo' => 'sometimes|in:todas,proximas,anteriores'
        ]);

        return response()->json(
            $this->service->listar(
                $request->attributes->get('firebase_uid'),
                $data['periodo'] ?? 'todas',
                (int) ($data['page'] ?? 1),
                (int) ($data['perPage'] ?? 10)
            )
        );
    }

    public function store(Request $request)
    {
        return response()->json([
            'data' => $this->service->crear(
                $request->attributes->get('firebase_uid'),
                $this->validar($request)
            )
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        return response()->json([
            'data' => $this->service->editar(
                $request->attributes->get('firebase_uid'),
                $id,
                $this->validar($request)
            )
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $this->service->borrar(
            $request->attributes->get('firebase_uid'),
            $id
        );

        return response()->json([
            'message' => 'Cita cancelada.'
        ]);
    }

    private function validar(Request $request): array
    {
        return $request->validate([
            'propietario' => 'required|string|min:3|max:80',
            'mascota' => 'required|string|min:2|max:60',
            'especie' => 'required|in:Perro,Gato,Otro',
            'motivo' => 'required|string|min:3|max:160',
            'fechaHora' => 'required|date|after:now',
            'veterinarioId' => [
                'required',
                'string',
                'regex:/^[a-fA-F0-9]{24}$/'
            ]
        ]);
    }
}