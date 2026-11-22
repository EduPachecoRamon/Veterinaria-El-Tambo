<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class HorarioVeterinario extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'horario_veterinarios';

    protected $fillable = [
        'veterinarioId',
        'diaSemana',
        'intervalos',
        'zonaHoraria'
    ];

    protected $casts = [
        'diaSemana' => 'integer'
    ];
}