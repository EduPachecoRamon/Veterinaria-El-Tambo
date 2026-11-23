# Plan de control final — Clínica Veterinaria El Tambo

Proyecto académico no oficial. Usar únicamente cuentas y reservas ficticias en las demostraciones. No asignar notas ni marcar evidencias no verificadas como aprobadas.

| Módulo | Prueba de aceptación | Relación con la rúbrica |
|---|---|---|
| Inicio | Abre en móvil y escritorio; rutas y enlaces sirven | 1, 2 |
| Servicios | Busca términos, comprueba cards y enlace a Citas | 1, 2 |
| Productos | 8 fichas DEMO, filtros y paginación; sin atribuirlas a inventario real | 1, 4, 8 |
| Citas | Autenticación, disponibilidad, crear, editar, cancelar, paginar; cambios reflejados en Atlas | 1, 3, 4, 9 |
| Contacto | Links de teléfono/Facebook/mapas; se muestran los avisos no oficiales | 1, 2 |
| Estadísticas | El panel marca la fuente: `spring` para prueba completa, `laravel_respaldo` si se activa el respaldo | 3, 8, 9 |
| Administración | UID autorizado ve panel; cliente de prueba obtiene 403 por API | 6, 9 |
| Seguridad | Token ausente: 401, campos inválidos: 422, roles: 403, cabeceras HTTP | 6 |
| Rendimiento | Comparación aislada reproducible y `explain('executionStats')` | 5 |
| Diseño | Capturas 390×844, 768×1024, 870×310 y 1366×768, teclado y lector de pantalla | 2 |
| Trabajo colaborativo | Roles reales del equipo y enlaces a commits/PR | 9 |

## Diagnóstico y evidencias

- GitHub Actions: verificar tres trabajos aprobados.
- Render: servicios en estado Live después de integrar el cambio.
- Laravel `/api/salud`: 200; `/api/productos`: 200; `/api/yo` sin token: 401.
- Estadísticas: inspeccionar la respuesta autenticada de `/api/estadisticas`: debe incluir `disponible:true`, `total`, `porEspecie`, `porEstado`, `porMes`, `fuente`.
- No incluir capturas con tokens, contraseñas, cadenas de conexión, UIDs ajenos ni datos personales reales.
- Para el criterio 5 consultar `CRITERIO5_RESULTADOS_REALES.md`.

## Notas para sustentación

La eliminación de citas es lógica (`estado=cancelada`), por lo que el historial y la estadística total incluyen cancelaciones. La API maneja tokens Firebase y aplica roles del lado de Laravel. Las estadísticas se calculan en Spring Boot cuando está disponible, o mediante agregaciones de respaldo en Laravel si el servicio no responde; ese respaldo se identifica en la interfaz y no se debe describir como ejecución de Spring.
