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
            return response()->json(['message' => 'Debes iniciar sesión.'], 401);
        }

        $project = config('services.clinica.firebase_project_id');
        $archivo = config('services.clinica.firebase_service_account');
        $codificado = config('services.clinica.firebase_credentials_b64');

        if (!$project || (!$codificado && (!$archivo || !is_file($archivo)))) {
            Log::error('Firebase no está configurado en el servidor.');
            return response()->json(['message' => 'El inicio de sesión no está disponible temporalmente.'], 503);
        }

        try {
            $factory = (new Factory())->withProjectId($project);
            if ($codificado) {
                $json = base64_decode($codificado, true);
                $credenciales = $json ? json_decode($json, true) : null;
                if (!is_array($credenciales)) {
                    throw new \RuntimeException('Credenciales Firebase inválidas.');
                }
                $factory = $factory->withServiceAccount($credenciales);
            } else {
                $factory = $factory->withServiceAccount($archivo);
            }
            $verified = $factory->createAuth()->verifyIdToken($token);
            $uid = $verified->claims()->get('sub');

            if (!is_string($uid) || $uid === '') {
                throw new \RuntimeException('UID ausente.');
            }

            $request->attributes->set('firebase_uid', $uid);
            return $next($request);
        } catch (\Throwable $error) {
            Log::warning('No se pudo verificar el token Firebase', ['tipo' => get_class($error)]);
            return response()->json(['message' => 'Sesión inválida o vencida.'], 401);
        }
    }
}
