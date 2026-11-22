<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Producto extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'productos';
    protected $fillable = ['nombre', 'categoria', 'descripcion', 'precio', 'disponible', 'activo', 'imagenUrl'];
    protected $casts = ['precio' => 'float', 'disponible' => 'boolean', 'activo' => 'boolean'];
}
