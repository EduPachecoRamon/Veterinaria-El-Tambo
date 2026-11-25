import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const mockAPI=`
export const api={
  productos:async()=>({data:[
   {id:'p1',nombre:'Producto ejemplo A',categoria:null,descripcion:null,precio:null,imagenUrl:null,disponible:false},
   {id:'p2',nombre:'Producto ejemplo B',categoria:'Alimentos',descripcion:'Ficha de prueba',precio:23.5,imagenUrl:null,disponible:true}
  ],total:2,lastPage:1}),
  adminResumen:async()=>({productos:2,productosPublicados:2,veterinarios:1,citasTotales:2,citasHoy:1,proximosSieteDias:1,porEstado:{confirmada:1,cancelada:1}}),
  adminDiagnostico:async()=>({disponible:true,verificadoEn:'2026-11-24T15:00:00Z',conexion:{estado:'correcta',latenciaMs:15.5},resumenIndices:{presentes:5,esperados:5},indices:[{nombre:'citas',indices:[{nombre:'owner_fecha_id_asc',presente:true}]}]}),
  adminProductos:async()=>({data:[{id:'p1',nombre:'Producto ejemplo',categoria:'Alimentos',descripcion:'Información de demostración',precio:null,disponible:true,activo:true,imagenUrl:null}]}),
  adminVeterinarios:async()=>({data:[{id:'507f1f77bcf86cd799439011',nombre:'Veterinario prueba',especialidad:'General',activo:true,horarios:[]}]}),
  adminAgenda:async()=>({data:[]}),
  veterinarios:async()=>({data:[{id:'507f1f77bcf86cd799439011',nombre:'Veterinario prueba',especialidad:'General'}]}),
  disponibilidad:async()=>({turnos:[{hora:'09:00',fechaHora:'2026-11-25T14:00:00Z',disponible:true}]})
};
`;
const salidas=[];
await mkdir('../evidencias-visuales-ci',{recursive:true});
let failed=0;
const tamanos=[
 {nombre:'escritorio',width:1366,height:768},
 {nombre:'tableta',width:768,height:1024},
 {nombre:'movil',width:390,height:844},
 {nombre:'compacto',width:870,height:310}
];

for(const screen of ['productos','administracion','agenda']){
 for(const tamano of tamanos){
  const page=await browser.newPage({viewport:{width:tamano.width,height:tamano.height}});
  const errors=[];
  page.on('pageerror',e=>errors.push('PAGE: '+e.stack));
  page.on('console',msg=>{if(msg.type()==='error')errors.push('CONSOLE: '+msg.text());});
  await page.route('**/src/api.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:mockAPI}));
  await page.goto('http://127.0.0.1:4173/browser-fixture.html#'+screen,{waitUntil:'networkidle'});
  await page.waitForTimeout(250);
  let interaction='';
  try{
   if(screen==='productos'){
    await page.getByRole('button',{name:'Alimentos',exact:true}).click();
    await page.getByRole('searchbox',{name:'Buscar productos'}).fill('cepillo');
    await page.waitForTimeout(410);
    interaction='filtrado de catálogo';
   }else if(screen==='administracion'){
    for(const tab of ['Agenda diaria','Catálogo','Profesionales','Rendimiento','Resumen']){
     await page.getByRole('button',{name:tab,exact:true}).click();
    }
    interaction='cinco pestañas del personal';
   }else{
    await page.getByRole('button',{name:'Semana siguiente'}).click();
    interaction='navegación semanal';
   }
  }catch(error){errors.push('INTERACTION: '+error.stack);}
  const body=(await page.locator('body').innerText()).slice(0,300);
  const errorVisible=await page.getByText('No se pudo abrir esta sección').count();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
  const broke=errorVisible>0||errors.length>0||body.trim().length<30||overflow;
  const archivo=screen+'-'+tamano.nombre+'-'+tamano.width+'x'+tamano.height+'.png';
  await page.screenshot({path:'../evidencias-visuales-ci/'+archivo,fullPage:true});
  salidas.push({
   seccion:screen,dispositivo:tamano.nombre,resolucion:tamano.width+'x'+tamano.height,
   interaccion:interaction,archivo,aprobado:!broke,
   desbordeHorizontal:overflow,errores:errors.slice(0,3),
   nota:'Interfaz con datos simulados para prueba visual automatizada. No demuestra persistencia real.'
  });
  console.log(JSON.stringify(salidas[salidas.length-1]));
  if(broke)failed++;
  await page.close();
 }
}
await writeFile('../evidencias-visuales-ci/resultado-pruebas.json',JSON.stringify({
 titulo:'Evidencias visuales automáticas con datos simulados',
 fecha:new Date().toISOString(),total:salidas.length,aprobadas:salidas.filter(x=>x.aprobado).length,casos:salidas
},null,2));
await browser.close();
if(failed)process.exitCode=1;
