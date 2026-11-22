# API Laravel 12

Servicio backend para el prototipo académico El Tambo. Usa MongoDB y Firebase ID Tokens.

Rutas públicas: `GET /api/salud`, `GET /api/productos`.

Rutas cliente autenticado: `/api/yo`, `/api/citas`, `/api/veterinarios`, `/api/estadisticas`.

Rutas administrativas: `/api/admin/productos`, `/api/admin/veterinarios` y horarios.

El rol administrativo se asigna exclusivamente por UID verificado en `ADMIN_FIREBASE_UIDS`. La cancelación de citas es lógica: se conserva el historial. Revisa la guía en la raíz `GUIA_GITHUB_RENDER.md` para configuración y despliegue, y `EVIDENCIAS_Y_PRUEBAS.md` para pruebas.

Para ejecutar: `composer install`, completar `.env`, `php artisan key:generate`, `php artisan serve` y `php artisan test`.
