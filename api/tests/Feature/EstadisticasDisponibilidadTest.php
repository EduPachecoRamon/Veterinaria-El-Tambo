<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\EstadisticaController;
use App\Services\EstadisticaRespaldoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Mockery;
use Tests\TestCase;

class EstadisticasDisponibilidadTest extends TestCase
{
    private function solicitud(): Request
    {
        $request = Request::create('/api/estadisticas', 'GET');
        $request->attributes->set('firebase_uid', 'uid-prueba-123');
        return $request;
    }

    public function test_informa_cuando_spring_responde_correctamente(): void
    {
        config()->set('services.clinica.spring_url', 'https://spring.example.test');
        config()->set('services.clinica.spring_internal_key', 'clave-de-prueba');
        Http::fake(['https://spring.example.test/*' => Http::response([
            'total' => 2,
            'porEspecie' => [['especie' => 'Perro', 'cantidad' => 2]],
            'porEstado' => [['estado' => 'cancelada', 'cantidad' => 1]],
            'porMes' => [['mes' => '2026-11', 'cantidad' => 2]]
        ])]);

        $respuesta = (new EstadisticaController())->index($this->solicitud());
        $data = json_decode($respuesta->getContent(), true);

        $this->assertTrue($data['disponible']);
        $this->assertSame('spring', $data['fuente']);
        $this->assertSame(2, $data['total']);
    }

    public function test_si_falla_spring_utiliza_respaldo_explicito(): void
    {
        config()->set('services.clinica.spring_url', 'https://spring.example.test');
        config()->set('services.clinica.spring_internal_key', 'clave-de-prueba');
        config()->set('services.clinica.stats_fallback_enabled', true);
        Http::fake(['https://spring.example.test/*' => Http::response([], 503)]);
        $mock = Mockery::mock(EstadisticaRespaldoService::class);
        $mock->shouldReceive('obtener')->once()->with('uid-prueba-123')
            ->andReturn(['total' => 1, 'porEspecie' => [], 'porEstado' => [], 'porMes' => []]);
        $this->app->instance(EstadisticaRespaldoService::class, $mock);

        $respuesta = (new EstadisticaController())->index($this->solicitud());
        $data = json_decode($respuesta->getContent(), true);

        $this->assertTrue($data['disponible']);
        $this->assertSame('laravel_respaldo', $data['fuente']);
        $this->assertSame(1, $data['total']);
    }

    public function test_usuario_sin_uid_no_obtiene_estadisticas(): void
    {
        config()->set('services.clinica.stats_fallback_enabled', true);
        $response = (new EstadisticaController())->index(Request::create('/api/estadisticas', 'GET'));
        $this->assertSame(401, $response->getStatusCode());
    }
}
