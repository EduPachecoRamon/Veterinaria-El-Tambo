<?php
namespace Tests\Feature;

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
}
