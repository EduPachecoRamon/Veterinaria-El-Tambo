<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use MongoDB\Client;

class DiagnosticoService
{
    public function obtener(): array
    {
        $requeridos = [
            'citas' => ['owner_fecha_id_asc', 'fecha_estado_admin'],
            'productos' => ['catalogo_activo_categoria_nombre', 'catalogo_categoria_precio'],
            'horario_veterinarios' => ['horarios_vet_dia_consulta'],
        ];

        try {
            $inicio = hrtime(true);
            $client = new Client(
                (string) config('database.connections.mongodb.dsn'),
                [],
                ['serverSelectionTimeoutMS' => 4000, 'connectTimeoutMS' => 4000]
            );
            $db = $client->selectDatabase((string) config('database.connections.mongodb.database'));
            foreach ($db->command(['ping' => 1]) as $resultado) {
                break;
            }
            $ping = round((hrtime(true) - $inicio) / 1_000_000, 2);

            $colecciones = [];
            $presentes = 0;
            $total = 0;

            foreach ($requeridos as $nombre => $nombresRequeridos) {
                $indices = [];
                foreach ($db->selectCollection($nombre)->listIndexes() as $indice) {
                    $indices[] = $indice->getName();
                }
                $verificaciones = [];
                foreach ($nombresRequeridos as $esperado) {
                    $existe = in_array($esperado, $indices, true);
                    $verificaciones[] = ['nombre' => $esperado, 'presente' => $existe];
                    $presentes += (int) $existe;
                    $total++;
                }
                $colecciones[] = ['nombre' => $nombre, 'indices' => $verificaciones];
            }

            return [
                'disponible' => true,
                'verificadoEn' => now()->toIso8601String(),
                'conexion' => ['estado' => 'correcta', 'latenciaMs' => $ping],
                'indices' => $colecciones,
                'resumenIndices' => ['presentes' => $presentes, 'esperados' => $total],
                'medicion' => 'La latencia corresponde a una comprobación de conexión desde Laravel, no al tiempo de una consulta de negocio.',
            ];
        } catch (\Throwable $error) {
            Log::warning('No se pudo completar el diagnóstico administrativo de MongoDB.', [
                'tipo' => get_class($error),
            ]);

            return [
                'disponible' => false,
                'verificadoEn' => now()->toIso8601String(),
                'conexion' => ['estado' => 'no disponible', 'latenciaMs' => null],
                'indices' => [],
                'resumenIndices' => ['presentes' => 0, 'esperados' => 5],
                'mensaje' => 'No fue posible comprobar la conexión o los índices en este momento.',
            ];
        }
    }
}
