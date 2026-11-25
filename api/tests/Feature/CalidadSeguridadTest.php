<?php

namespace Tests\Feature;

use App\Http\Middleware\SoloAdministrador;
use App\Http\Middleware\VerificarFirebase;
use App\Services\CitaService;
use App\Services\DiagnosticoService;
use App\Services\DisponibilidadService;
use Illuminate\Http\Request;
use Mockery;
use ReflectionMethod;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Tests\TestCase;

class CalidadSeguridadTest extends TestCase
{
    public function test_diagnostico_no_es_publico(): void
    {
        $this->getJson('/api/admin/diagnostico')->assertUnauthorized();
    }

    public function test_diagnostico_rechaza_cliente_sin_rol_admin(): void
    {
        $this->withoutMiddleware(VerificarFirebase::class);
        $this->getJson('/api/admin/diagnostico')->assertForbidden();
    }

    public function test_diagnostico_solo_expone_resumen_sin_credenciales(): void
    {
        $this->withoutMiddleware([VerificarFirebase::class, SoloAdministrador::class]);
        $diagnostico = Mockery::mock(DiagnosticoService::class);
        $diagnostico->shouldReceive('obtener')->once()->andReturn([
            'disponible' => true,
            'conexion' => ['estado' => 'correcta', 'latenciaMs' => 12.3],
            'indices' => [],
            'resumenIndices' => ['presentes' => 5, 'esperados' => 5],
        ]);
        $this->app->instance(DiagnosticoService::class, $diagnostico);

        $response = $this->getJson('/api/admin/diagnostico')->assertOk()
            ->assertJsonPath('conexion.estado', 'correcta')
            ->assertJsonPath('resumenIndices.presentes', 5);

        $this->assertStringNotContainsString('DB_URI', $response->getContent());
        $this->assertStringNotContainsString('FIREBASE_CREDENTIALS', $response->getContent());
    }

    public function test_validacion_impide_filtros_y_datos_invalidos(): void
    {
        $this->getJson('/api/productos?page=-4')->assertUnprocessable()
            ->assertJsonValidationErrors('page');

        $this->withoutMiddleware(VerificarFirebase::class);
        $this->postJson('/api/citas', [
            'propietario' => 'X',
            'mascota' => 'Y',
            'especie' => 'NoExiste',
            'motivo' => 'Z',
            'fechaHora' => 'ayer',
            'veterinarioId' => 'id-invalido',
        ])->assertUnprocessable()->assertJsonValidationErrors([
            'propietario', 'mascota', 'especie', 'motivo', 'fechaHora', 'veterinarioId',
        ]);
    }

    public function test_reglas_de_cabeceras_de_seguridad(): void
    {
        $this->getJson('/api/salud')->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'no-referrer')
            ->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_conflicto_de_indice_unico_se_convierte_en_409(): void
    {
        $disponibilidad = Mockery::mock(DisponibilidadService::class);
        $servicio = new CitaService($disponibilidad);
        $guardar = new ReflectionMethod(CitaService::class, 'guardarProtegido');

        $this->expectException(ConflictHttpException::class);
        $guardar->invoke($servicio, function () {
            throw new RuntimeException('Conflicto de clave única', 11000);
        });
    }
}
