import {useCallback,useEffect,useState} from 'react';
import {Activity,BarChart3,CalendarDays,Camera,CheckCircle2,ClipboardList,Clock3,Image as ImageIcon,Package,RefreshCcw,Save,ShieldAlert,Stethoscope,Users} from 'lucide-react';
import {api} from './api.js';
import {DIAS,leerIntervalos} from './domain/horarios.js';
import {formatearFecha} from './domain/citas.js';
import {leerMetricas} from './domain/metricas.js';
import FotoPrivada from './FotoPrivada.jsx';

const productoVacio={nombre:'',categoria:'Alimentos',descripcion:'',precio:'',imagenUrl:'',disponible:true,activo:true};
const veterinarioVacio={nombre:'',especialidad:'Medicina general',activo:true};
function fechaLocal(){
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
function numero(n){return Number.isFinite(Number(n))?Number(n):0;}
function Kpi({icon:Icon,valor,titulo,detalle}){
  return <article className="staff-kpi">
    <div className="staff-kpi-icon"><Icon size={21}/></div>
    <strong>{numero(valor).toLocaleString('es-PE')}</strong>
    <span>{titulo}</span>
    <small>{detalle}</small>
  </article>;
}

export default function Administracion({rol}){
  const [seccion,setSeccion]=useState('resumen');
  const [productos,setProductos]=useState([]);
  const [veterinarios,setVeterinarios]=useState([]);
  const [resumen,setResumen]=useState(null);
  const [agenda,setAgenda]=useState([]);
  const [fecha,setFecha]=useState(fechaLocal);
  const [producto,setProducto]=useState(productoVacio);
  const [productoFoto,setProductoFoto]=useState(null);
  const [productoId,setProductoId]=useState(null);
  const [veterinario,setVeterinario]=useState(veterinarioVacio);
  const [veterinarioId,setVeterinarioId]=useState(null);
  const [dia,setDia]=useState(1);
  const [intervalos,setIntervalos]=useState('09:00-13:00,15:00-19:00');
  const [error,setError]=useState('');
  const [mensaje,setMensaje]=useState('');
  const [ocupado,setOcupado]=useState(false);
  const [metricas,setMetricas]=useState([]);

  const cargar=useCallback(async()=>{
    if(rol!=='administrador')return;
    setOcupado(true);setError('');
    try{
      const resultados=await Promise.allSettled([api.adminResumen(),api.adminProductos(),api.adminVeterinarios()]);
      const [resumenR,productosR,veterinariosR]=resultados;
      const errores=[];
      if(resumenR.status==='fulfilled')setResumen(resumenR.value);
      else errores.push('resumen operativo');
      if(productosR.status==='fulfilled'){
        setProductos(Array.isArray(productosR.value?.data)?productosR.value.data.filter(Boolean):[]);
      }else errores.push('productos');
      if(veterinariosR.status==='fulfilled'){
        setVeterinarios(Array.isArray(veterinariosR.value?.data)?veterinariosR.value.data.filter(Boolean):[]);
      }else errores.push('veterinarios');
      if(errores.length)setError('No fue posible actualizar: '+errores.join(', ')+'. Usa Actualizar para volver a consultar.');
      setMetricas(leerMetricas());
    }finally{setOcupado(false);}
  },[rol]);

  const cargarAgenda=useCallback(async(diaFecha)=>{
    if(rol!=='administrador')return;
    try{
      const respuesta=await api.adminAgenda(diaFecha);
      setAgenda(Array.isArray(respuesta?.data)?respuesta.data.filter(Boolean):[]);
    }catch(e){setError(e.message);setAgenda([]);}
  },[rol]);

  useEffect(()=>{cargar();},[cargar]);
  useEffect(()=>{cargarAgenda(fecha);},[fecha,cargarAgenda]);

  async function ejecutar(accion,exito){
    setOcupado(true);setError('');setMensaje('');
    try{
      const resultado=await accion();
      await cargar();
      setMensaje(exito);
      return resultado;
    }catch(e){setError(e.message);return null;}
    finally{setOcupado(false);}
  }

  async function guardarProducto(e){
    e.preventDefault();
    const datos={...producto,precio:producto.precio===''?null:Number(producto.precio),imagenUrl:(producto.imagenUrl||'').trim()||null};
    setOcupado(true);setError('');setMensaje('');
    try{
      const res=await (productoId?api.adminEditarProducto(productoId,datos):api.adminCrearProducto(datos));
      const id=productoId||res?.data?.id;
      if(productoFoto&&id)await api.adminSubirFotoProducto(id,productoFoto);
      setProducto({...productoVacio});setProductoId(null);setProductoFoto(null);
      await cargar();
      setMensaje('Producto y fotografía guardados correctamente.');
    }catch(err){setError(err.message||'No se pudo guardar el producto.');}
    finally{setOcupado(false);}
  }

  async function guardarVeterinario(e){
    e.preventDefault();
    const resultado=await ejecutar(()=>veterinarioId?api.adminEditarVeterinario(veterinarioId,veterinario):api.adminCrearVeterinario(veterinario),'Profesional guardado.');
    if(resultado){setVeterinario({...veterinarioVacio});setVeterinarioId(null);}
  }

  async function guardarHorario(e){
    e.preventDefault();
    try{
      const lista=leerIntervalos(intervalos);
      const resultado=await ejecutar(()=>api.adminGuardarHorario(veterinarioId,dia,lista),'Horario actualizado.');
      if(resultado)await cargarAgenda(fecha);
    }catch(e){setError(e.message);}
  }

  function elegirVeterinario(v){
    setVeterinario({nombre:v.nombre||'',especialidad:v.especialidad||'',activo:!!v.activo});
    setVeterinarioId(v.id);
    const h=(Array.isArray(v.horarios)?v.horarios:[]).find(x=>Number(x.diaSemana)===Number(dia));
    setIntervalos(h&&Array.isArray(h.intervalos)?h.intervalos.map(x=>`${x.inicio}-${x.fin}`).join(','):'');
    setSeccion('veterinarios');
  }

  function elegirDia(n){
    setDia(n);
    const v=veterinarios.find(x=>x.id===veterinarioId);
    const h=(Array.isArray(v?.horarios)?v.horarios:[]).find(x=>Number(x.diaSemana)===Number(n));
    setIntervalos(h&&Array.isArray(h.intervalos)?h.intervalos.map(x=>`${x.inicio}-${x.fin}`).join(','):'');
  }

  if(rol!=='administrador')return <main className="container py-5">
    <div className="alert alert-warning"><ShieldAlert size={20}/> Acceso restringido al personal autorizado.</div>
  </main>;

  const estados=resumen?.porEstado||{};
  const maxEstados=Math.max(1,...Object.values(estados).map(numero));
  const tabs=[['resumen','Resumen'],['agenda','Agenda diaria'],['productos','Catálogo'],['veterinarios','Profesionales'],['diagnostico','Rendimiento']];

  return <main className="container py-5 staff-main">
    <header className="staff-heading">
      <div><span className="section-kicker">ESPACIO DEL PERSONAL</span>
        <h1 className="section-heading">Centro de operaciones</h1>
        <p>Una vista clara de las reservas, los profesionales, el catálogo y el estado del sistema.</p>
      </div>
      <button className="btn btn-outline-vet" disabled={ocupado} onClick={()=>{cargar();cargarAgenda(fecha);}}>
        <RefreshCcw size={16}/> Actualizar datos
      </button>
    </header>
    {error&&<div className="alert alert-warning" role="alert">{error}</div>}
    {mensaje&&<div className="alert alert-success" role="status"><CheckCircle2 size={17}/> {mensaje}</div>}
    <nav className="staff-tabs" aria-label="Secciones del panel administrativo">
      {tabs.map(([id,label])=><button key={id} type="button" className={`staff-tab ${seccion===id?'active':''}`} onClick={()=>{setSeccion(id);setError('');if(id==='diagnostico')setMetricas(leerMetricas());}} aria-current={seccion===id?'page':undefined}>{label}</button>)}
    </nav>

    {seccion==='resumen'&&<>
      <div className="staff-kpis">
        <Kpi icon={CalendarDays} valor={resumen?.citasHoy} titulo="Citas para hoy" detalle="Confirmadas y en curso"/>
        <Kpi icon={Clock3} valor={resumen?.proximosSieteDias} titulo="Próximos 7 días" detalle="Reservas confirmadas"/>
        <Kpi icon={ClipboardList} valor={resumen?.citasTotales} titulo="Citas registradas" detalle="Incluye historial"/>
        <Kpi icon={Package} valor={resumen?.productosPublicados} titulo="Productos publicados" detalle="Catálogo activo"/>
        <Kpi icon={Stethoscope} valor={resumen?.veterinarios} titulo="Profesionales" detalle="Con estado activo"/>
        <Kpi icon={CheckCircle2} valor={estados.confirmada} titulo="Citas confirmadas" detalle="Pendientes de atención"/>
      </div>
      <div className="row g-4 mt-2">
        <div className="col-lg-7"><section className="panel staff-panel h-100">
          <h2 className="h5 mb-3">Distribución de las reservas</h2>
          {Object.entries(estados).map(([estado,cantidad])=><div className="staff-status-row" key={estado}>
            <span>{estado.replace('_',' ')}</span>
            <div className="staff-status-bar"><div style={{width:`${numero(cantidad)/maxEstados*100}%`}}/></div>
            <strong>{numero(cantidad)}</strong>
          </div>)}
          {!resumen&&<p className="text-muted">Cargando indicadores del servidor…</p>}
          <p className="small text-muted mt-4 mb-0">Datos globales del sistema consultados con autorización administrativa en Laravel y MongoDB.</p>
        </section></div>
        <div className="col-lg-5"><section className="panel staff-panel h-100">
          <h2 className="h5 mb-3">Acciones frecuentes</h2>
          <div className="staff-shortcuts">
            <button type="button" onClick={()=>setSeccion('agenda')}><CalendarDays size={18}/> Consultar agenda de hoy</button>
            <button type="button" onClick={()=>setSeccion('productos')}><Package size={18}/> Gestionar catálogo</button>
            <button type="button" onClick={()=>setSeccion('veterinarios')}><Users size={18}/> Organizar profesionales</button>
            <button type="button" onClick={()=>setSeccion('diagnostico')}><Activity size={18}/> Revisar rendimiento</button>
          </div>
        </section></div>
      </div>
    </>}

    {seccion==='agenda'&&<section className="panel staff-panel">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
        <div><h2 className="h5 mb-1">Agenda de atención</h2><p className="text-muted mb-0 small">Reservas de todas las cuentas para la fecha elegida.</p></div>
        <label>Fecha de consulta<input type="date" className="form-control" value={fecha} onChange={e=>setFecha(e.target.value)}/></label>
      </div>
      {agenda.length?<div className="staff-agenda-list">{agenda.map(c=><article className="staff-appointment" key={c.id}>
        <div className="staff-appointment-time"><Clock3 size={16}/>{c.fechaHora?new Intl.DateTimeFormat('es-PE',{timeStyle:'short',timeZone:'America/Lima'}).format(new Date(c.fechaHora)):'Por confirmar'}</div>
        <div className="staff-appointment-info">
          <strong>{c.mascota}</strong><span className="tag ms-2">{c.especie}</span>
          <p className="small mb-1 text-muted">{c.propietario} · {c.motivo}</p>
          <span className="badge text-bg-secondary">{c.estado}</span>
        </div>
        {c.tieneFoto&&<FotoPrivada citaId={c.id} admin/>}
      </article>)}</div>:<div className="staff-empty"><CalendarDays size={30}/><h3 className="h6 mt-2">Sin reservas en esta fecha</h3><p className="text-muted mb-0">Selecciona otra fecha o comprueba los horarios de atención.</p></div>}
    </section>}

    {seccion==='productos'&&<div className="row g-4">
      <div className="col-lg-5"><section className="panel staff-panel">
        <h2 className="h5">{productoId?'Editar ficha de producto':'Añadir producto'}</h2>
        <p className="text-muted small">Los precios son referenciales hasta que la clínica los confirme.</p>
        <form onSubmit={guardarProducto} className="d-grid gap-3">
          <label>Nombre<input className="form-control mt-1" required minLength={3} maxLength={100} value={producto.nombre||''} onChange={e=>setProducto(p=>({...p,nombre:e.target.value}))}/></label>
          <label>Categoría<select className="form-select mt-1" value={producto.categoria||'Alimentos'} onChange={e=>setProducto(p=>({...p,categoria:e.target.value}))}>{['Alimentos','Accesorios','Higiene','Otros'].map(c=><option key={c}>{c}</option>)}</select></label>
          <label>Descripción<textarea rows={3} className="form-control mt-1" required minLength={10} maxLength={500} value={producto.descripcion||''} onChange={e=>setProducto(p=>({...p,descripcion:e.target.value}))}/></label>
          <label>Precio referencial (S/)<input className="form-control mt-1" type="number" min="0" max="100000" step="0.01" value={producto.precio??''} onChange={e=>setProducto(p=>({...p,precio:e.target.value}))}/></label>
          <label><Camera size={17}/> Fotografía del producto
            <input className="form-control mt-1" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setProductoFoto(e.target.files?.[0]||null)}/>
            <small className="text-muted">Imagen autorizada en JPEG, PNG o WebP · máximo 3 MB.</small>
          </label>
          <label>URL HTTPS de fotografía externa (opcional)<input className="form-control mt-1" type="url" placeholder="https://..." value={producto.imagenUrl||''} onChange={e=>setProducto(p=>({...p,imagenUrl:e.target.value}))}/></label>
          <label className="form-check"><input className="form-check-input" type="checkbox" checked={!!producto.disponible} onChange={e=>setProducto(p=>({...p,disponible:e.target.checked}))}/> Disponibilidad confirmada</label>
          <label className="form-check"><input className="form-check-input" type="checkbox" checked={!!producto.activo} onChange={e=>setProducto(p=>({...p,activo:e.target.checked}))}/> Visible en catálogo</label>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-vet" disabled={ocupado} type="submit"><Save size={16}/> Guardar producto</button>
            <button className="btn btn-outline-secondary" type="button" onClick={()=>{setProducto({...productoVacio});setProductoId(null);setProductoFoto(null);}}>Limpiar</button>
          </div>
        </form>
      </section></div>
      <div className="col-lg-7"><section className="panel staff-panel">
        <h2 className="h5">Catálogo registrado <span className="tag ms-2">{productos.length}</span></h2>
        {productos.length?<div className="staff-product-list">{productos.map(p=><article className="staff-product" key={p.id}>
          <div className="staff-product-thumb">{p.imagenUrl?<img src={p.imagenUrl} alt="" onError={e=>{e.currentTarget.style.display='none';}}/>:<Package size={23}/>}</div>
          <div className="staff-product-detail"><strong>{p.nombre}</strong><small className="d-block text-muted">{p.categoria} · {p.precio==null?'Precio por confirmar':`S/ ${Number(p.precio).toFixed(2)}`}</small><span className={p.activo?'text-success small':'text-muted small'}>{p.activo?'Publicado':'Oculto'}</span></div>
          <div className="staff-product-actions">
            <button type="button" className="btn btn-sm btn-outline-vet" disabled={ocupado} onClick={()=>{setProducto({...p,precio:p.precio??'',imagenUrl:p.imagenUrl||''});setProductoId(p.id);setProductoFoto(null);window.scrollTo({top:0,behavior:'smooth'});}}>Editar</button>
            {p.activo&&<button type="button" className="btn btn-sm btn-outline-danger" disabled={ocupado} onClick={()=>{if(confirm('¿Ocultar este producto del catálogo?'))ejecutar(()=>api.adminEliminarProducto(p.id),'Producto ocultado.');}}>Ocultar</button>}
          </div>
        </article>)}</div>:<p className="text-muted">Todavía no hay productos en el sistema.</p>}
      </section></div>
    </div>}

    {seccion==='veterinarios'&&<div className="row g-4">
      <div className="col-lg-5"><section className="panel staff-panel">
        <h2 className="h5">{veterinarioId?'Actualizar profesional':'Registrar profesional'}</h2>
        <form className="d-grid gap-3" onSubmit={guardarVeterinario}>
          <label>Nombre<input className="form-control mt-1" required minLength={3} maxLength={100} value={veterinario.nombre||''} onChange={e=>setVeterinario(v=>({...v,nombre:e.target.value}))}/></label>
          <label>Especialidad<input className="form-control mt-1" required minLength={3} maxLength={100} value={veterinario.especialidad||''} onChange={e=>setVeterinario(v=>({...v,especialidad:e.target.value}))}/></label>
          <label className="form-check"><input type="checkbox" className="form-check-input" checked={!!veterinario.activo} onChange={e=>setVeterinario(v=>({...v,activo:e.target.checked}))}/> Acepta reservas</label>
          <div className="d-flex gap-2"><button className="btn btn-vet" disabled={ocupado} type="submit"><Save size={16}/> Guardar</button><button className="btn btn-outline-secondary" type="button" onClick={()=>{setVeterinario({...veterinarioVacio});setVeterinarioId(null);}}>Nuevo</button></div>
        </form>
      </section>
      {veterinarioId&&<section className="panel staff-panel mt-4"><h2 className="h5">Horario semanal</h2><p className="text-muted small">Intervalos de horas completas en hora de Perú. Un campo vacío cierra ese día.</p>
        <form className="d-grid gap-3" onSubmit={guardarHorario}>
          <label>Día de atención<select className="form-select mt-1" value={dia} onChange={e=>elegirDia(Number(e.target.value))}>{DIAS.map((d,i)=><option key={d} value={i+1}>{d}</option>)}</select></label>
          <label>Intervalos horarios<input className="form-control mt-1" placeholder="09:00-13:00,15:00-19:00" value={intervalos} onChange={e=>setIntervalos(e.target.value)}/></label>
          <button className="btn btn-vet" disabled={ocupado} type="submit"><Save size={16}/> Guardar horario</button>
        </form>
      </section>}
      </div>
      <div className="col-lg-7"><section className="panel staff-panel"><h2 className="h5">Equipo profesional</h2>
        {veterinarios.length?<div className="staff-product-list">{veterinarios.map(v=><article key={v.id} className="staff-product">
          <div className="staff-product-thumb"><Stethoscope size={22}/></div>
          <div className="staff-product-detail"><strong>{v.nombre}</strong><small className="text-muted d-block">{v.especialidad||'General'} · {(Array.isArray(v.horarios)?v.horarios:[]).length} días configurados</small><span className="small">{v.activo?'Acepta citas':'Inactivo'}</span></div>
          <button type="button" className="btn btn-outline-vet btn-sm" onClick={()=>elegirVeterinario(v)}>Editar</button>
        </article>)}</div>:<p className="text-muted">No hay profesionales registrados.</p>}
      </section></div>
    </div>}

    {seccion==='diagnostico'&&<section className="panel staff-panel">
      <div className="d-flex align-items-center gap-2 mb-2"><Activity size={20}/><h2 className="h5 mb-0">Diagnóstico de consultas · Unidad 3</h2></div>
      <p className="text-muted">Mediciones del navegador, incluyendo red y procesamiento. Estas métricas no sustituyen la comparación de ejecución de MongoDB.</p>
      {metricas.length?<div className="table-responsive"><table className="table table-striped align-middle">
        <thead><tr><th>Operación</th><th>Duración</th><th>Resultado</th><th>Hora</th></tr></thead>
        <tbody>{metricas.map((m,i)=><tr key={i}><td>{m.tipo}</td><td>{m.ms} ms</td><td>{m.ok?'Correcto':'Error'}</td><td>{m.fecha}</td></tr>)}</tbody>
      </table></div>:<div className="staff-empty"><BarChart3 size={28}/><p>Abre Citas y realiza una consulta para obtener métricas de esta sesión.</p></div>}
      <a className="btn btn-outline-vet" href="https://github.com/EduPachecoRamon/Veterinaria-El-Tambo/blob/main/CRITERIO5_RESULTADOS_REALES.md" target="_blank" rel="noopener noreferrer">Ver comparación de índices MongoDB</a>
    </section>}
  </main>;
}
