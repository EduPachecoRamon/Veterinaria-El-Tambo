export const ESPECIES=['Perro','Gato','Otro'];
export const vacio={propietario:'',mascota:'',especie:'Perro',motivo:'',fecha:'',hora:''};
export function validarCamposCita(d){
  const propietario=String(d.propietario||'').trim().replace(/\s+/g,' ');
  const mascota=String(d.mascota||'').trim().replace(/\s+/g,' ');
  const motivo=String(d.motivo||'').trim().replace(/\s+/g,' ');
  const especie=String(d.especie||'');
  if(propietario.length<3||propietario.length>80)throw new Error('Propietario: entre 3 y 80 caracteres.');
  if(mascota.length<2||mascota.length>60)throw new Error('Mascota: entre 2 y 60 caracteres.');
  if(!ESPECIES.includes(especie))throw new Error('Selecciona una especie válida.');
  if(motivo.length<3||motivo.length>160)throw new Error('Motivo: entre 3 y 160 caracteres.');
  return {propietario,mascota,motivo,especie};
}
export function validarCita(d,ahora=new Date()){
  const datos=validarCamposCita(d);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)||!/^\d{2}:\d{2}$/.test(d.hora))throw new Error('Selecciona fecha y hora.');
  const fechaHora=new Date(`${d.fecha}T${d.hora}:00`);
  if(!Number.isFinite(fechaHora.getTime())||fechaHora.getFullYear()!==Number(d.fecha.slice(0,4))||fechaHora.getMonth()+1!==Number(d.fecha.slice(5,7))||fechaHora.getDate()!==Number(d.fecha.slice(8,10)))throw new Error('Fecha inválida.');
  if(fechaHora<=ahora)throw new Error('La cita debe ser futura.');
  if(fechaHora.getMinutes()!==0)throw new Error('Las citas empiezan a una hora exacta.');
  const maximo=new Date(ahora);
  maximo.setDate(maximo.getDate()+30);
  maximo.setHours(23,59,59,999);
  if(fechaHora>maximo)throw new Error('La cita debe estar dentro de los próximos 30 días.');
  return {...datos,fechaHora:fechaHora.toISOString()};
}
export function citaAFormulario(c){
  const partes=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(c.fechaHora));
  const valores=Object.fromEntries(partes.map(p=>[p.type,p.value]));
  const fecha=`${valores.year}-${valores.month}-${valores.day}`;
  const hora=`${valores.hour}:${valores.minute}`;
  return{propietario:c.propietario,mascota:c.mascota,especie:c.especie,motivo:c.motivo,fecha,hora};
}
export function formatearFecha(iso){return new Intl.DateTimeFormat('es-PE',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Lima'}).format(new Date(iso));}
