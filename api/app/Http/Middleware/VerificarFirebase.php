<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Factory;
use Symfony\Component\HttpFoundation\Response;

class VerificarFirebase
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'code' => 'AUTH_REQUIRED',
                'message' => 'Debes iniciar sesión.'
            ], 401);
        }

        $project = config('services.clinica.firebase_project_id');
        $archivo = config('services.clinica.firebase_service_account');
        $codificado = config('services.clinica.firebase_credentials_b64');

        if (!$project || (!$codificado && (!$archivo || !is_file($archivo)))) {
            Log::error('No está configurada la verificación Firebase en la API.');
            return $this->configuracionPendiente();
        }

        try {
            $factory = (new Factory())->withProjectId($project);

            if ($codificado) {
                $json = base64_decode($codificado, true);
                $credenciales = $json ? json_decode($json, true) : null;

                if (!is_array($credenciales)
                    || ($credenciales['type'] ?? null) !== 'service_account'
                    || ($credenciales['project_id'] ?? null) !== $project
                    || empty($credenciales['private_key'])
                    || empty($credenciales['client_email'])) {
                    Log::error('La credencial Firebase del backend no corresponde al proyecto configurado.');
                    return $this->configuracionPendiente();
                }

                $factory = $factory->withServiceAccount($credenciales);
            } else {
                $factory = $factory->withServiceAccount($archivo);
            }
        } catch (\Throwable $error) {
            Log::error('No se pudo inicializar la verificación Firebase.', [
                'tipo' => get_class($error)
            ]);
            return $this->configuracionPendiente();
        }

        try {
            $verified = $factory->createAuth()->verifyIdToken($token);
            $uid = $verified->claims()->get('sub');

            if (!is_string($uid) || $uid === '') {
                throw new \RuntimeException('UID ausente.');
            }

            $request->attributes->set('firebase_uid', $uid);
            return $next($request);
        } catch (\Throwable $error) {
            Log::warning('No se pudo verificar un token Firebase.', [
                'tipo' => get_class($error)
            ]);

            return response()->json([
                'code' => 'AUTH_INVALID',
                'message' => 'La sesión no pudo ser validada. Inicia sesión nuevamente.'
            ], 401);
        }
    }

    private function configuracionPendiente(): Response
    {
        return response()->json([
            'code' => 'AUTH_NOT_CONFIGURED',
            'message' => 'El servidor de reservas no está disponible temporalmente.'
        ], 503)->header('Retry-After', '60');
    }
}
