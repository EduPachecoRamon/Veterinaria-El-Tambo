<?php

namespace App\Services;

use MongoDB\Client;

class EstadisticaRespaldoService
{
    public function obtener(string $uid): array
    {
        $client = new Client(
            (string) config('database.connections.mongodb.dsn'),
            [],
            ['serverSelectionTimeoutMS' => 5000, 'connectTimeoutMS' => 5000]
        );

        $coleccion = $client
            ->selectDatabase((string) config('database.connections.mongodb.database'))
            ->selectCollection('citas');

        $filtro = ['ownerUid' => $uid];

        $agrupar = function (string $campo, string $nombre) use ($coleccion, $filtro): array {
            $cursor = $coleccion->aggregate([
                ['$match' => $filtro],
                ['$group' => ['_id' => '$' . $campo, 'cantidad' => ['$sum' => 1]]],
                ['$sort' => ['_id' => 1]]
            ]);

            $resultado = [];
            foreach ($cursor as $fila) {
                $resultado[] = [
                    $nombre => (string) ($fila['_id'] ?? 'Sin definir'),
                    'cantidad' => (int) ($fila['cantidad'] ?? 0)
                ];
            }
            return $resultado;
        };

        $meses = [];
        $cursor = $coleccion->aggregate([
            ['$match' => [...$filtro, 'fechaHoraUtc' => ['$type' => 'date']]],
            ['$group' => [
                '_id' => ['$dateToString' => [
                    'format' => '%Y-%m',
                    'date' => '$fechaHoraUtc',
                    'timezone' => 'America/Lima'
                ]],
                'cantidad' => ['$sum' => 1]
            ]],
            ['$sort' => ['_id' => -1]],
            ['$limit' => 12]
        ]);

        foreach ($cursor as $fila) {
            $meses[] = [
                'mes' => (string) ($fila['_id'] ?? 'Sin definir'),
                'cantidad' => (int) ($fila['cantidad'] ?? 0)
            ];
        }

        return [
            'total' => $coleccion->countDocuments($filtro),
            'porEspecie' => $agrupar('especie', 'especie'),
            'porEstado' => $agrupar('estado', 'estado'),
            'porMes' => array_reverse($meses)
        ];
    }
}
