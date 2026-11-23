# Guía de integración de mejoras — rúbrica final

## Cambios incluidos en el código

1. **Acceso Google (OAuth mediante Firebase)**: botón "Continuar con Google" en Citas. Requiere que Google esté habilitado en Authentication y que `vet-tambo-frontend.onrender.com` figure en Authorized domains.
2. **Recuperación de acceso**: envío de correo con Firebase a partir del email introducido. El correo solo debe probarse usando una cuenta propia de prueba.
3. **Verificación de correo**: envío de mensaje al crear una cuenta con email/contraseña y controles de reenvío/consulta. Se distingue el estado verificado; por diseño no se bloquean reservas a cuentas no verificadas, por lo que no debe presentarse como una prohibición de acceso.
4. **Catálogo avanzado**: búsqueda desde MongoDB por texto, categoría, disponibilidad y ordenación de precio/nombre. El backend valida las entradas y devuelve páginas de 12 registros.
5. **Estadísticas visuales**: conteos por especie, estado y mes mediante consultas agrupadas en Spring Boot sobre citas del UID autenticado. Barras accesibles sin librerías gráficas.
6. **Accesibilidad y rendimiento**: enlace "Saltar al contenido", controles de foco visibles, respeto a movimiento reducido, búsqueda con retraso de 350 ms y cancelación de solicitudes.
7. **SEO / Search Console**: metadatos, Open Graph y token opcional de verificación. Portal marcado por defecto como no oficial y `noindex`. Seguir `GUIA_GOOGLE_SEARCH_CONSOLE.md`.
8. **Seguridad y pruebas**: ruta privada verificada en Laravel, filtros limitados, cabeceras y tests CI; índices adicionales preparados para la base de pruebas, no creados en Atlas automáticamente.

## Verificaciones manuales pendientes

- Confirmar que el nuevo frontend publique el botón Google; comprobar inicio de sesión y logout con cuentas autorizadas.
- Probar recuperación y verificación de correo de un usuario ficticio en Firebase.
- Consultar catálogo de productos en React y en la API con filtros, comprobar paginación y ausencia de errores.
- Comprobar estadísticas desde una cuenta con citas ficticias; verificar que otra cuenta no ve esas estadísticas.
- Ejecutar `node scripts/auditar_despliegue.mjs` en un entorno autorizado conectado a Internet y conservar el resultado.
- Medir consultas en una **base de prueba**, no en una base con datos reales. Consultar `COMPARACION_CONSULTAS.md`.
- Probar 390, 768 y 1366 px y un navegador adicional, registrar capturas reales.
- Iniciar Google Search Console con una cuenta autorizada; configurar `VITE_GSC_VERIFICATION` en Render, reconstruir y verificar. No quitar noindex sin permiso del titular de la clínica.
- Recopilar integrantes, tareas y commits; completar el informe, no inventar resultados.

## Resultado de la evaluación

Que el código compile no prueba por sí solo que Firebase, MongoDB Atlas, Spring Boot y Render estén correctamente configurados. La rúbrica 5 exige medidas comparativas y la 9 evidencias de pruebas completas y despliegue. Se debe entregar la tabla de pruebas con los resultados efectivos.

## Seguridad

No colocar claves Admin SDK, URI Atlas, APP_KEY, SPRING_INTERNAL_KEY ni tokens en GitHub, documentos o capturas. Las variables de Vite son públicas en el navegador; nunca contienen secretos de servidor.
