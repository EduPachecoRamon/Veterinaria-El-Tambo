import {useEffect,useMemo,useState} from 'react';
import {CalendarDays,ChevronLeft,ChevronRight,Clock3,RefreshCcw} from 'lucide-react';
import {api} from './api.js';

function fechaPeru(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return `${v.year}-${v.month}-${v.day}`;
}
function sumarDias(iso,n){
  const d=new Date(iso+'T12:00:00Z');
  d.setUTCDate(d.getUTCDate()+n);
  return d.toISOString().slice(0,10);
}
function fechaCorta(iso){
  return new Intl.DateTimeFormat('es-PE',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(iso+'T12:00:00Z'));
}
export default function Agenda(){
  const hoy=fechaPeru();
  const [fecha,setFecha]=useState(hoy);
  const [veterinarios,setVeterinarios]=useState([]);
  const [vetId,setVetId]=useState('');
  const [turnos,setTurnos]=useState([]);
  const [error,setError]=useState('');
  const [cargando,setCargando]=useState(false);
  const [reintentos,setReintentos]=useState(0);
  const semana=useMemo(()=>Array.from({length:7},(_,i)=>sumarDias(fecha,i)),[fecha]);
  useEffect(()=>{
    let activo=true;
    api.veterinarios().then(r=>{
      if(!activo)return;
      const items=Array.isArray(r?.data)?r.data.filter(x=>x&&x.id):[];
      setVeterinarios(items);setVetId(old=>old||items[0]?.id||'');
    }).catch(e=>{if(activo)setError(e.message);});
    return()=>{activo=false;};
  },[]);
  useEffect(()=>{
    if(!vetId||!fecha)return;
    let activo=true;
    setCargando(true);setError('');setTurnos([]);
    api.disponibilidad(vetId,fecha).then(r=>{if(activo)setTurnos(Array.isArray(r?.turnos)?r.turnos:[]);})
      .catch(e=>{if(activo)setError(e.message);})
      .finally(()=>{if(activo)setCargando(false);});
    return()=>{activo=false;};
  },[fecha,vetId,reintentos]);
  const limite=sumarDias(hoy,30);
  function elegirTurno(hora){
    sessionStorage.setItem('vet-agenda-seleccion',JSON.stringify({fecha,hora,veterinarioId:vetId}));
    location.hash='#citas';
  }
  return <main className="container py-5">
    <header className="text-center mb-4">
      <span className="section-kicker">AGENDA INTERACTIVA · HORA DE PERÚ</span>
      <h1 className="section-heading">Encuentra el horario adecuado</h1>
      <p className="text-muted">Explora los horarios habilitados y continúa hacia tu reserva de prueba.</p>
    </header>
    <div className="panel agenda-shell">
      <div className="agenda-header">
        <div><h2 className="h4">Disponibilidad de atención</h2><p className="text-muted mb-0">Los turnos se consultan en Laravel y se validan nuevamente al reservar.</p></div>
        <label className="agenda-vet-label">Profesional
          <select className="form-select mt-1" value={vetId} onChange={e=>setVetId(e.target.value)}>
            {!veterinarios.length&&<option value="">No hay profesionales disponibles</option>}
            {veterinarios.map(v=><option key={v.id} value={v.id}>{v.nombre} · {v.especialidad}</option>)}
          </select>
        </label>
      </div>
      <div className="agenda-toolbar">
        <button type="button" className="btn btn-outline-vet" aria-label="Semana anterior" disabled={fecha<=hoy} onClick={()=>setFecha(sumarDias(fecha,-7))}><ChevronLeft size={16}/></button>
        <label>Fecha <input className="form-control" type="date" min={hoy} max={limite} value={fecha} onChange={e=>setFecha(e.target.value)}/></label>
        <button type="button" className="btn btn-outline-vet" aria-label="Semana siguiente" disabled={sumarDias(fecha,7)>limite} onClick={()=>setFecha(sumarDias(fecha,7))}><ChevronRight size={16}/></button>
      </div>
      <div className="agenda-week" aria-label="Elige fecha">
        {semana.filter(d=>d<=limite).map(d=><button key={d} type="button" onClick={()=>setFecha(d)} className={`agenda-day ${fecha===d?'selected':''}`}>{fechaCorta(d)}</button>)}
      </div>
      {error&&<div className="alert alert-warning" role="alert">{error}<button className="btn btn-sm btn-outline-dark ms-2" onClick={()=>setReintentos(x=>x+1)} type="button"><RefreshCcw size={13}/> Intentar de nuevo</button></div>}
      {cargando&&<p role="status" className="text-muted">Consultando horarios disponibles…</p>}
      {!cargando&&!error&&<section aria-label="Turnos disponibles">
        <h3 className="h6 mb-3"><Clock3 size={18}/> Horarios para el {fechaCorta(fecha)}</h3>
        <div className="agenda-slots">
          {turnos.filter(t=>t?.disponible&&t.hora).map(t=><button type="button" className="agenda-slot" key={t.fechaHora||t.hora} onClick={()=>elegirTurno(t.hora)}>{t.hora}<span>Elegir</span></button>)}
        </div>
        {!turnos.some(t=>t?.disponible)&&<div className="agenda-empty"><CalendarDays size={28}/><p>No encontramos turnos libres en esta fecha. Selecciona otro día.</p></div>}
      </section>}
    </div>
  </main>;
}
