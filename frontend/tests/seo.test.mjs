import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('el HTML identifica el proyecto como no oficial y contiene metadatos básicos',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/name="description"/);
 assert.match(html,/name="robots" content="noindex,nofollow"/);
 assert.match(html,/rel="canonical"/);
 assert.match(html,/portal académico no oficial/i);
});
