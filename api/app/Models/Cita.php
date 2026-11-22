<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Cita extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'citas';

    protected $fillable = [
        'ownerUid',
        'propietario',
        'mascota',
        'especie',
        'motivo',
        'fechaHoraUtc',
        'veterinarioId',
        'estado'
    ];

    protected $casts = [
        'fechaHoraUtc' => 'datetime'
    ];
}