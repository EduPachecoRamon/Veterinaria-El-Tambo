<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EstadisticaController extends Controller
{
    public function index(Request $request)
    {
        $base = trim((string) config('services.clinica.spring_url', ''));
        $key = (string) config('services.clinica.spring_internal_key', '');

        if ($base === '' || $key === '') {
            Log::warning('Falta configurar la integración de estadísticas en Laravel.');
            return response()->json([
                'disponible' => false,
                'mensaje' => 'Las estadísticas todavía no están configuradas.'
            ]);
        }

        try {
            $response = Http::connectTimeout(10)
                ->timeout(65)
                ->acceptJson()
                ->withHeaders(['X-Internal-Key' => $key])
                ->get(rtrim($base, '/') . '/internal/estadisticas', [
                    'uid' => $request->attributes->get('firebase_uid')
                ]);

            if (!$response->successful()) {
                Log::warning('El servicio de estadísticas devolvió un error.', [
                    'status' => $response->status()
                ]);
                return response()->json([
                    'disponible' => false,
                    'mensaje' => 'Las estadísticas no están disponibles temporalmente. Vuelve a intentar.'
                ]);
            }

            $datos = $response->json();

            if (!is_array($datos) || !array_key_exists('total', $datos)) {
                throw new \UnexpectedValueException('Respuesta de estadísticas inválida.');
            }

            return response()->json(array_merge($datos, ['disponible' => true]));
        } catch (\Throwable $error) {
            Log::warning('Falló la consulta al servicio de estadísticas.', [
                'tipo' => get_class($error)
            ]);
            return response()->json([
                'disponible' => false,
                'mensaje' => 'No se pudieron cargar las estadísticas. Prueba nuevamente.'
            ]);
        }
    }
}
