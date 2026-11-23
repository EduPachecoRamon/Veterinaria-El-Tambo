# Veterinaria El Tambo — prototipo académico de Programación Web

Prototipo de portal de atención veterinaria con catálogo informativo de productos, reservas de citas, roles administrativos y estadísticas. **No es el sitio oficial de la clínica ni acepta compras en línea.**

## Arquitectura

- `frontend`: React 19, Vite 7, Bootstrap 5, Firebase Authentication (cliente).
- `api`: Laravel 12, validación, autenticación Firebase ID Token, autorización por UID, servicios de agenda, MongoDB, endpoints del catálogo.
- `spring-estadisticas`: Spring Boot 3, estadísticas por usuario vía MongoDB protegidas con clave de servicio.
- `mongodb`: análisis comparativo de consultas.
- `render.yaml`: configuración de los tres servicios para Render.
- `.github/workflows/ci.yml`: pruebas Node, compilación React y sintaxis PHP al publicar cambios.

## Dónde empezar

1. Lee **`GUIA_GITHUB_RENDER.md`** antes de configurar cuentas o subir nada.
2. Configura `api/.env` y `frontend/.env` desde los respectivos `.env.example` sin subirlos al repositorio.
3. Prueba localmente con `Iniciar-Clinica.ps1` (Windows) o inicia los servicios por separado.
4. Pruebas: `cd frontend && npm ci && npm test && npm run build`.
5. Backend: `cd api && composer install && php artisan key:generate && php artisan test`.
6. Spring: `cd spring-estadisticas && mvn test`.
7. Ejecuta índices solo sobre una base de pruebas después de comprobar duplicados: `php artisan clinica:indices`.
8. No uses datos falsos o de clientes reales para pruebas académicas sin permiso.

## Administración

El rol administrador se determina en **Laravel** por la variable privada `ADMIN_FIREBASE_UIDS` con los UID Firebase autorizados separados por comas. No confundir UID con dirección de correo. Quien inicia sesión sin estar en esa lista es cliente. La ruta `/#administracion` también está protegida en el servidor; ocultar la pestaña no es el control de seguridad.

El administrador puede crear, editar y retirar del catálogo público los productos, y gestionar profesionales activos e intervalos semanales de atención. Los productos **no se venden ni se cobran** desde la web.

## Funcionalidades ampliadas

- Google OAuth con Firebase, recuperación de contraseña y verificación de correo desde el frontend.
- Catálogo con filtros en Laravel/MongoDB, ordenación de precio, disponibilidad y búsqueda por texto en toda la colección.
- Estadísticas por especie, estado y mes desde Spring Boot.
- Navegación accesible, mejoras responsivas y metadatos SEO de prototipo no oficial.
- Validación avanzada del catálogo, scripts de diagnóstico y pruebas automatizadas.

Ver `GUIA_MEJORAS_INTEGRACION.md` y `GUIA_GOOGLE_SEARCH_CONSOLE.md` antes de activar verificación de Google.

## Estado de verificación

- **Sí:** revisión de sintaxis PHP y JSX/JavaScript; pruebas de lógica de frontend (13/13) realizadas al preparar el paquete.
- **Pendiente:** instalación y compilación completa de frontend en este entorno, Composer y PHPUnit, Maven, MongoDB y Firebase reales, carga/concurrencia, despliegue e inspección visual de todas las pantallas.
- No confundas pruebas locales de sintaxis con integración o certificación de seguridad.

Consulta `MATRIZ_RUBRICA_ENTREGA.md`, `EVIDENCIAS_Y_PRUEBAS.md` y `FUENTES_NEGOCIO.md` para preparar el informe final.

## Revisión final de estabilidad

Para la configuración de Firebase Admin SDK **exclusivamente en Laravel**, diagnóstico de errores 503 y lista de evidencias vinculada a laboratorios de las semanas 7, 10, 12 y 14, consulta [ENTREGA_FINAL_CONFIGURACION_Y_RUBRICA.md](ENTREGA_FINAL_CONFIGURACION_Y_RUBRICA.md). Nunca publiques las credenciales del archivo JSON.
