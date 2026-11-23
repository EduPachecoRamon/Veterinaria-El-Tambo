# Evaluación de consultas MongoDB — criterio 5

Esta actividad mide el rendimiento real. No se deben inventar tiempos ni crear índices en la base productiva sin revisar duplicados y respaldar.

## Consulta representativa

El servicio CitaService filtra las citas por ownerUid, las ordena por fechaHoraUtc y _id, y pagina los resultados. El índice compuesto propuesto es owner_fecha_id_asc.

## Ejecución segura

1. Utilizar una base de prueba aislada y registros ficticios suficientes para comparar estrategias.
2. Registrar volumen de documentos, versión de MongoDB, número de citas por usuario y fecha de ejecución.
3. Revisar índices existentes con db.citas.getIndexes().
4. En la base aislada, crear el índice propuesto solo después de revisar duplicados.
5. Definir UID_PRUEBA en el entorno y ejecutar el archivo mongodb/analizar_consultas.mongosh.js mediante mongosh.
6. Comparar mediana de siete ejecuciones por estrategia, documentos examinados, claves examinadas y cantidad de resultados.
7. Repetir con condiciones equivalentes y adjuntar capturas; interpretar resultados con cautela cuando hay pocos documentos.

| Variable | Exploración completa | Índice compuesto |
|---|---|---|
| Fecha de medición | Pendiente | Pendiente |
| Documentos de prueba | Pendiente | Pendiente |
| Resultados devueltos | Pendiente | Pendiente |
| Mediana de tiempo (ms) | Pendiente | Pendiente |
| Mediana docs examinados | Pendiente | Pendiente |
| Mediana claves examinadas | Pendiente | Pendiente |
| Evidencia | Pendiente | Pendiente |

La métrica explain.executionStats no equivale necesariamente a la latencia experimentada desde el navegador. Se debe distinguir la optimización de consulta del tiempo de red.
