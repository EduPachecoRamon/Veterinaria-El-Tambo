import React,{useCallback,useEffect,useState} from 'react';
import {onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,GoogleAuthProvider,signInWithPopup,sendPasswordResetEmail,sendEmailVerification,reload} from 'firebase/auth';
import {CalendarDays,ChevronLeft,ChevronRight,ClipboardList,Clock3,HeartPulse,LogIn,LogOut,Menu,ShieldCheck,Stethoscope,Trash2,Pencil,RefreshCcw,ChartNoAxesColumn,CheckCircle2} from 'lucide-react';
import {auth} from './firebase.js';
import {api} from './api.js';
import {clasificarConexion,mensajeConexion} from './domain/conexion.js';
import Catalogo from './Catalogo.jsx';
import {BarChart} from './EstadisticasVisuales.jsx';
import Administracion from './Administracion.jsx';
import {clinica} from './data/clinica.js';
import {ESPECIES,vacio,validarCamposCita,citaAFormulario,formatearFecha} from './domain/citas.js';
const servicios=[['Consulta General','Evaluación física, diagnóstico y atención preventiva.','veterinaria.png'],['Vacunas y Desparasitación','Programas preventivos para perros y gatos.','vacunacion.jpg'],['Medicina Felina','Atención especializada y manejo de bajo estrés.','medicinafelina.jpg'],['Grooming y Estética','Higiene, baño y cuidado del pelaje.','groomingdoggo.jpg'],['Cirugía y Esterilización','Procedimientos clínicos y cuidados postoperatorios.','esterilizacionmasive.jpg'],['Farmacia Veterinaria','Productos veterinarios según indicación profesional.','logocool2.jpg']];
function Nav({page,setPage,user,rol}){return <><div className="top-strip"><div className="container d-flex justify-content-between"><span>Portal universitario de demostración · Huancayo</span><span>Consultas y reservas de prueba · No es un canal oficial</span></div></div><nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top"><div className="container"><a className="navbar-brand d-flex align-items-center fw-bold" href="#inicio" onClick={()=>setPage('inicio')}><img src={`${import.meta.env.BASE_URL}img/logocool.jpg`} className="rounded-circle me-2 brand-image" alt="Logo de la clínica"/>Vet El Tambo</a><button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navVet" aria-controls="navVet" aria-expanded="false" aria-label="Abrir menú"><Menu size={22}/></button><div className="collapse navbar-collapse" id="navVet"><div className="navbar-nav ms-auto gap-lg-2">{[['inicio','Inicio'],['servicios','Servicios'],['productos','Productos'],['citas','Citas'],['contacto','Contacto'],...(user?[['estadisticas','Estadísticas']]:[]),...(rol==='administrador'?[['administracion','Administración']]:[])].map(([id,label])=><a key={id} href={`#${id}`} className={`nav-link ${page===id?'active':''}`} aria-current={page===id?'page':undefined} onClick={()=>setPage(id)}>{label}</a>)}<a href="#citas" onClick={()=>setPage('citas')} className="btn btn-vet btn-sm align-self-lg-center ms-lg-2">{user?'Mis citas':'Ingresar'}</a></div></div></div></nav></>}
function Footer(){return <footer className="py-4 text-white bg-footer mt-auto"><div className="container d-flex justify-content-between align-items-center flex-wrap gap-3"><div><strong>Clínica Veterinaria El Tambo</strong><p className="mb-0 opacity-75 small">Proyecto académico no oficial · Datos sujetos a confirmación · 2026</p></div><img src={`${import.meta.env.BASE_URL}img/logocool2.jpg`} className="rounded-circle footer-logo" alt="Logo de la clínica"/></div></footer>}
function PasosReserva({setPage}){
  const pasos=[
    {numero:'01',titulo:'Explora nuestros servicios',texto:'Conoce las áreas de atención descritas en el portal.'},
    {numero:'02',titulo:'Consulta horarios',texto:'Accede con una cuenta de prueba y elige un turno disponible.'},
    {numero:'03',titulo:'Gestiona tus reservas',texto:'Revisa, edita o cancela desde tu historial personal.'}
  ];
  return <section className="steps-section py-5">
    <div className="container">
      <div className="text-center mb-4">
        <span className="section-kicker">UN PROCESO SENCILLO</span>
        <h2 className="section-heading">Tu agenda veterinaria, en tres pasos</h2>
        <p className="text-muted">Funcionalidades demostrativas con cuentas y reservas ficticias.</p>
      </div>
      <div className="row g-4">
        {pasos.map(paso=><div className="col-md-4" key={paso.numero}>
          <article className="step-card h-100">
            <span className="step-number" aria-hidden="true">{paso.numero}</span>
            <h3 className="h5 mt-3">{paso.titulo}</h3>
            <p className="mb-0 text-muted">{paso.texto}</p>
          </article>
        </div>)}
      </div>
      <div className="text-center mt-4"><a className="btn btn-vet btn-lg" href="#citas" onClick={()=>setPage('citas')}>Explorar citas <ChevronRight size={18}/></a></div>
    </div>
  </section>;
}
function Home({setPage}){return <><section className="hero"><div className="container py-5"><div className="row align-items-center gy-4"><div className="col-lg-7"><p className="eyebrow">PROYECTO ACADÉMICO · CUIDADO ANIMAL</p><h1>Salud y bienestar para tus mascotas</h1><p className="lead mt-3">Explora servicios, consulta productos para mascotas y prueba una agenda digital con acceso seguro desde cualquier dispositivo.</p><p className="small hero-disclaimer">Demostración universitaria independiente. No reemplaza la atención ni las reservas oficiales de la clínica.</p><div className="d-flex flex-wrap gap-2 mt-4"><a href="#citas" className="btn btn-light btn-lg fw-semibold" onClick={()=>setPage('citas')}>Solicitar una cita <ChevronRight size={18}/></a><a className="btn btn-outline-light btn-lg" href="#productos" onClick={()=>setPage('productos')}>Productos y accesorios</a></div></div><div className="col-lg-5"><img className="img-fluid hero-photo" src={`${import.meta.env.BASE_URL}img/perrolemaAD.jpg`} alt="Mascota atendida por la clínica"/></div></div></div></section><section className="container py-5"><div className="text-center mb-4"><span className="section-kicker">CUIDAMOS LO IMPORTANTE</span><h2 className="section-heading">Atención cercana y organizada</h2></div><div className="row g-4">{[[Stethoscope,'Atención médica','Servicios de salud animal en una sola plataforma.'],[CalendarDays,'Citas en línea','Registra y consulta tus citas desde tu cuenta.'],[ShieldCheck,'Datos personales','Acceso autenticado y separación de registros por usuario.']].map(([Icon,t,d])=><div className="col-md-4" key={t}><article className="feature"><div className="feature-icon"><Icon size={26}/></div><h3 className="h5 mt-3">{t}</h3><p className="text-muted mb-0">{d}</p></article></div>)}</div></section><section className="bg-soft py-5"><div className="container row align-items-center gy-4 mx-auto"><div className="col-md-6"><h2 className="section-heading">Servicios para cada etapa</h2><p>Consulta general, atención felina, prevención y estética veterinaria. Conoce las opciones del proyecto original.</p><a className="btn btn-vet" href="#servicios" onClick={()=>setPage('servicios')}>Ver los servicios</a></div><div className="col-md-6"><img className="img-fluid rounded-4 shadow-sm" src={`${import.meta.env.BASE_URL}img/gatolindoAD2.jpg`} alt="Gato saludable"/></div></div></section><PasosReserva setPage={setPage}/></>}
function Services(){const [term,setTerm]=useState('');const visibles=servicios.filter(([n,d])=>(n+' '+d).toLowerCase().includes(term.toLowerCase()));return <main className="container py-5"><div className="text-center mb-4"><span className="section-kicker">SERVICIOS</span><h1 className="section-heading">Nuestros servicios médicos</h1><p className="text-muted">Servicios descritos con fines académicos: confirma la disponibilidad y condiciones directamente con la clínica.</p></div><div className="search-area"><input className="form-control form-control-lg" aria-label="Buscar servicios" placeholder="Buscar consulta, vacunas, estética..." value={term} onChange={e=>setTerm(e.target.value)}/></div><div className="row g-4 mt-2">{visibles.map(([n,d,img])=><div key={n} className="col-md-6 col-lg-4"><article className="service-card h-100"><img src={`${import.meta.env.BASE_URL}img/${img}`} alt={n}/><div className="p-4"><h2 className="h5">{n}</h2><p className="text-muted mb-0">{d}</p></div></article></div>)}</div>{!visibles.length&&<p className="text-center py-5 text-muted">No encontramos servicios con esa búsqueda.</p>}</main>}
function Contact(){return <main className="container py-5"><div className="text-center mb-4"><span className="section-kicker">CONTACTO</span><h1 className="section-heading">Estamos para ayudarte</h1><p className="text-muted">Contacto publicado en directorios; confirmar directamente con la clínica antes de usarlo comercialmente.</p></div><div className="row g-4"><div className="col-md-7"><div className="panel h-100"><h2 className="h4">¿Necesitas atención?</h2><p>Consulta nuestros servicios, inicia sesión y registra una cita. El sistema conserva un historial personal en MongoDB mediante la API Laravel.</p><address className="mb-3">{clinica.direccion}</address><div className="d-flex gap-2 flex-wrap"><a className="btn btn-vet" href={`tel:${clinica.telefono}`}>Llamar {clinica.telefonoVisible}</a><a className="btn btn-outline-vet" href={clinica.facebook} target="_blank" rel="noopener noreferrer">Facebook</a><a className="btn btn-outline-secondary" href={clinica.maps} target="_blank" rel="noopener noreferrer">Cómo llegar</a></div><p className="small text-muted mt-3 mb-0">Datos provenientes de directorios públicos. Este portal es una demostración universitaria y no constituye el canal oficial de reservas ni ventas de la clínica.</p></div></div><div className="col-md-5"><img src={`${import.meta.env.BASE_URL}img/perroAD.jpg`} className="img-fluid rounded-4 shadow-sm" alt="Perro en atención veterinaria"/></div></div></main>}
function AuthPanel({setError}){
  const [mail,setMail]=useState('');
  const [pass,setPass]=useState('');
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const errors={
    'auth/email-already-in-use':'Este correo ya tiene una cuenta.',
    'auth/invalid-credential':'Correo o contraseña incorrectos.',
    'auth/weak-password':'La contraseña es demasiado corta.',
    'auth/invalid-email':'Ingresa un correo válido.',
    'auth/popup-blocked':'El navegador bloqueó la ventana emergente. Permite ventanas de este sitio.',
    'auth/popup-closed-by-user':'Se cerró la ventana antes de iniciar sesión.',
    'auth/unauthorized-domain':'Autoriza este dominio en Firebase Authentication → Configuración.',
    'auth/operation-not-allowed':'Este método de ingreso no está habilitado en Firebase.'
  };
  async function run(task){
    setBusy(true);
    setError('');
    setNotice('');
    try{await task();}
    catch(e){setError(errors[e.code]||'No se pudo completar la operación. Inténtalo nuevamente.');}
    finally{setBusy(false);}
  }
  function submit(register){
    return run(async()=>{
      if(register){
        const result=await createUserWithEmailAndPassword(auth,mail.trim(),pass);
        try{
          await sendEmailVerification(result.user);
          setNotice('Cuenta creada. Revisa tu correo para verificarla.');
        }catch{
          setNotice('Cuenta creada. Puedes solicitar la verificación desde tu sesión.');
        }
      }else{
        await signInWithEmailAndPassword(auth,mail.trim(),pass);
      }
      setPass('');
    });
  }
  function google(){
    return run(async()=>{
      const provider=new GoogleAuthProvider();
      provider.setCustomParameters({prompt:'select_account'});
      await signInWithPopup(auth,provider);
    });
  }
  function recover(){
    if(!mail.trim()){setError('Escribe tu correo para recuperar el acceso.');return;}
    return run(async()=>{
      await sendPasswordResetEmail(auth,mail.trim());
      setNotice('Si existe una cuenta para ese correo, recibirás instrucciones para recuperar el acceso.');
    });
  }
  return <div className="panel mx-auto auth-panel">
    <h2 className="h4">Accede a tus citas</h2>
    <p className="text-muted">Autenticación protegida con Firebase · Historial personal de reservas.</p>
    {notice&&<p className="alert alert-info" role="status">{notice}</p>}
    <form onSubmit={e=>{e.preventDefault();submit(false)}}>
      <label className="form-label" htmlFor="email">Correo electrónico</label>
      <input id="email" className="form-control mb-3" type="email" autoComplete="email" required value={mail} onChange={e=>setMail(e.target.value)}/>
      <label className="form-label" htmlFor="clave">Contraseña</label>
      <input id="clave" className="form-control mb-3" type="password" autoComplete="current-password" minLength="6" required value={pass} onChange={e=>setPass(e.target.value)}/>
      <div className="d-flex gap-2 flex-wrap">
        <button disabled={busy} className="btn btn-vet" type="submit"><LogIn size={17}/> Entrar</button>
        <button disabled={busy} type="button" onClick={()=>submit(true)} className="btn btn-outline-vet">Crear cuenta</button>
      </div>
    </form>
    <button className="btn btn-link px-0 mt-2" type="button" disabled={busy} onClick={recover}>¿Olvidaste tu contraseña?</button>
    <div className="auth-divider" aria-hidden="true">o</div>
    <button className="btn btn-google w-100" type="button" disabled={busy} onClick={google}>
      <span className="google-symbol" aria-hidden="true">G</span>
      Continuar con Google
    </button>
  </div>;
}

function VerificarCorreo({user}){
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [verified,setVerified]=useState(user.emailVerified);
  async function execute(task){
    setBusy(true);
    try{await task();}catch{setMessage('No se pudo consultar el estado. Intenta nuevamente.');}
    finally{setBusy(false);}
  }
  if(verified) return <p className="alert alert-success" role="status">Correo electrónico verificado correctamente.</p>;
  return <div className="alert alert-warning" role="status">
    <strong>Correo sin verificar.</strong> Revisa tu bandeja de entrada para confirmar la dirección de tu cuenta.
    <div className="d-flex flex-wrap gap-2 mt-2">
      <button type="button" className="btn btn-sm btn-outline-dark" disabled={busy} onClick={()=>execute(async()=>{await sendEmailVerification(user);setMessage('Mensaje de verificación enviado.');})}>Reenviar verificación</button>
      <button type="button" className="btn btn-sm btn-outline-dark" disabled={busy} onClick={()=>execute(async()=>{await reload(user);setVerified(user.emailVerified);setMessage(user.emailVerified?'Correo confirmado.':'Aún no se ha confirmado el correo.');})}>Comprobar estado</button>
    </div>
    {message&&<p className="small mt-2 mb-0">{message}</p>}
  </div>;
}

function EstadoConexion({user,estado,reintentar}) {
  return <main className="container py-5">
    <section className="connection-panel" role={estado==='checking'?'status':'alert'} aria-live="polite">
      <div className="connection-icon"><ShieldCheck size={32}/></div>
      <span className="section-kicker">TU CUENTA Y TUS RESERVAS</span>
      <h1 className="h3 mt-2">{estado==='checking'?'Verificando tu acceso…':'Servicio de reservas temporalmente no disponible'}</h1>
      <p className="text-muted">{mensajeConexion(estado)}</p>
      <p className="small">Sesión Firebase: <strong>{user?.email||'Cuenta autenticada'}</strong></p>
      <div className="d-flex gap-2 flex-wrap justify-content-center">
        <button className="btn btn-vet" onClick={reintentar} disabled={estado==='checking'}><RefreshCcw size={17}/> Reintentar conexión</button>
        <button className="btn btn-outline-secondary" onClick={()=>signOut(auth)}>Cerrar sesión</button>
        <a href="#contacto" className="btn btn-outline-vet">Ver contacto</a>
      </div>
      <p className="small text-muted mt-3 mb-0">El portal es un prototipo académico no oficial. No confirmes citas por este sistema hasta verificar el servicio.</p>
    </section>
  </main>;
}

function PanelIngreso(){
  const [error,setError]=useState('');
  return <>{error&&<p className="alert alert-danger" role="alert">{error}</p>}<AuthPanel setError={setError}/></>;
}

function Citas({user,estadoConexion,reintentar}) {
  if(user===undefined) return <EstadoConexion estado="checking" reintentar={reintentar}/>;
  if(!user) return <main className="container py-5">
    <div className="text-center mb-4"><span className="section-kicker">GESTIÓN DE CITAS</span><h1 className="section-heading">Reserva y administra tus citas</h1></div>
    <PanelIngreso/>
  </main>;
  if(estadoConexion!=='ready') return <EstadoConexion user={user} estado={estadoConexion} reintentar={reintentar}/>;
  return <CitasContenido user={user}/>;
}

function CitasContenido({user}) {
  const [form,setForm] = useState({...vacio,veterinarioId:''});
  const [edit,setEdit] = useState(null);
  const [list,setList] = useState([]);
  const [page,setPage] = useState(1);
  const [total,setTotal] = useState(0);
  const [periodo,setPeriodo] = useState('todas');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [info,setInfo] = useState('');
  const [metrics,setMetrics] = useState([]);
  const [veterinarios,setVeterinarios] = useState([]);
  const [turnos,setTurnos] = useState([]);
  const [cargandoTurnos,setCargandoTurnos] = useState(false);

  const medir = useCallback(async(tipo,func)=>{
    const start = performance.now();
    try {
      const resultado = await func();
      setMetrics(old=>[{
        tipo,ms:Math.round((performance.now()-start)*100)/100,
        ok:true,fecha:new Date().toLocaleTimeString('es-PE')
      },...old].slice(0,20));
      return resultado;
    } catch(e) {
      setMetrics(old=>[{
        tipo,ms:Math.round((performance.now()-start)*100)/100,
        ok:false,fecha:new Date().toLocaleTimeString('es-PE')
      },...old].slice(0,20));
      throw e;
    }
  },[]);

  const load = useCallback(async(p=1,f='todas')=>{
    if(!user)return;
    setBusy(true);
    setError('');
    try {
      const r = await medir('GET /citas',()=>api.listar({
        page:p,periodo:f,perPage:10
      }));
      setList(r.data);
      setTotal(r.total);
      setPage(r.page);
    } catch(e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  },[user,medir]);

  useEffect(()=>{
    if(!user){
      setList([]);
      setVeterinarios([]);
      return;
    }
    load(1,periodo);
  },[user,periodo,load]);

  useEffect(()=>{
    if(!user)return;
    let vigente=true;
    api.veterinarios()
      .then(r=>{if(vigente)setVeterinarios(r.data||[]);})
      .catch(e=>{if(vigente)setError(e.message);});
    return()=>{vigente=false;};
  },[user]);

  useEffect(()=>{
    if(!user||!form.veterinarioId||!form.fecha){
      setTurnos([]);
      setCargandoTurnos(false);
      return;
    }
    let vigente=true;
    setTurnos([]);
    setCargandoTurnos(true);
    api.disponibilidad(form.veterinarioId,form.fecha)
      .then(r=>{if(vigente)setTurnos(r.turnos||[]);})
      .catch(e=>{if(vigente)setError(e.message);})
      .finally(()=>{if(vigente)setCargandoTurnos(false);});
    return()=>{vigente=false;};
  },[user,form.veterinarioId,form.fecha]);

  function reset(){
    setForm({...vacio,veterinarioId:''});
    setEdit(null);
    setTurnos([]);
  }

  async function save(e){
    e.preventDefault();
    setError('');
    const turno = turnos.find(t=>t.hora===form.hora &&
      (t.disponible || (edit && edit.fechaHora===t.fechaHora &&
       edit.veterinarioId===form.veterinarioId)));

    if(!turno){
      setError('Selecciona un turno disponible.');
      return;
    }

    setBusy(true);
    try {
      const datos = {
        ...validarCamposCita(form),
        veterinarioId:form.veterinarioId,
        fechaHora:turno.fechaHora
      };

      await medir(edit?'PUT /citas':'POST /citas',()=>
        edit?api.editar(edit.id,datos):api.crear(datos)
      );
      reset();
      await load(1,periodo);
      setInfo('Cita guardada correctamente.');
    } catch(e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(c){
    if(!confirm('¿Cancelar la cita de '+c.mascota+'?'))return;
    setBusy(true);
    setError('');
    try {
      await medir('DELETE /citas',()=>api.eliminar(c.id));
      if(edit?.id===c.id)reset();
      await load(page,periodo);
      setInfo('Cita cancelada.');
    } catch(e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function editar(c){
    setEdit(c);
    const datos=citaAFormulario(c);
    setForm({...datos,veterinarioId:c.veterinarioId||''});
    setError('');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  return <main className="container py-5">
    <div className="text-center mb-4">
      <span className="section-kicker">GESTIÓN DE CITAS</span>
      <h1 className="section-heading">Reserva y administra tus citas</h1>
      <p className="text-muted">Consulta horarios, registra tus reservas de prueba y revisa tu historial con acceso seguro.</p>
    </div>

    {error&&<div className="alert alert-danger" role="alert">{error}</div>}
    {info&&<div className="alert alert-info" role="status">{info}</div>}

    {!user?<AuthPanel setError={setError}/>:<>
      <div className="panel mb-4 d-flex justify-content-between align-items-center">
        <span>Cuenta: <strong>{user.email}</strong></span>
        <button className="btn btn-outline-secondary btn-sm"
          onClick={()=>signOut(auth)}>Cerrar sesión</button>
      </div>

      {!user.emailVerified&&user.providerData?.some(p=>p.providerId==='password')&&<VerificarCorreo user={user}/>}
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="panel h-100">
            <h2 className="h4 mb-3">{edit?'Editar cita':'Registrar nueva cita'}</h2>
            <form onSubmit={save} className="d-grid gap-3">
              {[
                ['propietario','Nombre del propietario',80],
                ['mascota','Nombre de la mascota',60],
                ['motivo','Motivo de la consulta',160]
              ].map(([key,label,max])=>
                <label key={key}>{label}
                  <input required className="form-control mt-1"
                    maxLength={max} value={form[key]}
                    onChange={e=>setForm(o=>({...o,[key]:e.target.value}))}/>
                </label>
              )}

              <label>Especie
                <select className="form-select mt-1" value={form.especie}
                  onChange={e=>setForm(o=>({...o,especie:e.target.value}))}>
                  {ESPECIES.map(s=><option key={s}>{s}</option>)}
                </select>
              </label>

              <label>Veterinario
                <select required className="form-select mt-1"
                  value={form.veterinarioId}
                  onChange={e=>setForm(o=>({...o,veterinarioId:e.target.value,hora:''}))}>
                  <option value="">Selecciona un veterinario</option>
                  {veterinarios.map(v=>
                    <option key={v.id} value={v.id}>
                      {v.nombre} - {v.especialidad}
                    </option>
                  )}
                </select>
              </label>

              <label>Fecha de atención
                <input required type="date" className="form-control mt-1"
                  value={form.fecha}
                  onChange={e=>setForm(o=>({...o,fecha:e.target.value,hora:''}))}/>
              </label>

              <label>Horario disponible (hora de Perú)
                <select required className="form-select mt-1"
                  value={form.hora}
                  disabled={!form.fecha||!form.veterinarioId||cargandoTurnos}
                  onChange={e=>setForm(o=>({...o,hora:e.target.value}))}>
                  <option value="">Selecciona un horario</option>
                  {turnos.filter(t=>t.disponible ||
                    (edit && edit.fechaHora===t.fechaHora &&
                     edit.veterinarioId===form.veterinarioId))
                    .map(t=><option key={t.fechaHora} value={t.hora}>
                      {t.hora}
                    </option>)}
                </select>
              </label>

              {cargandoTurnos&&<p className="small text-muted">Consultando horarios...</p>}
              {!cargandoTurnos&&form.fecha&&form.veterinarioId&&
                !turnos.some(t=>t.disponible)&&
                <p className="small text-muted">No hay turnos libres para esta fecha.</p>}

              <div className="d-flex gap-2">
                <button className="btn btn-vet" type="submit"
                  disabled={busy||cargandoTurnos}>
                  {edit?'Guardar cambios':'Crear cita'}
                </button>
                {edit&&<button type="button" className="btn btn-outline-secondary"
                  onClick={reset}>Cancelar edición</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="panel h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 mb-0">Mis citas</h2>
              <select className="form-select form-select-sm w-auto"
                value={periodo}
                onChange={e=>{setPeriodo(e.target.value);setPage(1);}}>
                <option value="todas">Todas</option>
                <option value="proximas">Próximas</option>
                <option value="anteriores">Anteriores</option>
              </select>
            </div>

            {busy&&<p className="text-muted">Consultando...</p>}

            {list.map(c=><article className="appointment" key={c.id}>
              <div className="d-flex justify-content-between gap-2">
                <div>
                  <strong>{c.mascota}</strong>
                  <span className="tag ms-2">{c.especie}</span>
                  <p className="small text-muted mb-1">{c.propietario}</p>
                  <p className="mb-1">{formatearFecha(c.fechaHora)}</p>
                  <p className="small mb-1">{c.motivo}</p>
                  <span className="badge text-bg-secondary">{c.estado}</span>
                </div>
                {c.estado==='confirmada'&&
                  <div className="d-flex flex-column gap-2">
                    <button className="btn btn-outline-vet btn-sm"
                      disabled={busy} aria-label={`Editar cita de ${c.mascota}`} title="Editar cita" onClick={()=>editar(c)}>
                      <Pencil size={16}/>
                    </button>
                    <button className="btn btn-outline-danger btn-sm"
                      disabled={busy} aria-label={`Cancelar cita de ${c.mascota}`} title="Cancelar cita" onClick={()=>remove(c)}>
                      <Trash2 size={16}/>
                    </button>
                  </div>}
              </div>
            </article>)}

            {!list.length&&!busy&&
              <p className="text-muted">No hay citas para este filtro.</p>}

            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="small text-muted">
                Página {page} · {total} registros
              </span>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-vet btn-sm"
                  disabled={busy||page<=1}
                  aria-label="Página anterior" onClick={()=>load(page-1,periodo)}>
                  <ChevronLeft size={17}/>
                </button>
                <button className="btn btn-outline-vet btn-sm"
                  disabled={busy||page*10>=total}
                  aria-label="Página siguiente" onClick={()=>load(page+1,periodo)}>
                  <ChevronRight size={17}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel mt-4">
        <h2 className="h5">Diagnóstico de consultas · Unidad 3</h2>
        <p className="text-muted small">
          Duración observada desde el navegador, incluyendo red y procesamiento.
        </p>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead><tr>
              <th>Operación</th><th>Duración</th><th>Resultado</th><th>Hora</th>
            </tr></thead>
            <tbody>{metrics.map((m,i)=><tr key={i}>
              <td>{m.tipo}</td><td>{m.ms} ms</td>
              <td>{m.ok?'Correcto':'Error'}</td><td>{m.fecha}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
    </>}
  </main>;
}
function EstadisticasConAcceso({user,estadoConexion,reintentar}){
  if(user===undefined) return <EstadoConexion estado="checking" reintentar={reintentar}/>;
  if(user&&estadoConexion!=='ready') return <EstadoConexion user={user} estado={estadoConexion} reintentar={reintentar}/>;
  return <Stats user={user}/>;
}
function Stats({user}){
  const [data,setData]=useState(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  async function load(){
    setLoading(true);
    setError('');
    try{setData(await api.estadisticas());}
    catch(e){setError(e.message);}
    finally{setLoading(false);}
  }
  useEffect(()=>{if(user)load();},[user]);
  return <main className="container py-5">
    <div className="text-center mb-4">
      <span className="section-kicker">SPRING BOOT + MONGODB</span>
      <h1 className="section-heading">Estadísticas de mis citas</h1>
      <p className="text-muted">Indicadores calculados a partir de las reservas de tu cuenta.</p>
    </div>
    {!user?<AuthPanel setError={setError}/>:<div className="panel">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2 className="h4">Resumen de actividad</h2>
        <button onClick={load} disabled={loading} className="btn btn-outline-vet btn-sm">
          <RefreshCcw size={16}/> Actualizar
        </button>
      </div>
      {loading&&<p role="status" aria-live="polite">Calculando estadísticas…</p>}
      {error&&<p role="alert" className="alert alert-danger">{error}</p>}
      {data?.disponible===false&&<p className="alert alert-warning">{data.mensaje||'El servicio Spring no está disponible.'}</p>}
      {data?.disponible&&<div aria-live="polite">
        <div className="stats-number">{data.total}</div>
        <p>Citas registradas por tu cuenta</p>
        <div className="row g-4">
          <div className="col-lg-4"><BarChart title="Por especie" entries={data.porEspecie||[]} labelKey="especie"/></div>
          <div className="col-lg-4"><BarChart title="Por estado" entries={data.porEstado||[]} labelKey="estado"/></div>
          <div className="col-lg-4"><BarChart title="Por mes" entries={data.porMes||[]} labelKey="mes"/></div>
        </div>
      </div>}
      {!data&&!loading&&!error&&<p>Solicita las estadísticas del servicio.</p>}
    </div>}
  </main>;
}
export default function App(){
  const [page,setPage]=useState(location.hash.slice(1)||'inicio');
  const [user,setUser]=useState(undefined);
  const [rol,setRol]=useState(null);
  const [estadoConexion,setEstadoConexion]=useState('checking');
  const [intentos,setIntentos]=useState(0);
  useEffect(()=>onAuthStateChanged(auth,setUser,()=>setUser(null)),[]);
  useEffect(()=>{
    let activo=true;
    setRol(null);
    if(user===undefined) {
      setEstadoConexion('checking');
    } else if(!user) {
      setEstadoConexion('signedout');
    } else {
      setEstadoConexion('checking');
      api.yo()
        .then(r=>{if(activo){setRol(r.rol);setEstadoConexion('ready');}})
        .catch(e=>{if(activo)setEstadoConexion(clasificarConexion(e));});
    }
    return()=>{activo=false;};
  },[user,intentos]);
  const reintentar=()=>setIntentos(i=>i+1);
  useEffect(()=>{
    const onHash=()=>setPage(location.hash.slice(1)||'inicio');
    addEventListener('hashchange',onHash);
    return()=>removeEventListener('hashchange',onHash);
  },[]);
  return <div className="app"><a className="skip-link" href="#contenido-principal">Saltar al contenido principal</a>
    <Nav page={page} setPage={setPage} user={user} rol={rol}/>
    <div id="contenido-principal" tabIndex="-1" className="page-content">
    {page==='servicios'?<Services/>:
      page==='productos'?<Catalogo/>:
      page==='citas'?<Citas user={user} estadoConexion={estadoConexion} reintentar={reintentar}/>:
      page==='contacto'?<Contact/>:
      page==='estadisticas'?<EstadisticasConAcceso user={user} estadoConexion={estadoConexion} reintentar={reintentar}/>:
      page==='administracion'?user&&estadoConexion!=='ready'?<EstadoConexion user={user} estado={estadoConexion} reintentar={reintentar}/>:<Administracion rol={rol}/>:
      <Home setPage={setPage}/>}
    </div>
    <Footer/>
  </div>;
}
