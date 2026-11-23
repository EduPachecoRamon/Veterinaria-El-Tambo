export function clasificarConexion(error) {
  if (error?.status === 503) return 'configuration';
  if (error?.status === 401) return 'unauthorized';
  return 'offline';
}

export function mensajeConexion(estado) {
  if (estado === 'configuration') return 'Tu cuenta de Firebase está activa, pero el servidor de reservas todavía necesita completar su configuración. No se ha cerrado tu sesión.';
  if (estado === 'unauthorized') return 'El servidor no pudo validar la sesión. Puedes reintentar o cerrar sesión y volver a ingresar.';
  if (estado === 'offline') return 'No se pudo comunicar con el servicio de reservas. Comprueba la conexión y vuelve a intentarlo.';
  return 'Estamos verificando tu acceso al sistema de reservas.';
}
