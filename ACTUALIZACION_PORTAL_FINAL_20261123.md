# Mejoras de experiencia y seguridad — 23/11/2026

## Propósito
Conservar la arquitectura React + Firebase + Laravel + Spring Boot + MongoDB Atlas y mejorar la funcionalidad visible para la sustentación del proyecto de Programación Web.

## Funcionalidades nuevas
- Navegación simplificada y menú desplegable de cuenta con enlaces a reservas, calendario, actividad y cierre de sesión.
- Acceso al centro del personal únicamente para UID autorizado; además de la restricción visual, las nuevas rutas de Laravel están bajo los middlewares `firebase` y `admin`.
- Catálogo con búsqueda, filtros, estados resistentes a errores, ilustraciones por categoría y soporte de imágenes subidas por administradores.
- Agenda de usuario con veterinario, día, horarios consultados mediante Laravel y continuación hacia formulario de reserva.
- Informe interno de la clínica con citas para hoy, próximas citas, estados, productos publicados, profesionales y agenda diaria.
- Diagnóstico de consultas movido al panel de administración: sus tiempos de red no deben confundirse con los planes `explain` de MongoDB.
- MongoDB GridFS: `fotos_citas.files/chunks` y `fotos_productos.files/chunks`, creadas al subir los primeros archivos. Se aceptan JPEG/PNG/WebP de hasta 3 MB.
- Las fotos de citas requieren un token válido y que el UID sea propietario; las fotos privadas del panel requieren rol administrador.
- La URL pública de la foto del producto funciona solo cuando el producto está activo.
- Las animaciones respetan `prefers-reduced-motion`.

## Subir fotografías de productos
En `#administracion`, abrir **Catálogo**, elegir o crear un producto y seleccionar una foto desde el equipo; luego **Guardar producto**. Solo subir imágenes que tengan permiso de uso, preferiblemente archivos originales en lugar de depender de enlaces externos. Se guardan en GridFS y el catálogo usa la URL de la API. No publicar fotos de animales reales sin consentimiento adecuado.

## Fotos al crear citas
Desde `#citas`, rellenar datos de prueba, seleccionar veterinario y fecha/hora disponible y elegir una foto opcional. La imagen se guarda después de crear o editar la cita. Si falla la carga de imagen, la cita puede haberse guardado correctamente; se informa por separado.

La imagen se recupera bajo autenticación mediante `fetch` + `Blob`; no se crea una URL pública que permita omitir la verificación de titularidad. El personal autorizado puede verla desde la agenda diaria.

## Datos referenciales
Los ocho productos iniciales tienen nombres y precios ilustrativos. El contenido público mantiene el aviso de **precio referencial sujeto a confirmación** y un aviso discreto de catálogo informativo. No se declara stock real ni autenticidad de un precio no verificado.

## Verificación que aún requiere navegador real
1. Abrir Productos y Administración con el nuevo despliegue y comprobar que no hay pantalla blanca.
2. Comprobar respuesta de `GET /api/productos` y `GET /api/admin/resumen` con sesión autorizada.
3. Abrir agenda y elegir un horario, comprobar que el formulario de Citas recoge la selección.
4. Subir una imagen permitida de prueba a una cita, volver a verla y verificar que otra cuenta no la puede consultar.
5. Subir foto autorizada a un producto y comprobarla en el catálogo.
6. Capturar las resoluciones 390×844, 768×1024, 870×310 y 1366×768; anotar resultados reales, no estimaciones.
7. Comprobar que `#estadisticas` conserva la fuente Spring y que el panel administrativo muestra estadísticas globales de Laravel.

## Para la rúbrica
- 1, 2: catálogo, navegación y formularios recuperables con diseño responsivo.
- 3: servicios diferenciados y administración exclusivamente en backend.
- 4: CRUD de citas, productos, veterinarios y adjuntos almacenados.
- 5: `CRITERIO5_RESULTADOS_REALES.md` mantiene el benchmark aislado.
- 6: comprobación de acceso a datos privados por UID.
- 7: componentes independientes para agenda, foto y recuperación.
- 8, 9: las evidencias deben ser capturas reales con ruta/fecha/resultado; CI no verifica la experiencia visual.
