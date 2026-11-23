import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const styles=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const catalog=readFileSync(new URL('../src/Catalogo.jsx',import.meta.url),'utf8');

test('menu accesible se abre y cierra con estado React',()=>{
  assert.match(app,/aria-expanded=\{open\}/);
  assert.match(app,/setOpen\(v=>!v\)/);
  assert.match(app,/setOpen\(false\)/);
});

test('estadisticas identifica la fuente del resultado',()=>{
  assert.match(app,/laravel_respaldo|data.fuente==='spring'/);
  assert.match(app,/Modo de respaldo:/);
});

test('catalogo distingue datos de demostracion del inventario real',()=>{
  assert.match(catalog,/FICHA DE PRUEBA/);
  assert.match(catalog,/Producto ficticio, sin inventario confirmado/);
});

test('se incluyen estilos para pantallas estrechas y altura reducida',()=>{
  assert.match(styles,/@media\(max-width:870px\)/);
  assert.match(styles,/@media\(max-height:360px\)/);
});
