<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\EstadisticaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class EstadisticasIntegracionTest extends TestCase
{
    private function solicitud(): Request
    {
        $request = Request::create('/api/estadisticas', 'GET');
        $request->attributes->set('firebase_uid', 'uid-prueba-123');
        return $request;
    }

    public function test_consulta_spring_con_configuracion_de_laravel_y_uid(): void
    {
        config()->set('services.clinica.spring_url', 'https://spring.example.test');
        config()->set('services.clinica.spring_internal_key', 'clave-interna-de-prueba');

        Http::fake([
            'spring.example.test/internal/estadisticas*' => Http::response([
                'total' => 2,
                'porEspecie' => [['especie' => 'Perro', 'cantidad' => 2]],
                'porEstado' => [['estado' => 'cancelada', 'cantidad' => 1]],
                'porMes' => [['mes' => '2026-11', 'cantidad' => 2]]
            ], 200)
        ]);

        $respuesta = (new EstadisticaController())->index($this->solicitud());
        $datos = json_decode($respuesta->getContent(), true);

        $this->assertSame(200, $respuesta->getStatusCode());
        $this->assertTrue($datos['disponible']);
        $this->assertSame(2, $datos['total']);
        $this->assertCount(1, $datos['porEspecie']);
        $this->assertCount(1, $datos['porEstado']);
        $this->assertCount(1, $datos['porMes']);

        Http::assertSent(fn ($request) =>
            str_starts_with($request->url(), 'https://spring.example.test/internal/estadisticas')
            && $request->hasHeader('X-Internal-Key', 'clave-interna-de-prueba')
            && $request['uid'] === 'uid-prueba-123'
        );
    }

    public function test_reporta_configuracion_faltante_sin_intentar_conectar(): void
    {
        config()->set('services.clinica.spring_url', '');
        config()->set('services.clinica.spring_internal_key', '');
        Http::fake();

        $respuesta = (new EstadisticaController())->index($this->solicitud());
        $datos = json_decode($respuesta->getContent(), true);

        $this->assertFalse($datos['disponible']);
        Http::assertNothingSent();
    }

    public function test_error_de_spring_no_expone_clave_ni_respuesta_interna(): void
    {
        config()->set('services.clinica.spring_url', 'https://spring.example.test');
        config()->set('services.clinica.spring_internal_key', 'clave-interna-de-prueba');
        Http::fake([
            'spring.example.test/internal/estadisticas*' => Http::response([
                'error' => 'respuesta interna que no debe mostrarse'
            ], 503)
        ]);

        $respuesta = (new EstadisticaController())->index($this->solicitud());

        $this->assertSame(200, $respuesta->getStatusCode());
        $this->assertFalse(json_decode($respuesta->getContent(), true)['disponible']);
        $this->assertStringNotContainsString('clave-interna-de-prueba', $respuesta->getContent());
        $this->assertStringNotContainsString('respuesta interna', $respuesta->getContent());
    }
}
