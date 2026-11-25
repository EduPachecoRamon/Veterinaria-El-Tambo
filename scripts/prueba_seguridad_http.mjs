import {performance} from 'node:perf_hooks';
import {mkdir, writeFile} from 'node:fs/promises';

const base=(process.env.API_URL||'https://vet-tambo-api.onrender.com/api').replace(/\/$/,'');
if(!/^https:\/\/[^/]+\/api$/.test(base))throw new Error('API_URL debe ser HTTPS y terminar en /api.');
const pruebas=[
 {nombre:'Salud pública',ruta:'/salud',metodo:'GET',esperado:200},
 {nombre:'Catálogo público',ruta:'/productos',metodo:'GET',esperado:200},
 {nombre:'Citas protegidas sin token',ruta:'/citas',metodo:'GET',esperado:401},
 {nombre:'Creación de cita sin token',ruta:'/citas',metodo:'POST',esperado:401},
 {nombre:'Panel del personal sin token',ruta:'/admin/resumen',metodo:'GET',esperado:401},
 {nombre:'Fotografía privada sin token',ruta:'/citas/507f1f77bcf86cd799439011/foto',metodo:'GET',esperado:401},
 {nombre:'Filtro inválido rechazado',ruta:'/productos?orden=no-permitido',metodo:'GET',esperado:422}
];
const resultados=[];
for(const p of pruebas){
 const inicio=performance.now();
 try{
  const respuesta=await fetch(base+p.ruta,{
   method:p.metodo,
   headers:{Accept:'application/json',...(p.metodo==='POST'?{'Content-Type':'application/json'}:{})},
   ...(p.metodo==='POST'?{body:'{}'}:{}),
   signal:AbortSignal.timeout(90000),
   redirect:'manual'
  });
  const protecciones={
   nosniff:respuesta.headers.get('x-content-type-options')==='nosniff',
   clickjacking:respuesta.headers.get('x-frame-options')==='DENY',
   sinCache:(respuesta.headers.get('cache-control')||'').includes('no-store')
  };
  const ok=respuesta.status===p.esperado&&Object.values(protecciones).every(Boolean);
  resultados.push({caso:p.nombre,ruta:p.ruta,metodo:p.metodo,esperado:p.esperado,status:respuesta.status,ok,protecciones,duracionMs:Number((performance.now()-inicio).toFixed(2))});
 }catch(error){
  resultados.push({caso:p.nombre,ruta:p.ruta,metodo:p.metodo,esperado:p.esperado,ok:false,error:error.name});
 }
}
await mkdir('evidencia-ci',{recursive:true});
const resumen={
 tipo:'pruebas de seguridad no destructivas',fecha:new Date().toISOString(),base,
 alcance:'Autenticación, restricciones de rutas, validación y cabeceras HTTP; no sustituye una auditoría de penetración.',
 casos:resultados,aprobadas:resultados.filter(x=>x.ok).length,total:resultados.length
};
await writeFile('evidencia-ci/seguridad-http.json',JSON.stringify(resumen,null,2));
for(const item of resultados)console.log((item.ok?'APROBADO':'FALLO')+' '+item.caso+': '+(item.status??item.error)+' (esperado '+item.esperado+')');
if(resultados.some(x=>!x.ok))process.exitCode=1;
