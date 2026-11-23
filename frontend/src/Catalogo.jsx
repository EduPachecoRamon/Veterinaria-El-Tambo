import React, {useEffect,useMemo,useState} from 'react';
import {ChevronLeft,ChevronRight,Filter,PackageSearch,Phone,Search,ShoppingBag,SlidersHorizontal,RefreshCcw} from 'lucide-react';
import {api} from './api.js';
import {clinica} from './data/clinica.js';

const categorias=['Todas','Alimentos','Accesorios','Higiene','Otros'];
const ilustraciones={Alimentos:'🥣',Accesorios:'🐾',Higiene:'🫧',Otros:'🎾'};

function PresentacionProducto({producto}){
  const [fallo,setFallo]=useState(false);
  const categoria=categorias.includes(producto?.categoria)?producto.categoria:'Otros';
  const url=typeof producto?.imagenUrl==='string'&&/^https:\/\//.test(producto.imagenUrl)?producto.imagenUrl:null;
  return <div className={`catalog-art catalog-art-${categoria.toLowerCase()}`}>
    {url&&!fallo?<img loading="lazy" src={url} alt={`Fotografía ilustrativa de ${producto.nombre||'producto'}`} onError={()=>setFallo(true)}/>:<span className="catalog-art-icon" aria-hidden="true">{ilustraciones[categoria]}</span>}
  </div>;
}

