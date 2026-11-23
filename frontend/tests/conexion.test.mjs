import test from 'node:test';
import assert from 'node:assert/strict';
import {clasificarConexion,mensajeConexion} from '../src/domain/conexion.js';

test('503 identifica falta de configuración y conserva sesión Firebase',()=>{
  assert.equal(clasificarConexion({status:503,code:'AUTH_NOT_CONFIGURED'}),'configuration');
  assert.match(mensajeConexion('configuration'),/Firebase está activa/);
});
test('401 se distingue de 503 sin aceptar permisos inválidos',()=>{
  assert.equal(clasificarConexion({status:401}),'unauthorized');
  assert.match(mensajeConexion('unauthorized'),/validar la sesión/);
});
test('fallos de red se explican sin mostrar detalles internos',()=>{
  assert.equal(clasificarConexion({status:0}),'offline');
  assert.match(mensajeConexion('offline'),/servicio de reservas/);
});
