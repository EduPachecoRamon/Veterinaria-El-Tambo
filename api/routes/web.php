<?php
use Illuminate\Support\Facades\Route;
Route::get('/',fn()=>response()->json(['servicio'=>'Clínica El Tambo API','api'=>'/api/salud']));
