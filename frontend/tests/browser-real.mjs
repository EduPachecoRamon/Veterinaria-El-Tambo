import {chromium} from 'playwright';
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
let failed=0;
for(const screen of ['productos','administracion','agenda']){
 const page=await browser.newPage({viewport:{width:960,height:720}});
 const errors=[];
 page.on('pageerror',e=>errors.push('PAGE: '+e.stack));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('CONSOLE: '+msg.text());});
 await page.route('**/src/api.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:mockAPI}));
 await page.goto('http://127.0.0.1:4173/browser-fixture.html#'+screen,{waitUntil:'networkidle'});
 await page.waitForTimeout(1100);
 const body=(await page.locator('body').innerText()).slice(0,370);
 const looksBroken=()=>page.locator('text=No se pudo abrir esta sección').count();
 try {
   if(screen==='productos'){
     await page.getByRole('button',{name:'Alimentos',exact:true}).click();
     await page.getByRole('searchbox',{name:'Buscar productos'}).fill('cepillo');
     await page.waitForTimeout(450);
   } else if(screen==='administracion'){
     for(const tab of ['Agenda diaria','Catálogo','Profesionales','Rendimiento','Resumen']){
       await page.getByRole('button',{name:tab,exact:true}).click();
       await page.waitForTimeout(120);
     }
   } else if(screen==='agenda'){
     await page.getByRole('button',{name:'Semana siguiente'}).click();
     await page.waitForTimeout(250);
   }
 } catch(e){errors.push('INTERACTION: '+e.stack);}
 const broke=body.includes('No se pudo abrir esta sección')||errors.length>0||body.trim().length<30||await looksBroken()>0;
 console.log(JSON.stringify({screen,body,errorCount:errors.length,errors:errors.slice(0,3),broke}));
 if(broke)failed++;
 await page.close();
}
await browser.close();
if(failed)process.exitCode=1;
