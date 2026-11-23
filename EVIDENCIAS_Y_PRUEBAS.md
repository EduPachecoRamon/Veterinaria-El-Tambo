# Registro de pruebas y evidencias para el informe

Los siguientes datos deben completarse **al ejecutar el proyecto**; no son resultados predeterminados.

| Caso | Condición | Resultado esperado | Resultado obtenido | Evidencia |
|---|---|---|---|---|
| F-01 | Cuenta de prueba inicia sesión | Sesión válida | Pendiente | Captura |
| F-01b | Cuenta Firebase autenticada con API sin credencial | HTTP 503 del backend, mensaje de reconexión sin cerrar sesión | Diagnóstico 503 en Render, corrección de interfaz por validar | Registros Render + captura del formulario |
| F-02 | Crear cita en horario libre | HTTP 201, registro MongoDB | Pendiente | API + base |
| F-03 | Intentar reservar mismo turno dos veces | Segunda operación rechazada, HTTP 409 | Pendiente | API + índices |
| F-04 | Editar cita propia | HTTP 200, horario nuevo | Pendiente | API + base |
| F-05 | Cancelar cita propia | Estado `cancelada`, historial conservado | Pendiente | API + base |
| F-06 | Consultar estadísticas | Datos propios | Pendiente | React + Spring |
| S-01 | Consulta de citas sin token | HTTP 401 | Pendiente | Respuesta |
| S-02 | Cliente intenta administrar productos | HTTP 403 | Pendiente | Respuesta |
| S-03 | Cliente A intenta consultar/editar cita de B | Sin acceso a datos de B | Pendiente | Dos cuentas de prueba |
| S-04 | Campos inválidos en formulario | HTTP 422, sin guardar | Pendiente | API |
| S-05 | HTML ingresado como texto | Se presenta como texto, sin ejecutarse | Pendiente | UI + API |
| P-01 | Consulta por `ownerUid` sin índice | Registrar keys/docs/ms | Pendiente | mongosh `explain` |
| P-02 | Misma consulta con índice compuesto | Registrar keys/docs/ms | Pendiente | mongosh `explain` |
| D-01 | Backend accesible por HTTPS | API disponible | Pendiente | URL + SSL Labs |
| D-02 | Cabeceras del sitio público | Resultado medido | Pendiente | MDN Observatory |
| D-03 | Vista escritorio, tableta y móvil | Navegación y controles accesibles | Pendiente | 3 capturas |
| A-01 | Ingreso con Google Firebase | Sesión y UID válidos en Laravel | Pendiente | React + Firebase + API |
| A-02 | Restablecimiento de contraseña | Correo enviado por Firebase | Pendiente | Captura sin datos privados |
| A-03 | Verificación de correo | Cuenta verificada tras enlace | Pendiente | Captura Firebase |
| C-01 | Búsqueda de productos por texto | Resultados filtrados en MongoDB y página correcta | Pendiente | UI + API |
| C-02 | Filtro por disponibilidad y precio | Orden correcto y paginación coherente | Pendiente | UI + API |
| E-01 | Estadísticas de especie, estado y mes | Agregaciones limitadas al UID | Pendiente | Spring + UI |
| SEO-01 | Verificación Search Console | Propiedad verificada | Pendiente | Search Console |

## Comparación MongoDB

Utiliza `mongodb/analizar_consultas.mongosh.js` en **base de prueba**, con el mismo volumen, consultas equivalentes y múltiples repeticiones. Evita presentar un valor aislado como prueba absoluta de mejora. Anota versión MongoDB, total de documentos, filtros, índices, fechas y planes de ejecución.

| Variante | Registros de prueba | `totalDocsExamined` | `totalKeysExamined` | Tiempo de ejecución | Plan |
|---|---:|---:|---:|---:|---|
| Sin índice | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Con índice | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

## Responsabilidades del grupo

Completar con tareas realmente realizadas y evidencias de GitHub/commits; no inventar roles.

| Integrante | Responsabilidad real | Evidencia (PR, commit o tarea) |
|---|---|---|
| Integrante 1 | Pendiente | Pendiente |
| Integrante 2 | Pendiente | Pendiente |
| Integrante 3 | Pendiente | Pendiente |
