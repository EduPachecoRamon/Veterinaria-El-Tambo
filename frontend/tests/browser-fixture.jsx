import React from 'react';
import {createRoot} from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/styles.css';
import Catalogo from '../src/Catalogo.jsx';
import Administracion from '../src/Administracion.jsx';
import Agenda from '../src/Agenda.jsx';
import CrashBoundary from '../src/CrashBoundary.jsx';

const screen=location.hash.slice(1);
const Element=screen==='productos'?Catalogo:screen==='administracion'?Administracion:Agenda;
createRoot(document.getElementById('root')).render(
 <React.StrictMode><CrashBoundary section={screen}>
   {screen==='administracion'?<Administracion rol="administrador"/>:<Element/>}
 </CrashBoundary></React.StrictMode>
);
