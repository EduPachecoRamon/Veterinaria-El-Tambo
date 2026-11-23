<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\Producto;
use App\Models\Veterinario;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function resumen(Request $request)
    {
        $hoy = CarbonImmutable::now('America/Lima');
        $inicio = $hoy->startOfDay()->utc();
        $fin = $hoy->endOfDay()->utc();
        $posterior = $hoy->addDays(7)->endOfDay()->utc();

        $porEstado = [];
        foreach (['confirmada', 'cancelada', 'en_curso', 'completada'] as $estado) {
            $porEstado[$estado] = Cita::query()->where('estado', $estado)->count();
        }

        return response()->json([
            'productos' => Producto::query()->count(),
            'productosPublicados' => Producto::query()->where('activo', true)->count(),
            'veterinarios' => Veterinario::query()->where('activo', true)->count(),
            'citasTotales' => Cita::query()->count(),
            'citasHoy' => Cita::query()->where('fechaHoraUtc', '>=', $inicio)->where('fechaHoraUtc', '<=', $fin)->whereIn('estado', ['confirmada', 'en_curso'])->count(),
            'proximosSieteDias' => Cita::query()->where('fechaHoraUtc', '>=', $inicio)->where('fechaHoraUtc', '<=', $posterior)->where('estado', 'confirmada')->count(),
            'porEstado' => $porEstado,
            'generadoEn' => $hoy->toIso8601String()
        ]);
    }

    public function agenda(Request $request)
    {
        $input = $request->validate([
            'fecha' => 'sometimes|date_format:Y-m-d'
        ]);
        $fecha = CarbonImmutable::parse(($input['fecha'] ?? CarbonImmutable::now('America/Lima')->format('Y-m-d')), 'America/Lima');
        $inicio = $fecha->startOfDay()->utc();
        $fin = $fecha->endOfDay()->utc();

        $citas = Cita::query()->where('fechaHoraUtc', '>=', $inicio)
            ->where('fechaHoraUtc', '<=', $fin)
            ->orderBy('fechaHoraUtc', 'asc')->limit(80)->get();

        return response()->json(['fecha' => $fecha->format('Y-m-d'), 'data' => $citas->map(fn($c) => [
            'id' => (string) $c->getKey(),
            'mascota' => (string) $c->mascota,
            'especie' => (string) $c->especie,
            'propietario' => (string) $c->propietario,
            'motivo' => (string) $c->motivo,
            'estado' => (string) $c->estado,
            'fechaHora' => $c->fechaHoraUtc?->toIso8601String(),
            'tieneFoto' => !empty($c->fotoId)
        ])->values()]);
    }
}
