# Verificación final de estadísticas y permisos — Programación Web

## 1. Corrección aplicada en Laravel
El contenedor inicia con `php artisan config:cache`. Se reemplazó la lectura directa de `env('SPRING_URL')` y `env('SPRING_INTERNAL_KEY')` por `config('services.clinica.spring_url')` y `config('services.clinica.spring_internal_key')`.

Los secretos se definen en el archivo `api/config/services.php` únicamente como referencias a variables de Render, sin incluir valores en GitHub. El controlador llama al servicio Spring usando el UID validado por middleware Firebase y la cabecera privada `X-Internal-Key`. Se permite hasta 65 segundos para arranques fríos de Spring y se evitan mensajes técnicos al público.

## 2. Verificación funcional real (pendiente)
1. Comprobar que Laravel y Spring figuren `Live` en Render.
2. Iniciar sesión en `https://vet-tambo-frontend.onrender.com/#estadisticas`.
3. Pulsar **Actualizar**. El panel debería mostrar un total y gráficos por especie, estado y mes (si existen registros de la cuenta).
4. Observar en Render los registros de Laravel y Spring. La ruta `GET /api/estadisticas` por sí sola devuelve HTTP 200 tanto en éxito como en modo `disponible: false`: **no es evidencia suficiente**.
5. Desde la pestaña Network del navegador, inspeccionar la respuesta de `/api/estadisticas` y comprobar que `disponible` sea `true`; guardar una captura **sin tokens ni credenciales**.
6. Comprobar que los datos corresponden a ese usuario. Una cuenta nueva sin citas debería tener cero, no las reservas de otras cuentas.

## 3. Permisos administrativos (pendiente de comprobación real)
1. Verificar en Environment de `vet-tambo-api` que existe `ADMIN_FIREBASE_UIDS` con el UID correcto; no confundirlo con el correo.
2. Volver a cargar la web y abrir `/#administracion`.
3. Confirmar que el administrador puede listar productos/veterinarios, pero una segunda cuenta de cliente no.
4. Registrar respuestas esperadas 200 (administrador) y 403 (cliente) en solicitudes reales, sin mostrar cabeceras con tokens.

## 4. Pruebas automatizadas
`api/tests/Feature/EstadisticasIntegracionTest.php` comprueba el contrato JSON, encabezado interno, filtrado por UID, ausencia de configuración y no divulgación de secretos ante un error. Estos tests simulan el servicio Spring: **no reemplazan la prueba de integración real**.

## 5. Evidencias para la rúbrica
- Criterios 1 y 3: pantalla funcional y flujo React → Firebase → Laravel → Spring → MongoDB Atlas.
- Criterio 6: autenticación y clave interna no expuesta.
- Criterio 8: capturas de gráficas, respuesta JSON y diagrama.
- Criterio 9: GitHub Actions verde, servicios desplegados y prueba real tras inicio de sesión.

Estado inicial: falta captura del panel real y confirmar `disponible: true` tras el nuevo despliegue.
