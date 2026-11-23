# Entrega final: correcciones, pruebas y configuración

## Diagnóstico confirmado en Render

Los registros del 22 de noviembre de 2026, alrededor de las 20:16 (hora de Lima), muestran que `/api/salud` responde HTTP 200 pero `/api/yo`, `/api/citas` y `/api/veterinarios` responden HTTP 503 cuando el usuario sí ha iniciado sesión en Firebase.

El middleware `VerificarFirebase.php` devuelve 503 si `FIREBASE_PROJECT_ID` está vacío o faltan `FIREBASE_CREDENTIALS_B64` y una ruta válida `FIREBASE_SERVICE_ACCOUNT`. No se concluye de esta evidencia cuál variable está vacía; debe comprobarse en Environment de Render.

### Configuración privada necesaria (no poner en GitHub)

1. Abrir [Render, API Laravel](https://dashboard.render.com/web/srv-dc1nojff3r2c73d7qrv0/env) → **Environment**.
2. Confirmar que `FIREBASE_PROJECT_ID` corresponde al proyecto de Firebase configurado en React.
3. En Windows PowerShell, ejecutar el script local indicando la ruta real del JSON Admin SDK:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\preparar-firebase-admin.ps1 -RutaJson "$env:USERPROFILE\Downloads\NOMBRE-REAL-DEL-ARCHIVO.json"
```

4. El script valida que el archivo sea una cuenta de servicio, muestra únicamente el identificador del proyecto y copia su contenido codificado al portapapeles.
5. Pegar el portapapeles como `FIREBASE_CREDENTIALS_B64` en **vet-tambo-api**, no en el frontend. El valor es secreto aunque sea Base64.
6. Mantener `APP_DEBUG=false`, `DB_URI`, `DB_DATABASE`, `APP_KEY`, `SPRING_URL`, `SPRING_INTERNAL_KEY`, `ALLOWED_ORIGINS` y `ADMIN_FIREBASE_UIDS` sin cambios innecesarios.
7. Guardar el Environment y aplicar un despliegue que recargue la configuración; no regenerar `APP_KEY`.
8. Entrar con una cuenta de prueba, verificar `/api/yo` (200), `/api/veterinarios` (200), leer citas (200), luego CRUD con datos ficticios.

Si `/api/yo` responde 401 después, comprobar que la cuenta de Firebase y la credencial del backend usan el mismo `project_id`. La interfaz ahora separa correctamente estados de sesión, red y configuración.

Nunca subir el JSON privado ni su Base64 a GitHub ni compartirlo en capturas.

## Relación con el material recibido del curso

| Fuente del curso | Tema evaluado | Implementación / verificación |
|---|---|---|
| Laboratorio07-Programación Web, semana 7 | Integración de capa de servicios con arquitectura limpia | React consume `frontend/src/api.js` y Laravel separa controladores, middlewares y servicios de reserva |
| Laboratorio10-Programación Web, semana 10 | Analizar, optimizar y comparar consultas antes/después | `COMPARACION_CONSULTAS.md`, `mongodb/analizar_consultas.mongosh.js`; falta medir sobre base de prueba |
| Laboratorio12-Programación Web, semana 12 | MongoDB, índices compuestos y búsqueda/paginación | Controladores de catálogo y citas, `clinica:indices` y `explain('executionStats')` |
| LabSemana14, semana 14 | Planificar pruebas de seguridad y medidas correctivas | `PLAN_SEGURIDAD_Y_PRUEBAS.md`, pruebas PHPUnit de autenticación y entradas inválidas |
| Rúbrica U4, pp. 4–5 | 9 criterios, 0–3 puntos cada uno | Código, CI, Render y matriz de evidencias; no representa una nota otorgada |

## Pruebas pendientes de capturas

| Evidencia | Cómo obtenerla | Estado |
|---|---|---|
| Sesión Firebase y backend | Acceso de prueba seguido por respuesta de `/api/yo` | Pendiente después de Environment |
| Roles administrativo/cliente | Dos cuentas ficticias y respuesta 403 desde cliente | Pendiente |
| CRUD de reservas | Crear, consultar, editar, cancelar cita ficticia, con evidencia de MongoDB | Pendiente |
| Catálogo | Filtrar productos en API y mostrar datos ficticios del catálogo | Pendiente |
| Gráficos Spring | Ver estadísticas por especie, estado y mes de un UID de prueba | Pendiente |
| Rendimiento MongoDB | Comparación de `executionStats` con/sin índices en base aislada | Pendiente |
| Seguridad externa | Capturas propias de MDN Observatory / SSL Labs y correcciones | Pendiente |
| Responsividad | Capturas de 390, 768 y 1366 px y pruebas de teclado | Pendiente |
| Equipo | Integrantes reales, roles y commits; sin atribuir trabajo inexistente | Pendiente |

El sitio está identificado como prototipo académico no oficial. No reemplaza la operación o atención de la clínica ni acepta compras.
