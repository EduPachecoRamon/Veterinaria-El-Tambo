import {useCallback, useEffect, useState} from 'react';
import {CheckCircle2, RefreshCcw, Save, ShieldAlert} from 'lucide-react';
import {api} from './api.js';
import {DIAS, leerIntervalos} from './domain/horarios.js';

const productoVacio = {nombre:'', categoria:'Alimentos', descripcion:'', precio:'', imagenUrl:'', disponible:true, activo:true};
const veterinarioVacio = {nombre:'', especialidad:'Medicina general', activo:true};

export default function Administracion({rol}) {
  const [seccion, setSeccion] = useState('resumen');
  const [productos, setProductos] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [producto, setProducto] = useState(productoVacio);
  const [productoId, setProductoId] = useState(null);
  const [veterinario, setVeterinario] = useState(veterinarioVacio);
  const [veterinarioId, setVeterinarioId] = useState(null);
  const [dia, setDia] = useState(1);
  const [intervalos, setIntervalos] = useState('09:00-13:00,15:00-19:00');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    if (rol !== 'administrador') return;
    setOcupado(true);
    setError('');
    try {
      const [p, v] = await Promise.all([api.adminProductos(), api.adminVeterinarios()]);
      setProductos(p.data || []);
      setVeterinarios(v.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(false);
    }
  }, [rol]);

  useEffect(() => {cargar();}, [cargar]);

  async function ejecutar(accion, texto) {
    setOcupado(true);
    setError('');
    setMensaje('');
    try {
      await accion();
      setMensaje(texto);
      await cargar();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function guardarProducto(e) {
    e.preventDefault();
    const datos = {...producto, precio: producto.precio === '' ? null : Number(producto.precio), imagenUrl: producto.imagenUrl.trim() || null};
    const ok = await ejecutar(() => productoId ? api.adminEditarProducto(productoId, datos) : api.adminCrearProducto(datos), 'Producto guardado.');
    if (ok) {setProducto(productoVacio); setProductoId(null);}
  }

  async function guardarVeterinario(e) {
    e.preventDefault();
    const ok = await ejecutar(() => veterinarioId ? api.adminEditarVeterinario(veterinarioId, veterinario) : api.adminCrearVeterinario(veterinario), 'Profesional guardado.');
    if (ok) {setVeterinario(veterinarioVacio); setVeterinarioId(null);}
  }

  async function guardarHorario(e) {
    e.preventDefault();
    try {
      const datos = leerIntervalos(intervalos);
      await ejecutar(() => api.adminGuardarHorario(veterinarioId, dia, datos), 'Horario guardado.');
    } catch (e) {
      setError(e.message);
    }
  }

  function elegirVeterinario(v) {
    setVeterinario({nombre:v.nombre, especialidad:v.especialidad, activo:v.activo});
    setVeterinarioId(v.id);
    const horario = (v.horarios || []).find(h => h.diaSemana === dia);
    setIntervalos(horario ? horario.intervalos.map(x => `${x.inicio}-${x.fin}`).join(',') : '');
  }

  function elegirDia(nuevoDia) {
    setDia(nuevoDia);
    const v = veterinarios.find(item => item.id === veterinarioId);
    const h = v?.horarios?.find(hora => hora.diaSemana === nuevoDia);
    setIntervalos(h ? h.intervalos.map(x => `${x.inicio}-${x.fin}`).join(',') : '');
  }

  if (rol !== 'administrador') return <main className="container py-5"><div className="alert alert-warning"><ShieldAlert size={19}/> Acceso restringido. Esta página requiere permisos administrativos verificados por Laravel.</div></main>;

  return <main className="container py-5">
    <div className="text-center mb-4"><span className="section-kicker">GESTIÓN INTERNA</span><h1 className="section-heading">Centro de administración</h1><p className="text-muted">Gestión protegida por permisos del servidor. Los productos DEMO representan registros académicos, no existencias oficiales.</p></div>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    {mensaje && <div className="alert alert-success" role="status"><CheckCircle2 size={17}/> {mensaje}</div>}
    <div className="d-flex gap-2 flex-wrap mb-4">
      <button className={`btn ${seccion==='resumen'?'btn-vet':'btn-outline-vet'}`} onClick={()=>setSeccion('resumen')}>Resumen</button>
      <button className={`btn ${seccion==='productos'?'btn-vet':'btn-outline-vet'}`} onClick={() => setSeccion('productos')}>Productos</button>
      <button className={`btn ${seccion==='veterinarios'?'btn-vet':'btn-outline-vet'}`} onClick={() => setSeccion('veterinarios')}>Veterinarios y horarios</button>
      <button className="btn btn-outline-secondary ms-auto" onClick={cargar} disabled={ocupado}><RefreshCcw size={16}/> Actualizar</button>
    </div>
    {seccion === 'resumen' ? <div className="d-grid gap-4">
      <div className="dashboard-summary">
        <article><strong>{productos.length}</strong><span>Productos registrados</span></article>
        <article><strong>{veterinarios.filter(v=>v.activo).length}</strong><span>Profesionales activos</span></article>
        <article><strong>{veterinarios.reduce((sum,v)=>sum+(v.horarios||[]).length,0)}</strong><span>Días de horario configurados</span></article>
      </div>
      <section className="panel"><h2 className="h5">Acciones del administrador</h2><p className="text-muted">Publica, modifica u oculta fichas del catálogo; registra profesionales y establece sus horarios. Todas las operaciones se validan en Laravel antes de guardarse en MongoDB.</p><div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-vet" onClick={()=>setSeccion('productos')}>Gestionar productos</button><button type="button" className="btn btn-outline-vet" onClick={()=>setSeccion('veterinarios')}>Gestionar horarios</button></div></section>
      <section className="alert alert-info mb-0"><strong>Evaluación académica:</strong> usa datos ficticios para las pruebas de CRUD. No publiques horarios, precios ni imágenes oficiales sin autorización.</section>
    </div> : seccion === 'productos' ? <div className="row g-4">
      <div className="col-lg-5"><section className="panel"><h2 className="h5">{productoId ? 'Editar producto' : 'Nuevo producto'}</h2><form onSubmit={guardarProducto} className="d-grid gap-3">
        <label>Nombre<input className="form-control mt-1" required minLength={3} maxLength={100} value={producto.nombre} onChange={e=>setProducto(p=>({...p,nombre:e.target.value}))}/></label>
        <label>Categoría<select className="form-select mt-1" value={producto.categoria} onChange={e=>setProducto(p=>({...p,categoria:e.target.value}))}>{['Alimentos','Accesorios','Higiene','Otros'].map(c=><option key={c}>{c}</option>)}</select></label>
        <label>Descripción<textarea rows={3} className="form-control mt-1" required minLength={10} maxLength={500} value={producto.descripcion} onChange={e=>setProducto(p=>({...p,descripcion:e.target.value}))}/></label>
        <label>Precio referencial en soles (opcional)<input className="form-control mt-1" inputMode="decimal" type="number" min="0" max="100000" step="0.01" value={producto.precio} onChange={e=>setProducto(p=>({...p,precio:e.target.value}))}/></label>
        <label>URL HTTPS de fotografía oficial (opcional)<input className="form-control mt-1" type="url" placeholder="https://..." value={producto.imagenUrl} onChange={e=>setProducto(p=>({...p,imagenUrl:e.target.value}))}/></label>
        <label className="form-check"><input className="form-check-input" type="checkbox" checked={producto.disponible} onChange={e=>setProducto(p=>({...p,disponible:e.target.checked}))}/> Disponible para consulta</label>
        <label className="form-check"><input className="form-check-input" type="checkbox" checked={producto.activo} onChange={e=>setProducto(p=>({...p,activo:e.target.checked}))}/> Publicado</label>
        <div className="d-flex gap-2 flex-wrap"><button className="btn btn-vet" disabled={ocupado} type="submit"><Save size={17}/> Guardar</button><button className="btn btn-outline-secondary" type="button" onClick={()=>{setProducto(productoVacio);setProductoId(null);}}>Limpiar</button></div>
      </form></section></div>
      <div className="col-lg-7"><section className="panel"><h2 className="h5">Productos registrados</h2><div className="table-responsive"><table className="table align-middle"><thead><tr><th>Producto</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{productos.map(p=><tr key={p.id}><td><strong>{p.nombre}</strong><small className="d-block text-muted">{p.categoria}</small></td><td>{p.activo?'Publicado':'Oculto'}</td><td><div className="d-flex flex-wrap gap-2"><button className="btn btn-sm btn-outline-vet" disabled={ocupado} onClick={()=>{setProducto({...p,precio:p.precio ?? '',imagenUrl:p.imagenUrl || ''});setProductoId(p.id);}}>Editar</button>{p.activo&&<button className="btn btn-sm btn-outline-danger" disabled={ocupado} onClick={()=>{if(window.confirm('¿Retirar este producto del catálogo?')) ejecutar(()=>api.adminEliminarProducto(p.id),'Producto retirado.');}}>Ocultar</button>}</div></td></tr>)}</tbody></table></div>{!productos.length&&<p className="text-muted">Aún no hay productos; añade datos confirmados con la clínica.</p>}</section></div>
    </div> : <div className="row g-4">
      <div className="col-lg-5"><section className="panel"><h2 className="h5">{veterinarioId?'Editar profesional':'Nuevo profesional'}</h2><form className="d-grid gap-3" onSubmit={guardarVeterinario}>
        <label>Nombre<input className="form-control mt-1" required minLength={3} maxLength={100} value={veterinario.nombre} onChange={e=>setVeterinario(v=>({...v,nombre:e.target.value}))}/></label>
        <label>Especialidad<input className="form-control mt-1" required minLength={3} maxLength={100} value={veterinario.especialidad} onChange={e=>setVeterinario(v=>({...v,especialidad:e.target.value}))}/></label>
        <label className="form-check"><input type="checkbox" className="form-check-input" checked={veterinario.activo} onChange={e=>setVeterinario(v=>({...v,activo:e.target.checked}))}/> Acepta citas</label>
        <div className="d-flex flex-wrap gap-2"><button className="btn btn-vet" disabled={ocupado} type="submit"><Save size={17}/> Guardar</button><button className="btn btn-outline-secondary" type="button" onClick={()=>{setVeterinario(veterinarioVacio);setVeterinarioId(null);}}>Nuevo</button></div>
      </form></section>
      {veterinarioId&&<section className="panel mt-4"><h2 className="h5">Horario semanal</h2><p className="small text-muted">Intervalos de horas completas en zona horaria de Lima. Deja el campo vacío para cerrar el día. No elimina reservas ya confirmadas.</p><form className="d-grid gap-3" onSubmit={guardarHorario}>
        <label>Día<select className="form-select mt-1" value={dia} onChange={e=>elegirDia(Number(e.target.value))}>{DIAS.map((d,i)=><option key={d} value={i+1}>{d}</option>)}</select></label>
        <label>Intervalos<input className="form-control mt-1" value={intervalos} onChange={e=>setIntervalos(e.target.value)} placeholder="09:00-13:00,15:00-19:00"/></label>
        <button type="submit" disabled={ocupado} className="btn btn-vet"><Save size={17}/> Guardar horario</button>
      </form></section>}
      </div>
      <div className="col-lg-7"><section className="panel"><h2 className="h5">Profesionales registrados</h2><div className="table-responsive"><table className="table align-middle"><thead><tr><th>Veterinario</th><th>Estado</th><th></th></tr></thead><tbody>{veterinarios.map(v=><tr key={v.id}><td><strong>{v.nombre}</strong><small className="d-block text-muted">{v.especialidad}</small></td><td>{v.activo?'Activo':'Inactivo'}</td><td><button className="btn btn-outline-vet btn-sm" onClick={()=>elegirVeterinario(v)}>Editar</button></td></tr>)}</tbody></table></div>{!veterinarios.length&&<p className="text-muted">Registra profesionales reales autorizados antes de publicar los horarios.</p>}</section></div>
    </div>}
  </main>;
}
