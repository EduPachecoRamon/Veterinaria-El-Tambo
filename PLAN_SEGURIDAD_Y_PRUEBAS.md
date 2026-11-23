# Plan de seguridad y pruebas — Clínica El Tambo

Documento para el criterio 6 de la rúbrica. Las medidas implementadas no equivalen a una auditoría completa.

| Riesgo | Control en código | Evidencia pendiente |
|---|---|---|
| Acceso sin sesión | VerificarFirebase en Laravel | GET /api/citas sin token debe responder 401 |
| Acceso administrativo indebido | SoloAdministrador valida UID | Cliente solicita /api/admin/productos y recibe 403 |
| Lectura de citas ajenas | CitaService filtra por ownerUid | Dos usuarios de prueba intentan acceder a la misma cita |
| Campos inválidos | Validación de CitaController y ProductoController | Respuesta HTTP 422 y ausencia de escrituras |
| Reservas duplicadas | Regla de disponibilidad e índice único parcial previsto | Dos peticiones concurrentes sobre una base aislada |
| Credenciales expuestas | Variables Render y .gitignore | Revisión del repositorio e historial |
| Clickjacking y MIME sniffing | Cabeceras X-Frame-Options y X-Content-Type-Options | Respuesta HTTP en producción y CI |
| Vulnerabilidades externas | HTTPS, cabeceras y configuración | Resultado de SSL Labs y MDN Observatory en sitio propio |

## Protocolo

1. Ejecutar CI de React, Laravel y Spring; conservar URL de los trabajos aprobados.
2. Probar login, logout y roles con cuentas ficticias, sin compartir tokens o credenciales.
3. Ejecutar pruebas CRUD y comprobar persistencia en una base de desarrollo.
4. Registrar fecha, petición, HTTP obtenido, evidencia y corrección aplicada.
5. Ejecutar pruebas de cabeceras, control de acceso, validaciones y datos ajenos.
6. Evitar afirmar que una prueba pendiente fue superada.

## Registro

| Caso | Esperado | Obtenido | Fecha/evidencia |
|---|---|---|---|
| Sin token en citas | 401 | Pendiente | Pendiente |
| Cliente en administración | 403 | Pendiente | Pendiente |
| Formulario inválido | 422 | Pendiente | Pendiente |
| Cabeceras API | nosniff, DENY, no-referrer | Pendiente en despliegue | Pendiente |
| Lectura de cita ajena | Sin acceso | Pendiente | Pendiente |
