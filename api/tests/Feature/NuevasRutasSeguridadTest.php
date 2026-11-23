<?php

namespace Tests\Feature;

use Tests\TestCase;

class NuevasRutasSeguridadTest extends TestCase
{
    public function test_la_agenda_interna_requiere_autenticacion(): void
    {
        $this->getJson('/api/admin/resumen')->assertUnauthorized();
        $this->getJson('/api/admin/agenda')->assertUnauthorized();
    }

    public function test_una_fotografia_de_cita_no_es_publica(): void
    {
        $id = '507f1f77bcf86cd799439011';
        $this->getJson("/api/citas/{$id}/foto")->assertUnauthorized();
        $this->deleteJson("/api/citas/{$id}/foto")->assertUnauthorized();
        $this->postJson("/api/citas/{$id}/foto", [])->assertUnauthorized();
    }

    public function test_la_carga_de_fotos_del_catalogo_requiere_permiso(): void
    {
        $this->postJson('/api/admin/productos/507f1f77bcf86cd799439011/foto', [])
            ->assertUnauthorized();
    }
}
