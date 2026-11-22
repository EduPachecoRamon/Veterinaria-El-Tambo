<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SoloAdministrador
{
    public function handle(Request $request, Closure $next): Response
    {
        $uid = $request->attributes->get('firebase_uid');
        $ids = array_filter(array_map('trim', explode(',', (string) config('services.clinica.admin_uids', ''))));

        if (!$uid || !in_array($uid, $ids, true)) {
            return response()->json(['message' => 'No tienes permisos de administración.'], 403);
        }

        return $next($request);
    }
}
