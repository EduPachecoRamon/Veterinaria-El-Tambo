<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EstadisticaRespaldoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EstadisticaController extends Controller
{
    public function index(Request $request)
    {
        $uid = (string) $request->attributes->get('firebase_uid', '');
        if ($uid === '') {
            return response()->json(['message' => 'Acceso no autorizado.'], 401);
        }

        $base = trim((string) config('services.clinica.spring_url', ''));
        $key = (string) config('services.clinica.spring_internal_key', '');

        if ($base === '' || $key === '') {
            Log::warning('Spring Boot no configurado en el servicio Laravel.');
            return $this->respaldo($uid);
        }

        try {
            $response = Http::connectTimeout(8)
                ->timeout(50)
                ->acceptJson()
                ->withHeaders(['X-Internal-Key' => $key])
                ->get(rtrim($base, '/') . '/internal/estadisticas', ['uid' => $uid]);

            if ($response->successful()) {
                $data = $response->json();
                if (is_array($data) && array_key_exists('total', $data)
                    && isset($data['porEspecie'], $data['porEstado'], $data['porMes'])) {
                    return response()->json([...$data, 'disponible' => true, 'fuente' => 'spring']);
                }
                Log::warning('La respuesta Spring no cumple el contrato de estadísticas.');
            } else {
                Log::warning('Falló la integración con Spring Boot.', [
                    'status' => $response->status()
                ]);
            }
        } catch (\Throwable $error) {
            Log::warning('No se pudo consultar Spring Boot.', [
                'tipo' => get_class($error)
            ]);
        }

        return $this->respaldo($uid);
    }

    private function respaldo(string $uid)
    {
        if (!config('services.clinica.stats_fallback_enabled', false)) {
            return response()->json([
                'disponible' => false,
                'mensaje' => 'El servicio de estadísticas está temporalmente no disponible.'
            ]);
        }

        try {
            $data = app(EstadisticaRespaldoService::class)->obtener($uid);
            return response()->json([...$data, 'disponible' => true, 'fuente' => 'laravel_respaldo']);
        } catch (\Throwable $error) {
            Log::error('Tampoco se pudo consultar el respaldo de estadísticas.', [
                'tipo' => get_class($error)
            ]);
            return response()->json([
                'disponible' => false,
                'mensaje' => 'No podemos calcular las estadísticas por ahora. Vuelve a intentarlo.'
            ]);
        }
    }
}
