import test from 'node:test';
import assert from 'node:assert/strict';
import {validarCita,validarCamposCita,ESPECIES} from '../src/domain/citas.js';
const futura=new Date(Date.now()+7*86400000);while(futura.getDay()===0)futura.setDate(futura.getDate()+1);
const dos=n=>String(n).padStart(2,'0');
const ejemplo={propietario:'Ana Torres',mascota:'Firulais',especie:'Perro',motivo:'Chequeo general',fecha:`${futura.getFullYear()}-${dos(futura.getMonth()+1)}-${dos(futura.getDate())}`,hora:'10:00'};
test('valida y convierte la cita a ISO UTC',()=>{const r=validarCita(ejemplo);assert.equal(r.mascota,'Firulais');assert.ok(r.fechaHora.endsWith('Z'))});
test('rechaza especie desconocida',()=>assert.throws(()=>validarCita({...ejemplo,especie:'Dragón'})));
test('rechaza turno que no comienza a la hora exacta',()=>assert.throws(()=>validarCita({...ejemplo,hora:'22:30'})));
test('rechaza fecha en el pasado',()=>assert.throws(()=>validarCita({...ejemplo,fecha:'2020-01-01'})));
test('especies disponibles',()=>assert.deepEqual(ESPECIES,['Perro','Gato','Otro']));

test('rechaza horario intermedio no admitido por Laravel',()=>assert.throws(()=>validarCita({...ejemplo,hora:'10:30'}),/hora exacta/));
test('valida nombres y motivos antes de enviar datos',()=>assert.throws(()=>validarCamposCita({...ejemplo,propietario:'A'}),/Propietario/));
test('normaliza espacios en la entrada',()=>assert.equal(validarCamposCita({...ejemplo,mascota:'  Luna   Sol  '}).mascota,'Luna Sol'));
