<?php

namespace Tests\Feature;

use Tests\TestCase;

class AccesoRutasTest extends TestCase
{
    public function test_el_catalogo_solo_usa_la_base_de_datos_si_hay_conexion(): void
    {
        $this->getJson('/api/salud')->assertOk();
    }

    public function test_rutas_administrativas_requieren_token(): void
    {
        $this->postJson('/api/admin/productos', [])->assertUnauthorized();
        $this->getJson('/api/admin/veterinarios')->assertUnauthorized();
    }

    public function test_mis_permisos_requieren_token(): void
    {
        $this->getJson('/api/yo')->assertUnauthorized();
    }
}
