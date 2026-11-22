<?php
namespace App\Console\Commands;

use App\Models\HorarioVeterinario;
use App\Models\Veterinario;
use Illuminate\Console\Command;

class CrearDatosDemo extends Command
{
    protected $signature = 'clinica:datos-demo';
    protected $description = 'Crea datos ficticios para probar veterinarios y disponibilidad en local';

    public function handle(): int
    {
        if (app()->environment('production')) {
            $this->error('Este comando no está permitido en producción.');
            return self::FAILURE;
        }

        foreach ([
            ['nombre' => 'Veterinario DEMO A', 'especialidad' => 'Medicina general'],
            ['nombre' => 'Veterinario DEMO B', 'especialidad' => 'Medicina felina'],
        ] as $dato) {
            $veterinario = Veterinario::query()->firstOrCreate(
                ['nombre' => $dato['nombre']],
                ['especialidad' => $dato['especialidad'], 'activo' => true]
            );

            for ($dia = 1; $dia <= 6; $dia++) {
                HorarioVeterinario::query()->updateOrCreate(
                    ['veterinarioId' => (string) $veterinario->getKey(), 'diaSemana' => $dia],
                    [
                        'intervalos' => [
                            ['inicio' => '08:00', 'fin' => '12:00'],
                            ['inicio' => '14:00', 'fin' => '19:00'],
                        ],
                        'zonaHoraria' => 'America/Lima',
                    ]
                );
            }
        }

        $this->info('Datos ficticios preparados. No corresponden a profesionales reales.');
        return self::SUCCESS;
    }
}
