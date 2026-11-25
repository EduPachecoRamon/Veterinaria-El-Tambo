<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use MongoDB\Client;

class CrearIndicesCitas extends Command
{
    protected $signature = 'clinica:indices';
    protected $description = 'Verifica y crea los índices de lectura y protección de turnos';

    public function handle(): int
    {
        $dsn = (string) config('database.connections.mongodb.dsn');
        $nombreBase = (string) config('database.connections.mongodb.database');

        try {
            $base = (new Client($dsn, [], [
                'serverSelectionTimeoutMS' => 5000,
                'connectTimeoutMS' => 5000,
            ]))->selectDatabase($nombreBase);

            $crearSiFalta = function (string $coleccion, array $campos, string $nombre, array $opciones = []) use ($base): void {
                $recurso = $base->selectCollection($coleccion);
                $existentes = [];
                foreach ($recurso->listIndexes() as $indice) {
                    $existentes[] = $indice->getName();
                }
                if (in_array($nombre, $existentes, true)) {
                    $this->line('Ya existe: ' . $coleccion . '.' . $nombre);
                    return;
                }
                $recurso->createIndex($campos, ['name' => $nombre, ...$opciones]);
                $this->info('Creado: ' . $coleccion . '.' . $nombre);
            };

            $crearSiFalta('citas', ['ownerUid' => 1, 'fechaHoraUtc' => 1, '_id' => 1], 'owner_fecha_id_asc');
            $crearSiFalta('citas', ['fechaHoraUtc' => 1, 'estado' => 1], 'fecha_estado_admin');
            $crearSiFalta('productos', ['activo' => 1, 'categoria' => 1, 'nombre' => 1], 'catalogo_activo_categoria_nombre');
            $crearSiFalta('productos', ['activo' => 1, 'categoria' => 1, 'precio' => 1], 'catalogo_categoria_precio');
            $crearSiFalta('horario_veterinarios', ['veterinarioId' => 1, 'diaSemana' => 1], 'horarios_vet_dia_consulta');

            $nombres = [];
            foreach ($base->selectCollection('citas')->listIndexes() as $indice) {
                $nombres[] = $indice->getName();
            }

            if (!in_array('unique_veterinario_turno_activo', $nombres, true)
                && !in_array('turno_activo_unico', $nombres, true)) {
                $crearSiFalta('citas', ['veterinarioId' => 1, 'fechaHoraUtc' => 1], 'turno_activo_unico', [
                    'unique' => true,
                    'partialFilterExpression' => ['estado' => ['$in' => ['confirmada', 'en_curso']]],
                ]);
            } else {
                $this->line('Ya existe el índice de turnos activos; no se modifica.');
            }

            $this->info('Verificación de índices finalizada.');
            return self::SUCCESS;
        } catch (\Throwable $error) {
            $this->error('No se pudo verificar o construir un índice. Revisa la conexión y los posibles duplicados.');
            $this->warn('Tipo de error: ' . get_class($error));
            return self::FAILURE;
        }
    }
}
