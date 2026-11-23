# Matriz de cumplimiento y evidencias — Programación Web

Esta matriz distingue **implementado en archivos** de **probado en ejecución real**. No es una nota ni una certificación de seguridad.

| Criterio (0 a 3) | Dónde se implementa | Evidencia aún necesaria | Estado |
|---|---|---|---|
| 1. Funcionalidad | `frontend/src/App.jsx`, `frontend/src/Catalogo.jsx`, `api/app/Services/*` | Ejecutar login, reservas, edición, cancelación, calendario y catálogo real | Código presente; integración no verificada |
| 2. Interfaz y responsividad | Bootstrap y `frontend/src/styles.css`, componentes React | Capturas móvil/tablet/escritorio, navegación con teclado, Chrome/Firefox | Código presente; pruebas visuales pendientes |
| 3. Arquitectura y servicios | React → API Laravel → MongoDB; Laravel → Spring → MongoDB | Diagrama técnico y flujo real, pruebas de conexión | Arquitectura desplegada; verificar fuente `spring` o respaldo en Estadísticas |
| 4. Persistencia y CRUD | `ProductoController.php`, `CitaController.php`, `AdminVeterinarioController.php`, modelos | Comprobar operaciones y datos con MongoDB; índice único de turnos | Código presente; DB pendiente |
| 5. Optimización | `api/app/Console/Commands/CrearIndicesCitas.php`, `mongodb/analizar_consultas.mongosh.js` | `CRITERIO5_RESULTADOS_REALES.md` (1500 registros, 7+7 ejecuciones, 1500→10 documentos examinados); capturas finales | Comparación real ejecutada en base aislada; capturas pendientes |
| 6. Seguridad | `VerificarFirebase.php`, `SoloAdministrador.php`, validación Laravel, CORS y Render | Roles con dos usuarios reales, controles 401/403/404, escaneo HTTPS y mitigación | Parte implementada; pruebas reales pendientes |
| 7. Calidad | División por responsabilidades, pruebas Node, PHP y CI | Ejecutar CI, revisión de dependencias y prueba de mantenimiento | GitHub Actions aprueba pruebas de React, Laravel y Spring; revisión visual final pendiente |
| 8. Informe | Documentación entregada y el informe original | Adaptar documento a 11 secciones del anexo, capturas y datos verificables | Pendiente de actualización del informe final |
| 9. Pruebas y despliegue | `render.yaml`, `Dockerfile`, GitHub Actions, script de verificación | Despliegue real en Render, verificaciones y registro del trabajo del equipo | Render publicado; integración actualizada y pruebas reales finales pendientes |

## Funcionalidades nuevas

- Catálogo público informativo de alimentos, accesorios, higiene y otros, **sin transacciones de pago**.
- Administrador autorizado desde UID Firebase en el servidor; no por email, ni por bandera de React.
- Administrador puede registrar, editar y ocultar productos, y administrar profesionales y horarios.
- Contacto enlazado a ficha comercial pública con número y Facebook; confirmado solo por directorios, no por la empresa.
- Conexión preparada para Docker / Render con claves en variables de entorno y URL de API configurable.
- Corrección de hora Lima en edición de citas y validación de intervalos del horario.

## Límites y decisiones de diseño

- No existe módulo de pagos, gestión transaccional de ventas ni control contable de stock; no forman parte de lo solicitado en el proyecto original.
- Las citas canceladas permanecen en el historial como eliminación **lógica**. El indicador de Spring cuenta los registros incluidos los cancelados, tal como describe el informe actual.
- No se crean cuentas privilegiadas automáticamente. Un operador con acceso al backend debe configurar explícitamente sus UIDs.
- No se publican fotografías de productos ni precios falsos. El catálogo comienza vacío.
- La clínica real no ha confirmado su participación en este prototipo.
- Las clases compartidas cubren semanas concretas (6, 7, 9, 10, 12, 13, 14); para afirmar que todos los detalles de las 15 semanas están documentados harían falta los materiales restantes.

## Orden de comprobación

1. Ejecutar pruebas JS y sintaxis PHP (ya comprobadas localmente en esta entrega).
2. Instalar dependencias de Composer, ejecutar pruebas PHP y comprobar todas las rutas.
3. Cargar datos de prueba, crear índices y probar reservas simultáneas en MongoDB de desarrollo.
4. Abrir sesión Firebase y verificar con **dos cuentas** que no se comparten citas.
5. Activar rol administrativo y verificar que el cliente recibe 403 en rutas `/api/admin/*`.
6. Verificar React y Spring con dependencias e integración en funcionamiento.
7. Desplegar en Render con datos simulados y comprobar seguridad y responsividad.
8. Capturar evidencias de las pruebas, tiempos de consulta y registros de tareas del equipo.
