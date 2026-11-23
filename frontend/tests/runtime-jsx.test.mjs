import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const files=readdirSync(new URL('../src/',import.meta.url)).filter(x=>x.endsWith('.jsx'));
for(const name of files){
  test(`React está importado en ${name} para el JSX clásico de Vite`,()=>{
    const source=readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
    assert.match(source,/^import React\b/m,`El componente ${name} renderiza JSX sin importar React`);
  });
}
