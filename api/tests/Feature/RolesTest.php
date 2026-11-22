<?php

namespace Tests\Feature;

use App\Http\Middleware\SoloAdministrador;
use Illuminate\Http\Request;
use Tests\TestCase;

class RolesTest extends TestCase
{
    public function test_rechaza_usuario_que_no_es_administrador(): void
    {
        config()->set('services.clinica.admin_uids', 'uid-admin');
        $request = Request::create('/api/admin/productos', 'GET');
        $request->attributes->set('firebase_uid', 'uid-cliente');
        $response = (new SoloAdministrador())->handle($request, fn () => response()->json(['ok' => true]));
        $this->assertSame(403, $response->getStatusCode());
    }

    public function test_permite_uid_autorizado(): void
    {
        config()->set('services.clinica.admin_uids', 'uid-admin, uid-otro-admin');
        $request = Request::create('/api/admin/productos', 'GET');
        $request->attributes->set('firebase_uid', 'uid-admin');
        $response = (new SoloAdministrador())->handle($request, fn () => response()->json(['ok' => true]));
        $this->assertSame(200, $response->getStatusCode());
    }
}
