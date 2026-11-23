<?php
namespace Tests\Feature;

use App\Http\Middleware\VerificarFirebase;
use App\Http\Middleware\SoloAdministrador;
use Tests\TestCase;

class CitasSeguridadTest extends TestCase
{
    public function test_la_ruta_de_salud_es_publica(): void
    {
        $this->getJson('/api/salud')->assertOk()->assertJsonPath('estado', 'activo');
    }

    public function test_no_se_pueden_ver_citas_sin_token(): void
    {
        $this->getJson('/api/citas')->assertUnauthorized();
    }

    public function test_no_se_pueden_crear_citas_sin_token(): void
    {
        $this->postJson('/api/citas', [])->assertUnauthorized();
    }
    public function test_la_api_emite_cabeceras_de_proteccion(): void
    {
        $this->getJson('/api/salud')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'no-referrer');
    }

    public function test_rechaza_datos_invalidos_de_citas_sin_guardarlos(): void
    {
        $this->withoutMiddleware(VerificarFirebase::class);
        $this->postJson('/api/citas', [
            'propietario' => 'A',
            'mascota' => 'X',
            'especie' => 'Conejo',
            'motivo' => 'No',
            'fechaHora' => 'fecha invalida',
            'veterinarioId' => 'incorrecto'
        ])->assertUnprocessable()->assertJsonValidationErrors([
            'propietario', 'mascota', 'especie', 'motivo', 'fechaHora', 'veterinarioId'
        ]);
    }

    public function test_rechaza_precio_negativo_y_url_insegura_de_producto(): void
    {
        $this->withoutMiddleware([VerificarFirebase::class, SoloAdministrador::class]);
        $this->postJson('/api/admin/productos', [
            'nombre' => 'Alimento de prueba',
            'categoria' => 'Alimentos',
            'descripcion' => 'Producto de demostracion para la clase',
            'precio' => -10,
            'imagenUrl' => 'http://example.com/imagen.jpg'
        ])->assertUnprocessable()->assertJsonValidationErrors(['precio', 'imagenUrl']);
    }
}
