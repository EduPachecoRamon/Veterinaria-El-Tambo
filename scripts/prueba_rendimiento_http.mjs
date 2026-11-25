import {performance} from 'node:perf_hooks';
import {mkdir, writeFile} from 'node:fs/promises';

const base=(process.env.API_URL||'https://vet-tambo-api.onrender.com/api').replace(/\/$/,'');
if(!/^https:\/\/[^/]+\/api$/.test(base))throw new Error('API_URL debe ser HTTPS y terminar en /api.');
const rutas=['/salud','/productos'];
const muestras=7;
const calentamiento=2;
const resultados=[];
function mediana(valores){
 const ordenados=[...valores].sort((a,b)=>a-b);
 return ordenados[Math.floor(ordenados.length/2)];
}
function percentil95(valores){
 const ordenados=[...valores].sort((a,b)=>a-b);
 return ordenados[Math.ceil(ordenados.length*0.95)-1];
}
for(const ruta of rutas){
 const medidas=[];
 for(let intento=0;intento<muestras+calentamiento;intento++){
  const inicio=performance.now();
  const respuesta=await fetch(base+ruta,{
   headers:{Accept:'application/json'},
   signal:AbortSignal.timeout(90000),
   cache:'no-store'
  });
  await respuesta.arrayBuffer();
  const ms=Number((performance.now()-inicio).toFixed(2));
  if(respuesta.status!==200)throw new Error(ruta+': respuesta '+respuesta.status+', se esperaba 200.');
  if(intento>=calentamiento)medidas.push(ms);
 }
 resultados.push({ruta,muestras,calentamiento,medianaMs:mediana(medidas),p95Ms:percentil95(medidas),medidasMs:medidas});
}
const informe={
 tipo:'tiempo HTTP observado desde GitHub Actions',fecha:new Date().toISOString(),
 entorno:'GitHub Actions a servicio Render, red y servidor incluidos',
 metodologia:calentamiento+' solicitudes de calentamiento y '+muestras+' mediciones secuenciales por ruta',
 advertencia:'Estas cifras incluyen red, Render y procesamiento HTTP. NO comparan los planes COLLSCAN/IXSCAN de MongoDB.',
 resultados
};
await mkdir('evidencia-ci',{recursive:true});
await writeFile('evidencia-ci/rendimiento-http.json',JSON.stringify(informe,null,2));
for(const x of resultados)console.log(x.ruta+': mediana '+x.medianaMs+' ms; p95 '+x.p95Ms+' ms; n='+x.muestras);
