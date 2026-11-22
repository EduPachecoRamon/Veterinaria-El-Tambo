# GitHub + Render: Clínica El Tambo

Esta entrega es un **prototipo académico no oficial**. No publiques datos de personas reales, credenciales ni fotos comerciales sin autorización. Antes de permitir reservas reales, el negocio debe aceptar el sistema y revisar el tratamiento de los datos personales.

## 1. GitHub

1. Extrae `Clinica_El_Tambo_integral.zip` en una carpeta. No subas el ZIP como único archivo: el repositorio necesita ver las carpetas `frontend`, `api` y `spring-estadisticas`.
2. Crea un repositorio **privado** en GitHub, por ejemplo `clinica-tambo-pw`. Invita a tus compañeros si corresponde.
3. Desde la carpeta que contiene `render.yaml`:
   ```bash
   git init
   git add .
   git commit -m "Implementar clínica veterinaria y preparación de despliegue"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git push -u origin main
   ```
4. Comprueba que **no** se subieron `.env`, JSON de cuentas de servicio, claves, bases de datos, carpetas `vendor`, `node_modules`, `dist` ni `target`.
5. En GitHub → Actions, verifica el flujo de pruebas y compilación. Si falla, corrige la causa antes de publicar.

## 2. Firebase

1. Crea o reutiliza un proyecto Firebase de **pruebas**.
2. Authentication → Sign-in method → habilitar Correo/Contraseña.
3. En Firebase Authentication → Settings → Authorized domains, incorpora el dominio de Render del frontend después de crearlo.
4. Copia al frontend las variables públicas `VITE_FIREBASE_*` del SDK web, sin usar claves de administrador.
5. En la consola Firebase Authentication obtén el UID del usuario que administrará el prototipo. Pon ese UID, exacto, en `ADMIN_FIREBASE_UIDS` del backend; varios UIDs se separan con comas. **El correo no autoriza por sí solo**.
6. Genera una cuenta de servicio Firebase **privada de pruebas**, guárdala fuera de Git y conviértela a base64 para `FIREBASE_CREDENTIALS_B64`:
   - PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\ruta\cuenta-servicio.json'))`
   - Nunca pongas este resultado en el frontend, el repositorio, capturas o el informe.

## 3. MongoDB Atlas

1. Crea una base de datos separada para el prototipo y un usuario con permisos mínimos para esa base.
2. Guarda la cadena de conexión privada en `DB_URI` de Laravel y `MONGODB_URI` de Spring. En ambos usa el mismo valor en `DB_DATABASE`. **Si el proyecto anterior ya utiliza una base llamada `ClinicaVeterinariaElTambo`, conserva exactamente ese nombre: no presupongas que los registros están en `clinica_eltambo`.**
3. Autoriza conexiones desde Render solo según las opciones disponibles en tu plan. Si debes abrir acceso amplio por IP de salida dinámica, usa credenciales de mínimo privilegio, TLS y una base separada; **no es apropiado para datos reales**.
4. Antes de generar índices, revisa duplicados de turnos y haz respaldo. Ejecuta `php artisan clinica:indices` localmente contra la base de pruebas y documenta los resultados.
5. No ejecutes `clinica:datos-demo` sobre la base de producción.

## 4. Render

1. Conecta Render con el repositorio GitHub.
2. Usa **New → Blueprint** y selecciona `render.yaml`. Se proponen tres servicios: React estático, Laravel Docker y Spring Docker.
3. Configura las variables marcadas como `sync: false`. Render solicita secretos durante la creación del Blueprint; nunca los guardes en `render.yaml`.
4. En Laravel, configura `APP_KEY` generado localmente con `php artisan key:generate --show`; mantén `APP_DEBUG=false` y `APP_ENV=production`.
5. `APP_URL`: URL pública HTTPS de Laravel. `ALLOWED_ORIGINS`: URL HTTPS de React, sin barra final.
6. `SPRING_URL`: URL HTTPS de Spring. `SPRING_INTERNAL_KEY`: una cadena aleatoria privada larga, **idéntica** en Laravel y Spring.
7. `VITE_API_URL`: URL HTTPS de Laravel **terminada en `/api`**. Las variables Vite se insertan durante la compilación y son públicas por diseño.
8. Visita `/api/salud` de Laravel y después la app de React. `GET /api/salud` confirma solo que la API responde, no que MongoDB/Firebase/Spring funcionan.
9. Verifica login, permisos, agenda, CRUD de citas, catalogo, estadísticas, Firefox/Chrome, móvil y seguridad HTTPS.
10. Si el servicio no conecta a MongoDB, revisa DNS, usuario, contraseña, política de red y base seleccionada sin mostrar secretos en registros compartidos.

### Costos del plan gratuito

Render permite sitios estáticos gratuitos y servicios web gratuitos limitados. En el plan gratuito los servicios web se suspenden si están inactivos y las **750 horas gratuitas se comparten en el espacio de trabajo**. Dos servicios que deben permanecer disponibles todo el mes normalmente superarán esa bolsa. Puedes activar el servicio Spring solo para la demostración, usar un plan adecuado o ejecutar estadísticas localmente. Revisa los costos antes de aceptar cualquier cambio de plan.

### Importante sobre seguridad

Render publica Spring por HTTPS como servicio público, porque en el plan gratuito no siempre está disponible una red privada entre servicios. El endpoint de estadísticas requiere `X-Internal-Key` y no debe usarse directamente desde React. Esta es una solución para un prototipo controlado, no una validación de seguridad para uso comercial. Deben probarse el aislamiento de datos por usuario, la rotación de claves, el rate limit, los registros y las vulnerabilidades antes de manejar datos de clientes reales.

## 5. Datos reales pendientes

- Confirmar personalmente dirección, teléfono, Facebook, horarios, autorización y tratamiento de datos.
- Cargar por administración nombres y horarios de profesionales verificados.
- Cargar productos reales, precios, imágenes autorizadas y disponibilidad. El catálogo empieza vacío por decisión deliberada.
- Las páginas son una demostración: no hay pagos en línea, venta automatizada ni reservas avaladas por el negocio.
- Obtener evidencias de pruebas y planes de consulta MongoDB reales. Los documentos no simulan mediciones.
