import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const admin=readFileSync(new URL('../src/Administracion.jsx',import.meta.url),'utf8');
const api=readFileSync(new URL('../src/api.js',import.meta.url),'utf8');
const agenda=readFileSync(new URL('../src/Agenda.jsx',import.meta.url),'utf8');
const photos=readFileSync(new URL('../src/FotoPrivada.jsx',import.meta.url),'utf8');
const catalog=readFileSync(new URL('../src/Catalogo.jsx',import.meta.url),'utf8');

test('cuenta y botones destacados son navegables',()=>{
  assert.match(app,/aria-expanded=\{cuenta\}/);
  assert.match(app,/href="#administracion"/);
  assert.match(app,/href="#citas"/);
  assert.match(app,/href="#agenda"/);
});
test('el registro permite foto opcional y el historial la visualiza',()=>{
  assert.match(app,/type="file"/);
  assert.match(app,/api\.subirFoto/);
  assert.match(app,/FotoPrivada citaId/);
  assert.match(photos,/URL\.revokeObjectURL/);
});
test('las consultas de imágenes incluyen el token Firebase',()=>{
  assert.match(api,/Bearer.*getIdToken/);
  assert.match(api,/solicitudArchivo/);
  assert.match(api,/adminVerFoto/);
});
test('el panel del personal separa reportes de las citas personales',()=>{
  assert.match(admin,/adminResumen/);
  assert.match(admin,/adminAgenda/);
  assert.match(admin,/leerMetricas/);
  assert.match(admin,/Centro de operaciones/);
});
test('la agenda contiene turnos de hora y no inventa su disponibilidad',()=>{
  assert.match(agenda,/api\.disponibilidad/);
  assert.match(agenda,/t\.disponible/);
  assert.match(agenda,/setReintentos/);
});
test('el catalogo contiene referencias y categorias seguras',()=>{
  assert.match(catalog,/Precio referencial sujeto a confirmación/);
  assert.match(catalog,/Array\.isArray\(r\?\.data\)/);
});
