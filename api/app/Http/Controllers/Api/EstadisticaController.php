<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
class EstadisticaController extends Controller{
    public function index(Request $request){
        $base=env('SPRING_URL');$key=env('SPRING_INTERNAL_KEY');
        if(!$base||!$key)return response()->json(['disponible'=>false,'mensaje'=>'Configura SPRING_URL y SPRING_INTERNAL_KEY para activar estadísticas.']);
        try{
            $response=Http::timeout(5)->withHeaders(['X-Internal-Key'=>$key])->get(rtrim($base,'/').'/internal/estadisticas',['uid'=>$request->attributes->get('firebase_uid')]);
            if(!$response->successful())throw new \RuntimeException('Servicio no disponible');
            return response()->json(['disponible'=>true,...$response->json()]);
        }catch(\Throwable $e){return response()->json(['disponible'=>false,'mensaje'=>'Spring Boot no respondió. Verifica su conexión con MongoDB.']);}
    }
}
