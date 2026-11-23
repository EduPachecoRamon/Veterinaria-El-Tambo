import test from 'node:test';
import assert from 'node:assert/strict';
import {chartValues} from '../src/domain/estadisticas.js';

test('normaliza cantidades y calcula proporciones sin dividir por cero',()=>{
  assert.deepEqual(chartValues([{cantidad:4},{cantidad:2}]),[100,50]);
  assert.deepEqual(chartValues([{cantidad:0}]),[0]);
  assert.deepEqual(chartValues([]),[]);
});
test('no admite cantidades negativas como porcentajes',()=>{
  assert.deepEqual(chartValues([{cantidad:-3},{cantidad:3}]),[0,100]);
});
