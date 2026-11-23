const KEY='vet-tambo-metricas-v1';
export function guardarMetrica(item){
  try {
    const current=JSON.parse(sessionStorage.getItem(KEY)||'[]');
    const list=Array.isArray(current)?current:[];
    const next=[item,...list].slice(0,30);
    sessionStorage.setItem(KEY,JSON.stringify(next));
  } catch {}
}
export function leerMetricas(){
  try {
    const list=JSON.parse(sessionStorage.getItem(KEY)||'[]');
    return Array.isArray(list)?list:[];
  } catch {return [];}
}
