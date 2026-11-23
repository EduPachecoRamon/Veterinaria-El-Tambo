import React, {useEffect,useState} from 'react';
import {Image as ImageIcon,X} from 'lucide-react';
import {api} from './api.js';

export default function FotoPrivada({citaId,admin=false}){
  const [abierto,setAbierto]=useState(false);
  const [url,setUrl]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{
    if(!abierto)return;
    let activo=true;
    let objeto='';
    (admin?api.adminVerFoto(citaId):api.verFoto(citaId))
      .then(blob=>{
        if(!activo)return;
        objeto=URL.createObjectURL(blob);setUrl(objeto);
      }).catch(e=>{if(activo)setError(e.message);});
    return()=>{activo=false;if(objeto)URL.revokeObjectURL(objeto);};
  },[abierto,citaId,admin]);
  return <>
    <button type="button" className="btn btn-outline-vet btn-sm" onClick={()=>setAbierto(true)}><ImageIcon size={16}/> Ver fotografía</button>
    {abierto&&<div className="photo-modal" role="dialog" aria-modal="true" aria-label="Fotografía de cita">
      <div className="photo-dialog">
        <button className="btn btn-outline-secondary btn-sm photo-close" type="button" onClick={()=>{setAbierto(false);setUrl('');setError('');}} aria-label="Cerrar fotografía"><X size={17}/></button>
        <h2 className="h5">Fotografía adjunta</h2>
        {error&&<p className="alert alert-warning">{error}</p>}
        {!url&&!error&&<p>Preparando imagen privada…</p>}
        {url&&<img className="photo-private" src={url} alt="Imagen adjunta por el propietario de la mascota"/>}
      </div>
    </div>}
  </>;
}
