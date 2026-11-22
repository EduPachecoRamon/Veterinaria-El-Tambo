export const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

export function leerIntervalos(texto) {
  if (!String(texto).trim()) return [];
  const intervalos = String(texto).split(',').map(tramo => {
    const [inicio, fin, extra] = tramo.trim().split('-').map(v => v?.trim());
    if (extra !== undefined || !/^([01]\d|2[0-3]):00$/.test(inicio || '') || !/^([01]\d|2[0-3]):00$/.test(fin || '')) {
      throw new Error('Usa intervalos como 09:00-13:00,15:00-19:00.');
    }
    return {inicio, fin};
  });
  const ordenados = [...intervalos].sort((a, b) => a.inicio.localeCompare(b.inicio));
  for (let i = 0; i < ordenados.length; i++) {
    if (ordenados[i].inicio >= ordenados[i].fin || (i && ordenados[i].inicio < ordenados[i-1].fin)) {
      throw new Error('Los horarios se superponen o tienen límites incorrectos.');
    }
  }
  return ordenados;
}
