# Estadísticas con Spring Boot

Este servicio consulta MongoDB para generar estadísticas personales por especie. Solo debe acceder a él Laravel mediante `X-Internal-Key` compartida; React nunca debe enviar esta clave.

Variables: `MONGODB_URI`, `DB_DATABASE`, `SPRING_INTERNAL_KEY` y `PORT` (opcional, 8081 local). La base de datos debe coincidir con la que utiliza Laravel.

Para ejecutar localmente: `mvn test && mvn spring-boot:run` después de configurar las variables.

El prototipo incluye un Dockerfile para Render. **El plan gratuito puede exponer el servicio por HTTPS público**: la clave secreta y el control de acceso son obligatorios; no representa un despliegue privado ni una certificación de seguridad para uso comercial.
