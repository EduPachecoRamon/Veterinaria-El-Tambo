import {auth} from './firebase.js';

const BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

export async function request(path, {method = 'GET', body, signal, publico = false} = {}) {
  const headers = {Accept: 'application/json'};
  if (!publico) {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión.');
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal
    });
  } catch {
    throw new Error('No se pudo conectar con la API. Comprueba la conexión y VITE_API_URL.');
  }
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) throw new Error(Object.values(data.errors || {}).flat()[0] || data.message || `Error HTTP ${response.status}`);
  return data;
}

export const api = {
  salud: () => request('/salud', {publico: true}),
  yo: () => request('/yo'),
  listar: (params = {}) => request(`/citas?${new URLSearchParams(params)}`),
  crear: data => request('/citas', {method: 'POST', body: data}),
  editar: (id, data) => request(`/citas/${encodeURIComponent(id)}`, {method: 'PUT', body: data}),
  eliminar: id => request(`/citas/${encodeURIComponent(id)}`, {method: 'DELETE'}),
  veterinarios: () => request('/veterinarios'),
  disponibilidad: (id, fecha) => request(`/veterinarios/${encodeURIComponent(id)}/disponibilidad?fecha=${encodeURIComponent(fecha)}`),
  estadisticas: () => request('/estadisticas'),
  productos: (params = {}, options = {}) => request(`/productos?${new URLSearchParams(params)}`, {publico: true, ...options}),
  adminProductos: () => request('/admin/productos'),
  adminCrearProducto: data => request('/admin/productos', {method: 'POST', body: data}),
  adminEditarProducto: (id, data) => request(`/admin/productos/${encodeURIComponent(id)}`, {method: 'PUT', body: data}),
  adminEliminarProducto: id => request(`/admin/productos/${encodeURIComponent(id)}`, {method: 'DELETE'}),
  adminVeterinarios: () => request('/admin/veterinarios'),
  adminCrearVeterinario: data => request('/admin/veterinarios', {method: 'POST', body: data}),
  adminEditarVeterinario: (id, data) => request(`/admin/veterinarios/${encodeURIComponent(id)}`, {method: 'PUT', body: data}),
  adminGuardarHorario: (id, dia, intervalos) => request(`/admin/veterinarios/${encodeURIComponent(id)}/horarios/${dia}`, {method: 'PUT', body: {intervalos}})
};
