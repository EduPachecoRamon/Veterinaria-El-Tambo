<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use MongoDB\Client;

class CrearIndicesCitas extends Command
{
    protected $signature = 'clinica:indices';
    protected $description = 'Crea índices de lectura, catálogo y prevención de turnos duplicados';

    public function handle(): int
    {
        $base = (new Client(env('DB_URI', 'mongodb://127.0.0.1:27017')))
            ->selectDatabase(env('DB_DATABASE', 'clinica_eltambo'));

        try {
            $citas = $base->selectCollection('citas');
            $citas->createIndex(['ownerUid' => 1, 'fechaHoraUtc' => 1, '_id' => 1], ['name' => 'owner_fecha_id_asc']);
            $citas->createIndex(['ownerUid' => 1, 'fechaHoraUtc' => -1, '_id' => -1], ['name' => 'owner_fecha_id_desc']);
            $citas->createIndex(['veterinarioId' => 1, 'fechaHoraUtc' => 1], [
                'name' => 'turno_activo_unico',
                'unique' => true,
                'partialFilterExpression' => ['estado' => ['$in' => ['confirmada', 'en_curso']]]
            ]);
            $base->selectCollection('productos')->createIndex(['activo' => 1, 'categoria' => 1, 'nombre' => 1], ['name' => 'catalogo_activo_categoria_nombre']);
            $base->selectCollection('productos')->createIndex(['activo' => 1, 'categoria' => 1, 'disponible' => 1, 'nombre' => 1], ['name' => 'catalogo_disponible_nombre']);
            $base->selectCollection('productos')->createIndex(['activo' => 1, 'categoria' => 1, 'precio' => 1], ['name' => 'catalogo_categoria_precio']);
            $base->selectCollection('horario_veterinarios')->createIndex(['veterinarioId' => 1, 'diaSemana' => 1], ['name' => 'horario_veterinario_dia', 'unique' => true]);
        } catch (\Throwable $error) {
            $this->error('Falló un índice. Comprueba versión de MongoDB, duplicados y conexión.');
            $this->error($error->getMessage());
            return self::FAILURE;
        }

        $this->info('Índices creados. Revisa db.citas.getIndexes(), db.productos.getIndexes().');
        return self::SUCCESS;
    }
}
