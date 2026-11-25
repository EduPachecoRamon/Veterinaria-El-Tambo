<?php

namespace Tests\Feature;

use App\Services\CitaService;
use App\Services\DisponibilidadService;
use Carbon\CarbonImmutable;
use Mockery;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Tests\TestCase;

class ReservaDuplicadaTest extends TestCase
{
    public function test_turno_ocupado_responde_con_conflicto_409(): void
    {
        $fecha = CarbonImmutable::now('America/Lima')
            ->addDays(2)->startOfDay()->setTime(14, 0, 0);
        $veterinario = '507f1f77bcf86cd799439011';

        $disponibilidad = Mockery::mock(DisponibilidadService::class);
        $disponibilidad->shouldReceive('consultar')
            ->once()->with($veterinario, $fecha->format('Y-m-d'))
            ->andReturn(['turnos' => [[
                'fechaHora' => $fecha->utc()->toIso8601String(),
                'disponible' => false,
            ]]]);

        $servicio = new CitaService($disponibilidad);
        $this->expectException(ConflictHttpException::class);
        $servicio->crear('uid-de-prueba', [
            'propietario' => 'Cliente de prueba',
            'mascota' => 'Mascota de prueba',
            'especie' => 'Perro',
            'motivo' => 'Consulta de prueba',
            'fechaHora' => $fecha->toIso8601String(),
            'veterinarioId' => $veterinario,
        ]);
    }
}
