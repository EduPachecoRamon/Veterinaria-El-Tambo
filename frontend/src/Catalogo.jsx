import {useEffect, useState} from 'react';
import {ChevronLeft, ChevronRight, ExternalLink, PackageSearch, Phone} from 'lucide-react';
import {api} from './api.js';
import {clinica} from './data/clinica.js';

const categorias = ['Todas', 'Alimentos', 'Accesorios', 'Higiene', 'Otros'];
const ilustraciones = {Alimentos:'🥣',Accesorios:'🐾',Higiene:'🫧',Otros:'🎾'};

export default function Catalogo() {
  const [categoria, setCategoria] = useState('Todas');
  const [pagina, setPagina] = useState(1);
  const [resultados, setResultados] = useState({data: [], total: 0, lastPage: 1});
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [orden, setOrden] = useState('nombre_asc');
  const [disponible, setDisponible] = useState('todos');

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(busqueda.trim()), 350);
    return () => clearTimeout(id);
  }, [busqueda]);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError('');
    api.productos({page: pagina, ...(categoria === 'Todas' ? {} : {categoria}), ...(debouncedSearch ? {q: debouncedSearch} : {}), ...(disponible === 'todos' ? {} : {disponible: disponible === 'si' ? 1 : 0}), orden}, {signal: controller.signal})
      .then(r => {if (!controller.signal.aborted) setResultados(r);})
      .catch(e => {if (!controller.signal.aborted) setError(e.message);})
      .finally(() => {if (!controller.signal.aborted) setCargando(false);});
    return () => controller.abort();
  }, [pagina, categoria, debouncedSearch, orden, disponible]);

  const visibles = resultados.data || [];

  return <main className="container py-5">
    <div className="text-center mb-4">
      <span className="section-kicker">ACCESORIOS Y ALIMENTACIÓN</span>
      <h1 className="section-heading">Productos para tus mascotas</h1>
      <p className="text-muted mx-auto" style={{maxWidth: 720}}>Catálogo informativo. Disponibilidad y precios sujetos a confirmación con la clínica. No se realizan pagos ni compras en esta página.</p>
    </div>
    <div className="panel d-flex flex-wrap align-items-end gap-3 mb-4">
      <label className="flex-grow-1">Buscar en todos los productos
        <input value={busqueda} onChange={e => {setBusqueda(e.target.value); setPagina(1);}} className="form-control mt-1" placeholder="Nombre o descripción"/>
      </label>
      <label style={{minWidth: 180}}>Categoría
        <select className="form-select mt-1" value={categoria} onChange={e => {setCategoria(e.target.value); setPagina(1);}}>
          {categorias.map(c => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label style={{minWidth: 170}}>Disponibilidad
        <select className="form-select mt-1" value={disponible} onChange={e=>{setDisponible(e.target.value);setPagina(1);}}>
          <option value="todos">Todos</option><option value="si">Disponibles</option><option value="no">No disponibles</option>
        </select>
      </label>
      <label style={{minWidth: 200}}>Ordenar
        <select className="form-select mt-1" value={orden} onChange={e=>{setOrden(e.target.value);setPagina(1);}}>
          <option value="nombre_asc">Nombre (A-Z)</option>
          <option value="precio_asc">Menor precio</option>
          <option value="precio_desc">Mayor precio</option>
        </select>
      </label>
    </div>
    {cargando && <p role="status" aria-live="polite">Consultando productos…</p>}
    {error && <div className="alert alert-warning" role="alert"><strong>No se pudo cargar el catálogo.</strong> {error} <button type="button" className="btn btn-sm btn-outline-dark ms-2" onClick={()=>setOrden(v=>v==='nombre_asc'?'precio_asc':'nombre_asc')}>Reintentar</button></div>}
    {!cargando && !error && <>
      <div className="row g-4">
        {visibles.map(p => <div className="col-md-6 col-lg-4" key={p.id}>
          <article className="service-card h-100 d-flex flex-column">
            <div className={`catalog-art catalog-art-${p.categoria.toLowerCase()}`}>
              {p.imagenUrl?<img src={p.imagenUrl} loading="lazy" alt={`Fotografía de ${p.nombre}`}/>:<span className="catalog-art-icon" aria-hidden="true">{ilustraciones[p.categoria]||'🐾'}</span>}
            </div>
            <div className="p-4 d-flex flex-column h-100">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2"><span className="tag">{p.categoria}</span>{/DEMO/i.test(p.nombre)&&<span className="demo-product-tag">FICHA DE PRUEBA</span>}</div>
              <h2 className="h5">{p.nombre}</h2>
              <p className="text-muted">{p.descripcion}</p>
              <p className="fw-semibold mb-2">{p.precio == null ? 'Precio: consultar' : `Precio referencial: S/ ${Number(p.precio).toFixed(2)}`}</p>
              <p className={`small ${p.disponible ? 'text-success' : 'text-muted'}`}>{/DEMO/i.test(p.nombre)?'Producto ficticio, sin inventario confirmado':p.disponible?'Disponibilidad por confirmar':'No disponible actualmente'}</p>
              {/DEMO/i.test(p.nombre)?<a className="btn btn-outline-vet mt-auto" href="#contacto">Información del proyecto</a>:<a className="btn btn-outline-vet mt-auto" href={`tel:${clinica.telefono}`}><Phone size={16}/> Consultar por teléfono</a>}
            </div>
          </article>
        </div>)}
      </div>
      <p className="small text-muted mt-3" role="status" aria-live="polite">{resultados.total} productos encontrados en el catálogo.</p>
      {!visibles.length && <div className="text-center py-5"><PackageSearch size={34} className="mb-2 text-muted"/><p>No hay productos publicados que coincidan con tu búsqueda.</p></div>}
      <div className="d-flex align-items-center justify-content-between mt-4 gap-2">
        <span className="small text-muted">Página {pagina} de {Math.max(1, resultados.lastPage)} · {resultados.total} registros</span>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-vet btn-sm" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => setPagina(v => v - 1)}><ChevronLeft size={17}/></button>
          <button className="btn btn-outline-vet btn-sm" aria-label="Página siguiente" disabled={pagina >= resultados.lastPage} onClick={() => setPagina(v => v + 1)}><ChevronRight size={17}/></button>
        </div>
      </div>
    </>}
    <p className="text-muted small mt-4">Las fotografías genéricas son ilustrativas. Solicita fotografías y precios oficiales a la clínica para sustituirlas. <a href={clinica.facebook} target="_blank" rel="noopener noreferrer">Consultar publicaciones en Facebook <ExternalLink size={13}/></a></p>
  </main>;
}