export default function Catalogo(){
  const [categoria,setCategoria]=useState('Todas');
  const [pagina,setPagina]=useState(1);
  const [resultados,setResultados]=useState({data:[],total:0,lastPage:1});
  const [error,setError]=useState('');
  const [cargando,setCargando]=useState(true);
  const [busqueda,setBusqueda]=useState('');
  const [filtro,setFiltro]=useState('');
  const [orden,setOrden]=useState('nombre_asc');
  const [soloDisponibles,setSoloDisponibles]=useState(false);
  const [reintentos,setReintentos]=useState(0);

  useEffect(()=>{
    const id=setTimeout(()=>setFiltro(busqueda.trim()),320);
    return()=>clearTimeout(id);
  },[busqueda]);

  useEffect(()=>{
    const ctrl=new AbortController();
    setCargando(true);setError('');
    api.productos({page:pagina,...(categoria==='Todas'?{}:{categoria}),...(filtro?{q:filtro}:{}),...(soloDisponibles?{disponible:1}:{}),orden},{signal:ctrl.signal})
      .then(r=>{
        if(ctrl.signal.aborted)return;
        const data=Array.isArray(r?.data)?r.data.filter(x=>x&&typeof x==='object'):[];
        setResultados({data,total:Number(r?.total)||0,lastPage:Math.max(1,Number(r?.lastPage)||1)});
      })
      .catch(e=>{if(!ctrl.signal.aborted)setError(e.message||'No se pudo consultar el catálogo.');})
      .finally(()=>{if(!ctrl.signal.aborted)setCargando(false);});
    return()=>ctrl.abort();
  },[pagina,categoria,filtro,orden,soloDisponibles,reintentos]);

  const visibles=useMemo(()=>Array.isArray(resultados.data)?resultados.data:[],[resultados]);
  function actualizarCategoria(c){setCategoria(c);setPagina(1);}
  const precio=p=>{
    if(p?.precio===null||p?.precio===undefined||p?.precio==='')return 'Consultar precio';
    const n=Number(p.precio);
    return Number.isFinite(n)&&n>=0?`S/ ${n.toFixed(2)}`:'Consultar precio';
  };

  return <main className="container py-5 catalog-page">
    <div className="catalog-hero">
      <div><span className="section-kicker">TIENDA Y CUIDADO ANIMAL</span>
        <h1 className="section-heading">Todo para su bienestar</h1>
        <p>Explora alimentos, accesorios y artículos de higiene para mascotas. Descubre opciones, filtra por categoría y consulta los detalles desde un solo lugar.</p>
      </div>
      <div className="catalog-hero-symbol"><ShoppingBag size={56}/></div>
    </div>

    <div className="catalog-controls">
      <div className="catalog-search"><Search size={19}/><input className="form-control" type="search" value={busqueda} onChange={e=>{setBusqueda(e.target.value);setPagina(1);}} placeholder="Busca por producto o descripción" aria-label="Buscar productos"/></div>
      <div className="catalog-chips" aria-label="Categorías disponibles">{categorias.map(c=><button key={c} type="button" className={`catalog-chip ${categoria===c?'active':''}`} onClick={()=>actualizarCategoria(c)} aria-pressed={categoria===c}>{c}</button>)}</div>
      <div className="catalog-options">
        <label className="catalog-check"><input type="checkbox" checked={soloDisponibles} onChange={e=>{setSoloDisponibles(e.target.checked);setPagina(1);}}/> Solo artículos disponibles</label>
        <label className="catalog-sort"><SlidersHorizontal size={16}/> Ordenar <select className="form-select form-select-sm" value={orden} onChange={e=>{setOrden(e.target.value);setPagina(1);}}><option value="nombre_asc">Nombre A–Z</option><option value="precio_asc">Menor precio</option><option value="precio_desc">Mayor precio</option></select></label>
      </div>
    </div>
    {cargando&&<div className="catalog-loading" role="status" aria-live="polite">Consultando el catálogo…</div>}
    {error&&<div className="alert alert-warning" role="alert">
      <strong>El catálogo no pudo actualizarse.</strong> {error}
      <button className="btn btn-outline-vet btn-sm ms-2" onClick={()=>setReintentos(x=>x+1)}><RefreshCcw size={15}/> Volver a intentar</button>
    </div>}
    {!cargando&&!error&&<>
      <div className="catalog-results-header"><strong>{resultados.total} artículos</strong><span>Seleccionados para tu consulta</span></div>
      {visibles.length?<div className="row g-4">
        {visibles.map((p,i)=>{
          const categoria=categorias.includes(p.categoria)?p.categoria:'Otros';
          const nombre=typeof p.nombre==='string'&&p.nombre.trim()?p.nombre:'Artículo para mascotas';
          const ficticio=/\bdemo\b/i.test(nombre);
          return <div className="col-md-6 col-lg-4" key={p.id||i}>
            <article className="catalog-card h-100">
              <PresentacionProducto producto={p}/>
              <div className="catalog-card-body">
                <div className="catalog-card-labels"><span className="tag">{categoria}</span>{ficticio&&<small className="catalog-reference">Producto ilustrativo</small>}</div>
                <h2 className="h5">{nombre.replace(/\s*[—-]\s*DEMO\b/i,'')}</h2>
                <p className="catalog-description">{typeof p.descripcion==='string'?p.descripcion:'Consulta la información y disponibilidad del artículo.'}</p>
                <div className="catalog-card-bottom">
                  <strong className="catalog-price">{precio(p)}</strong>
                  <small>Precio referencial sujeto a confirmación</small>
                  <span className={p.disponible?'catalog-available':'catalog-unavailable'}>{p.disponible?'Consultar disponibilidad':'Disponibilidad por confirmar'}</span>
                  <a href={`tel:${clinica.telefono}`} className="btn btn-outline-vet"><Phone size={15}/> Consultar producto</a>
                </div>
              </div>
            </article>
          </div>;
        })}
      </div>:<div className="catalog-empty"><PackageSearch size={35}/><h2 className="h5 mt-3">No encontramos coincidencias</h2><p className="text-muted">Prueba otra palabra o selecciona una categoría diferente.</p><button className="btn btn-vet" type="button" onClick={()=>{setCategoria('Todas');setBusqueda('');setSoloDisponibles(false);setPagina(1);}}>Limpiar filtros</button></div>}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mt-4">
        <span className="small text-muted">Página {pagina} de {resultados.lastPage} · {resultados.total} registros</span>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-vet btn-sm" disabled={pagina<=1} onClick={()=>setPagina(x=>x-1)} aria-label="Página anterior"><ChevronLeft size={17}/></button>
          <button className="btn btn-outline-vet btn-sm" disabled={pagina>=resultados.lastPage} onClick={()=>setPagina(x=>x+1)} aria-label="Página siguiente"><ChevronRight size={17}/></button>
        </div>
      </div>
    </>}
    <p className="small text-muted mt-4 catalog-notice">Catálogo informativo del proyecto académico. Las imágenes y los precios referenciales no confirman inventario, promociones ni ventas de la clínica. No se realizan pagos por esta plataforma.</p>
  </main>;
}
