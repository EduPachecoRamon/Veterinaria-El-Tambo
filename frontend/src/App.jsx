import React,{useCallback,useEffect,useState} from 'react';
import {onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,GoogleAuthProvider,signInWithPopup,sendPasswordResetEmail,sendEmailVerification,reload} from 'firebase/auth';
import {CalendarDays,ChevronLeft,ChevronRight,ClipboardList,Clock3,HeartPulse,LogIn,LogOut,Menu,ShieldCheck,Stethoscope,Trash2,Pencil,RefreshCcw,ChartNoAxesColumn,CheckCircle2,UserRound,LayoutDashboard,ChevronDown,ImagePlus} from 'lucide-react';
import {auth} from './firebase.js';
import {api} from './api.js';
import {clasificarConexion,mensajeConexion} from './domain/conexion.js';
import Catalogo from './Catalogo.jsx';
import {BarChart} from './EstadisticasVisuales.jsx';
import Administracion from './Administracion.jsx';
import Agenda from './Agenda.jsx';
import CrashBoundary from './CrashBoundary.jsx';
import FotoPrivada from './FotoPrivada.jsx';
import {guardarMetrica} from './domain/metricas.js';
import {clinica} from './data/clinica.js';
import {ESPECIES,vacio,validarCamposCita,citaAFormulario,formatearFecha} from './domain/citas.js';
const servicios=[['Consulta General','Evaluación física, diagnóstico y atención preventiva.','veterinaria.png'],['Vacunas y Desparasitación','Programas preventivos para perros y gatos.','vacunacion.jpg'],['Medicina Felina','Atención especializada y manejo de bajo estrés.','medicinafelina.jpg'],['Grooming y Estética','Higiene, baño y cuidado del pelaje.','groomingdoggo.jpg'],['Cirugía y Esterilización','Procedimientos clínicos y cuidados postoperatorios.','esterilizacionmasive.jpg'],['Farmacia Veterinaria','Productos veterinarios según indicación profesional.','logocool2.jpg']];
function Nav({page,setPage,user,rol}){
  const [open,setOpen]=useState(false);
  const [cuenta,setCuenta]=useState(false);
  useEffect(()=>{setOpen(false);setCuenta(false);},[page]);
  useEffect(()=>{
    const cerrar=e=>{if(e.key==='Escape')setCuenta(false);};
    window.addEventListener('keydown',cerrar);
    return()=>window.removeEventListener('keydown',cerrar);
  },[]);
  const elegir=id=>{setPage(id);setOpen(false);setCuenta(false);};
  const links=[['inicio','Inicio'],['servicios','Servicios'],['productos','Productos'],['contacto','Contacto']];
  return <>
    <div className="top-strip"><div className="container top-strip-inner"><span>Bienestar animal y atención digital</span><span>Portal académico de la Clínica Veterinaria El Tambo</span></div></div>
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top nav-premium" aria-label="Navegación principal">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center fw-bold" href="#inicio" onClick={()=>elegir('inicio')}>
          <img src={`${import.meta.env.BASE_URL}img/logocool.jpg`} className="rounded-circle me-2 brand-image" alt="Identidad visual de la clínica"/>
          <span>Vet El Tambo</span>
        </a>
        <button className="navbar-toggler" type="button" onClick={()=>setOpen(v=>!v)} aria-controls="navVet" aria-expanded={open} aria-label={open?'Cerrar menú':'Abrir menú'}><Menu size={22}/></button>
        <div className={`collapse navbar-collapse ${open?'show':''}`} id="navVet">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            {links.map(([id,label])=><a key={id} href={`#${id}`} className={`nav-link ${page===id?'active':''}`} aria-current={page===id?'page':undefined} onClick={()=>elegir(id)}>{label}</a>)}
            {user&&<a href="#agenda" onClick={()=>elegir('agenda')} className={`nav-link ${page==='agenda'?'active':''}`}>Horarios</a>}
            {rol==='administrador'&&<a className="btn btn-admin-access btn-sm ms-lg-2" href="#administracion" onClick={()=>elegir('administracion')}><LayoutDashboard size={16}/> Personal</a>}
            <a href="#citas" onClick={()=>elegir('citas')} className="btn btn-vet btn-sm ms-lg-2"><CalendarDays size={16}/>{user?'Mis citas':'Reservar'}</a>
            {user&&<div className="account-menu" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setCuenta(false);}}>
              <button type="button" className="account-trigger" aria-haspopup="true" aria-expanded={cuenta} onClick={()=>setCuenta(v=>!v)} aria-label="Opciones de mi cuenta">
                <span className="account-avatar"><UserRound size={18}/></span><span className="account-label">Cuenta</span><ChevronDown size={14}/>
              </button>
              {cuenta&&<div className="account-dropdown" role="menu">
                <div className="account-identity" title={user.email||''}><small>{rol==='administrador'?'Acceso de personal autorizado':'Sesión activa'}</small><strong>{user.email||'Usuario autenticado'}</strong></div>
                <a role="menuitem" href="#citas" onClick={()=>elegir('citas')}><ClipboardList size={16}/> Mis reservas</a>
                <a role="menuitem" href="#agenda" onClick={()=>elegir('agenda')}><Clock3 size={16}/> Consultar horarios</a>
                <a role="menuitem" href="#estadisticas" onClick={()=>elegir('estadisticas')}><ChartNoAxesColumn size={16}/> Mi actividad</a>
                {rol==='administrador'&&<a role="menuitem" href="#administracion" onClick={()=>elegir('administracion')}><LayoutDashboard size={16}/> Panel del personal</a>}
                <button type="button" role="menuitem" className="account-logout" onClick={()=>{setCuenta(false);signOut(auth);}}><LogOut size={16}/> Cerrar sesión</button>
              </div>}
            </div>}
          </div>
        </div>
      </div>
    </nav>
  </>;
}
function Footer(){
  return <footer className="py-4 text-white bg-footer mt-auto">
    <div className="container footer-grid">
      <div>
        <strong className="footer-title">Veterinaria El Tambo · Prototipo universitario</strong>
        <p className="mb-1 opacity-75 small">Proyecto académico no oficial. Las reservas, productos, precios y horarios son demostrativos o están sujetos a confirmación.</p>
        <p className="small opacity-75 mb-0">React · Firebase · Laravel · Spring Boot · MongoDB Atlas</p>
      </div>
      <nav className="footer-links" aria-label="Enlaces del pie">
        <a href="#servicios">Servicios</a><a href="#productos">Catálogo</a><a href="#citas">Citas</a><a href="#contacto">Contacto</a>
      </nav>
    </div>
  </footer>;
}
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
function Services(){const [term,setTerm]=useState('');const visibles=servicios.filter(([n,d])=>(n+' '+d).toLowerCase().includes(term.toLowerCase()));return <main className="container py-5"><div className="text-center mb-4"><span className="section-kicker">SERVICIOS</span><h1 className="section-heading">Nuestros servicios médicos</h1><p className="text-muted">Áreas ilustrativas para la presentación universitaria. Los tratamientos, horarios y disponibilidad deben confirmarse con la clínica.</p></div><div className="search-area"><input className="form-control form-control-lg" aria-label="Buscar servicios" placeholder="Buscar consulta, vacunas, estética..." value={term} onChange={e=>setTerm(e.target.value)}/></div><div className="row g-4 mt-2">{visibles.map(([n,d,img])=><div key={n} className="col-md-6 col-lg-4"><article className="service-card h-100"><img src={`${import.meta.env.BASE_URL}img/${img}`} alt={n}/><div className="p-4"><h2 className="h5">{n}</h2><p className="text-muted">{d}</p><a className="btn btn-outline-vet btn-sm" href="#citas">Ver horarios disponibles</a></div></article></div>)}</div>{!visibles.length&&<p className="text-center py-5 text-muted">No encontramos servicios con esa búsqueda.</p>}</main>}
function PreguntasFrecuentes(){
  const items=[
    ['¿Estas citas son oficiales?','No. Son reservas de demostración para una evaluación universitaria; no sustituyen un canal oficial de atención.'],
    ['¿Se puede comprar desde el catálogo?','No se realizan compras ni pagos. Los artículos etiquetados DEMO son ejemplos ficticios para probar filtros y administración.'],
    ['¿Dónde puedo revisar una reserva?','Inicia sesión con Firebase y entra en Citas para consultar, modificar o cancelar tus propios registros de prueba.'],
    ['¿Cómo se protegen mis datos?','El servidor verifica el token Firebase y restringe las consultas a la cuenta autenticada. Para demostraciones, evita ingresar información sensible real.']
  ];
  return <section className="faq-section mt-5" aria-labelledby="faq-heading">
    <div className="text-center mb-4">
      <span className="section-kicker">PREGUNTAS FRECUENTES</span>
      <h2 id="faq-heading" className="section-heading">Cómo funciona este portal</h2>
    </div>
    <div className="faq-grid">
      {items.map(([titulo,detalle])=><details className="faq-item" key={titulo}>
        <summary>{titulo}</summary>
        <p className="text-muted mb-0 mt-2">{detalle}</p>
      </details>)}
    </div>
  </section>;
}
function Contact(){return <main className="container py-5"><div className="text-center mb-4"><span className="section-kicker">CONTACTO</span><h1 className="section-heading">Estamos para ayudarte</h1><p className="text-muted">Contacto publicado en directorios; confirmar directamente con la clínica antes de usarlo comercialmente.</p></div><div className="row g-4"><div className="col-md-7"><div className="panel h-100"><h2 className="h4">¿Necesitas atención?</h2><p>Consulta nuestros servicios, inicia sesión y registra una cita. El sistema conserva un historial personal en MongoDB mediante la API Laravel.</p><address className="mb-3">{clinica.direccion}</address><div className="d-flex gap-2 flex-wrap"><a className="btn btn-vet" href={`tel:${clinica.telefono}`}>Llamar {clinica.telefonoVisible}</a><a className="btn btn-outline-vet" href={clinica.facebook} target="_blank" rel="noopener noreferrer">Facebook</a><a className="btn btn-outline-secondary" href={clinica.maps} target="_blank" rel="noopener noreferrer">Cómo llegar</a></div><p className="small text-muted mt-3 mb-0">Datos provenientes de directorios públicos. Este portal es una demostración universitaria y no constituye el canal oficial de reservas ni ventas de la clínica.</p></div></div><div className="col-md-5"><img src={`${import.meta.env.BASE_URL}img/perroAD.jpg`} className="img-fluid rounded-4 shadow-sm" alt="Perro en atención veterinaria"/></div></div><PreguntasFrecuentes/></main>}
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
  if(verified) return <div className="verification-banner verified" role="status"><ShieldCheck size={19}/> Dirección de correo confirmada correctamente.</div>;
  return <section className="verification-banner" aria-labelledby="verification-heading">
    <div className="verification-icon"><ShieldCheck size={22}/></div>
    <div className="verification-copy">
      <h3 id="verification-heading">Verifica tu dirección de correo</h3>
      <p>Confirma el enlace enviado a tu bandeja de entrada para completar la configuración de tu cuenta.</p>
      {message&&<p className="verification-feedback" role="status">{message}</p>}
    </div>
    <div className="verification-actions">
      <button type="button" className="btn btn-sm btn-outline-vet" disabled={busy} onClick={()=>execute(async()=>{await sendEmailVerification(user);setMessage('Mensaje de verificación enviado.');})}>Reenviar correo</button>
      <button type="button" className="btn btn-sm btn-vet" disabled={busy} onClick={()=>execute(async()=>{await reload(user);setVerified(user.emailVerified);setMessage(user.emailVerified?'Correo confirmado.':'Aún no se ha confirmado el correo.');})}>Comprobar estado</button>
    </div>
  </section>;
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
  const [foto,setFoto] = useState(null);
  const [veterinarios,setVeterinarios] = useState([]);
  const [turnos,setTurnos] = useState([]);
  const [cargandoTurnos,setCargandoTurnos] = useState(false);

  const medir = useCallback(async(tipo,func)=>{
    const inicio=performance.now();
    try{
      const resultado=await func();
      guardarMetrica({tipo,ms:Math.round((performance.now()-inicio)*100)/100,ok:true,fecha:new Date().toLocaleTimeString('es-PE')});
      return resultado;
    }catch(e){
      guardarMetrica({tipo,ms:Math.round((performance.now()-inicio)*100)/100,ok:false,fecha:new Date().toLocaleTimeString('es-PE')});
      throw e;
    }
  },[]);

  useEffect(()=>{
    try {
      const seleccion=JSON.parse(sessionStorage.getItem('vet-agenda-seleccion')||'null');
      if(seleccion?.veterinarioId&&seleccion?.fecha&&seleccion?.hora){
        setForm(o=>({...o,veterinarioId:seleccion.veterinarioId,fecha:seleccion.fecha,hora:seleccion.hora}));
      }
      sessionStorage.removeItem('vet-agenda-seleccion');
    } catch {}
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
    setFoto(null);
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

      const resultado=await medir(edit?'PUT /citas':'POST /citas',()=>
        edit?api.editar(edit.id,datos):api.crear(datos)
      );
      const citaId=resultado?.data?.id||edit?.id;
      let avisoFoto='';
      if(foto&&citaId){
        try{
          await api.subirFoto(citaId,foto);
        }catch(error){
          avisoFoto=' La cita se guardó, pero no fue posible adjuntar la imagen: '+error.message;
        }
      }
      reset();
      await load(1,periodo);
      setInfo(avisoFoto?'Cita guardada.'+avisoFoto:'Cita y cambios guardados correctamente.');
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

  async function fotoExistente(id,file){
    if(!file)return;
    setBusy(true);setError('');
    try{
      await api.subirFoto(id,file);
      await load(page,periodo);
      setInfo('Fotografía adjuntada a la reserva.');
    }catch(e){setError(e.message);}
    finally{setBusy(false);}
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
      <section className="booking-hero-v2" aria-labelledby="booking-hero-heading">
        <div className="booking-hero-glow" aria-hidden="true"/>
        <div className="booking-hero-main">
          <span className="booking-hero-eyebrow"><ShieldCheck size={16}/> TU ESPACIO VETERINARIO</span>
          <h2 id="booking-hero-heading">Cada cuidado comienza con una buena cita.</h2>
          <p>Organiza la atención de tus mascotas, consulta horarios libres y mantén tus reservas bajo control, todo desde un solo lugar.</p>
          <div className="booking-hero-actions">
            <a className="btn booking-hero-primary" href="#agenda"><CalendarDays size={18}/> Consultar horarios</a>
            <a className="btn booking-hero-secondary" href="#estadisticas"><ChartNoAxesColumn size={18}/> Mi actividad</a>
          </div>
        </div>
        <aside className="booking-hero-overview" aria-label="Resumen de reservas">
          <div className="booking-hero-overview-top"><span className="booking-overview-icon"><ClipboardList size={21}/></span><span>Mi agenda</span></div>
          <strong>{Number.isFinite(Number(total))?Number(total):0}</strong>
          <span className="booking-overview-label">Reservas en el filtro actual</span>
          <div className="booking-overview-foot"><span className="booking-status-dot"/> Sesión protegida con Firebase</div>
        </aside>
      </section>

      {!user.emailVerified&&user.providerData?.some(p=>p.providerId==='password')&&<VerificarCorreo user={user}/>}
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="panel h-100 booking-panel">
            <div className="booking-panel-heading"><span className="booking-panel-icon"><CalendarDays size={22}/></span><div><h2 className="h4 mb-1">{edit?'Editar tu reserva':'Solicitar una cita'}</h2><p className="small text-muted mb-0">Completa los datos de tu mascota y elige un horario disponible.</p></div></div>
            {!veterinarios.length&&!busy&&<p className="alert alert-info small" role="status">Aún no hay profesionales habilitados en la agenda. Un administrador debe registrar sus horarios antes de recibir reservas de prueba.</p>}
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
                  <option value="">{veterinarios.length?'Selecciona un veterinario':'Sin profesionales publicados'}</option>
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

              <label className="photo-upload-label">Adjuntar foto de la mascota (opcional)
                <input className="form-control mt-2" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setFoto(e.target.files?.[0]||null)}/>
                <small className="text-muted">JPEG, PNG o WebP · máximo 3 MB. La imagen solo estará disponible para el propietario y el personal autorizado.</small>
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
          <div className="panel h-100 booking-panel">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div className="booking-panel-heading compact"><span className="booking-panel-icon"><ClipboardList size={21}/></span><div><h2 className="h4 mb-0">Historial de reservas</h2><small className="text-muted">Consulta, modifica y revisa tus citas.</small></div></div>
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
                  <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                    {c.tieneFoto?<FotoPrivada citaId={c.id}/>:<label className="btn btn-outline-vet btn-sm photo-attach-label"><ImagePlus size={15}/> Adjuntar foto
                      <input className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>fotoExistente(c.id,e.target.files?.[0])}/>
                    </label>}
                  </div>
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
      {data?.disponible===false&&<div className="alert alert-warning" role="status"><p className="mb-2">{data.mensaje||'El servicio de estadísticas no está disponible.'}</p><p className="mb-0 small">La sesión y las citas permanecen disponibles; vuelve a intentar en unos momentos.</p></div>}
      {data?.disponible&&<div aria-live="polite">
        <div className="data-source" role="status">{data.fuente==='spring'?'Fuente verificada: Spring Boot + MongoDB Atlas':'Modo de respaldo: Laravel + MongoDB Atlas. El servicio Spring se está recuperando.'}</div>
        <div className="stats-number">{data.total}</div>
        <p>Citas registradas por tu cuenta, incluidas las canceladas</p>
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
    <CrashBoundary key={page} section={page}>
    {page==='servicios'?<Services/>:
      page==='productos'?<Catalogo/>:
      page==='citas'?<Citas user={user} estadoConexion={estadoConexion} reintentar={reintentar}/>:
      page==='agenda'?user&&estadoConexion!=='ready'?<EstadoConexion user={user} estado={estadoConexion} reintentar={reintentar}/>:user?<Agenda/>:<Citas user={user} estadoConexion={estadoConexion} reintentar={reintentar}/>:
      page==='contacto'?<Contact/>:
      page==='estadisticas'?<EstadisticasConAcceso user={user} estadoConexion={estadoConexion} reintentar={reintentar}/>:
      page==='administracion'?user&&estadoConexion!=='ready'?<EstadoConexion user={user} estado={estadoConexion} reintentar={reintentar}/>:<Administracion rol={rol}/>:
      <Home setPage={setPage}/>}
    </CrashBoundary>
    </div>
    <Footer/>
  </div>;
}
