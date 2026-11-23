import React from 'react';
import {AlertTriangle, RefreshCcw} from 'lucide-react';

export default class CrashBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state={failed:false};
  }
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error){console.error('Error de interfaz controlado',error?.name||'Error');}
  componentDidUpdate(previous){
    if(previous.section!==this.props.section&&this.state.failed)this.setState({failed:false});
  }
  render(){
    if(!this.state.failed)return this.props.children;
    return <main className="container py-5"><section className="panel error-recovery" role="alert">
      <AlertTriangle size={32} aria-hidden="true"/>
      <h1 className="h4 mt-3">No se pudo abrir esta sección</h1>
      <p>La página sigue disponible. Puedes volver a intentar sin perder la sesión.</p>
      <button className="btn btn-vet" type="button" onClick={()=>this.setState({failed:false})}><RefreshCcw size={16}/> Volver a intentar</button>
      <a className="btn btn-outline-vet" href="#inicio">Ir al inicio</a>
    </section></main>;
  }
}
