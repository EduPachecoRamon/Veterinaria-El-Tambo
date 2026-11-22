import test from 'node:test';
import assert from 'node:assert/strict';
import {leerIntervalos} from '../src/domain/horarios.js';
import {citaAFormulario} from '../src/domain/citas.js';

test('permite horarios separados y devuelve intervalos ordenados', () => {
  assert.deepEqual(leerIntervalos('14:00-19:00,09:00-12:00'), [
    {inicio:'09:00',fin:'12:00'},{inicio:'14:00',fin:'19:00'}
  ]);
});
test('permite no trabajar un día', () => assert.deepEqual(leerIntervalos(''), []));
test('rechaza intervalos solapados', () => assert.throws(() => leerIntervalos('09:00-13:00,12:00-16:00')));
test('rechaza minutos distintos de cero', () => assert.throws(() => leerIntervalos('09:30-12:00')));
test('cita se edita en zona horaria Lima aun si navegador usa otra zona', () => {
  const datos=citaAFormulario({fechaHora:'2026-12-01T15:00:00Z',propietario:'X',mascota:'Y',especie:'Gato',motivo:'Z'});
  assert.equal(datos.fecha,'2026-12-01');
  assert.equal(datos.hora,'10:00');
});
