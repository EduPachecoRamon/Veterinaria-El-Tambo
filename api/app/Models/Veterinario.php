<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Veterinario extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'veterinarios';

    protected $fillable = [
        'nombre',
        'especialidad',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];
}
