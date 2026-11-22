const base = (process.env.API_URL || '').replace(/\/$/, '');
if (!/^https?:\/\//.test(base)) {
  console.error('Configura API_URL apuntando a https://tu-api.onrender.com/api');
  process.exit(1);
}

const verificaciones = [
  ['/salud', 200],
  ['/citas', 401],
  ['/admin/productos', 401],
  ['/productos', 200]
];

let errores = 0;
for (const [ruta, esperado] of verificaciones) {
  try {
    const respuesta = await fetch(`${base}${ruta}`, {headers: {Accept: 'application/json'}, signal: AbortSignal.timeout(20000)});
    const correcto = respuesta.status === esperado;
    console.log(`${correcto ? 'OK' : 'FALLO'} ${ruta}: ${respuesta.status} (esperado ${esperado})`);
    if (!correcto) errores++;
  } catch (error) {
    console.log(`FALLO ${ruta}: ${error.message}`);
    errores++;
  }
}

if (process.env.TOKEN_CLIENTE) {
  const r = await fetch(`${base}/admin/productos`, {headers: {Authorization: `Bearer ${process.env.TOKEN_CLIENTE}`, Accept: 'application/json'}});
  const correcto = r.status === 403;
  console.log(`${correcto ? 'OK' : 'FALLO'} usuario cliente sin permiso administrativo: ${r.status} (esperado 403)`);
  if (!correcto) errores++;
}
process.exitCode = errores ? 1 : 0;
