import {useEffect, useState} from 'react';
import {ChevronLeft, ChevronRight, ExternalLink, PackageSearch, Phone} from 'lucide-react';
import {api} from './api.js';
import {clinica} from './data/clinica.js';

const categorias = ['Todas', 'Alimentos', 'Accesorios', 'Higiene', 'Otros'];

export default function Catalogo() {
  const [categoria, setCategoria] = useState('Todas');
  const [pagina, setPagina] = useState(1);
  const [resultados, setResultados] = useState({data: [], total: 0, lastPage: 1});
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError('');
    api.productos({page: pagina, ...(categoria === 'Todas' ? {} : {categoria})})
      .then(r => {if (!controller.signal.aborted) setResultados(r);})
      .catch(e => {if (!controller.signal.aborted) setError(e.message);})
      .finally(() => {if (!controller.signal.aborted) setCargando(false);});
    return () => controller.abort();
  }, [pagina, categoria]);

  const visibles = (resultados.data || []).filter(p => `${p.nombre} ${p.descripcion}`.toLocaleLowerCase('es-PE').includes(busqueda.toLocaleLowerCase('es-PE')));

  return <main className="container py-5">
    <div className="text-center mb-4">
      <span className="section-kicker">ACCESORIOS Y ALIMENTACIÓN</span>
      <h1 className="section-heading">Productos para tus mascotas</h1>
      <p className="text-muted mx-auto" style={{maxWidth: 720}}>Catálogo informativo. Disponibilidad y precios sujetos a confirmación con la clínica. No se realizan pagos ni compras en esta página.</p>
    </div>
    <div className="panel d-flex flex-wrap align-items-end gap-3 mb-4">
      <label className="flex-grow-1">Buscar en esta página
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} className="form-control mt-1" placeholder="Nombre o descripción"/>
      </label>
      <label style={{minWidth: 180}}>Categoría
        <select className="form-select mt-1" value={categoria} onChange={e => {setCategoria(e.target.value); setPagina(1); setBusqueda('');}}>
          {categorias.map(c => <option key={c}>{c}</option>)}
        </select>
      </label>
    </div>
    {cargando && <p role="status">Consultando productos…</p>}
    {error && <div className="alert alert-warning" role="alert">{error} El catálogo requiere conexión con Laravel.</div>}
    {!cargando && !error && <>
      <div className="row g-4">
        {visibles.map(p => <div className="col-md-6 col-lg-4" key={p.id}>
          <article className="service-card h-100 d-flex flex-column">
            <img src={p.imagenUrl || `${import.meta.env.BASE_URL}img/productosejemplo.jpg`} loading="lazy" alt={p.imagenUrl ? `Imagen de ${p.nombre}` : 'Imagen ilustrativa de accesorios para mascotas'}/>
            <div className="p-4 d-flex flex-column h-100">
              <span className="tag align-self-start mb-2">{p.categoria}</span>
              <h2 className="h5">{p.nombre}</h2>
              <p className="text-muted">{p.descripcion}</p>
              <p className="fw-semibold mb-2">{p.precio == null ? 'Precio: consultar' : `Precio referencial: S/ ${Number(p.precio).toFixed(2)}`}</p>
              <p className={`small ${p.disponible ? 'text-success' : 'text-danger'}`}>{p.disponible ? 'Consultar disponibilidad' : 'Temporalmente no disponible'}</p>
              <a className="btn btn-outline-vet mt-auto" href={`tel:${clinica.telefono}`}><Phone size={16}/> Consultar por teléfono</a>
            </div>
          </article>
        </div>)}
      </div>
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
