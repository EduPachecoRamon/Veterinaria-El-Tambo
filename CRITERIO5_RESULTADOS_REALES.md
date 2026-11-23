# Criterio 5 — Comparación real de optimización MongoDB

**Fecha:** 23 de noviembre de 2026. **Asignatura:** Programación Web, Unidad 3, laboratorio de la semana 10.

**Objetivo de la rúbrica:** analizar las consultas, aplicar optimizaciones y presentar evidencias comparativas del rendimiento.

## Datos y seguridad

- Clúster: el mismo MongoDB Atlas usado en el entorno de desarrollo.
- Base independiente: `ClinicaElTambo_Benchmark_20261123`.
- Colección ficticia: `citas_demo`.
- 1500 documentos falsos (15 identificadores de propietario, 100 citas por propietario).
- Filtro: `{ ownerUid: "demo-uid-03" }`.
- Orden: `{ fechaHoraUtc: 1, _id: 1 }`; límite de 10 registros.
- Siete ejecuciones para cada estrategia; mediana de `executionStats`.
- Se midió primero **sin índice** y después **con índice compuesto** `{ownerUid:1,fechaHoraUtc:1,_id:1}`, con nombre `owner_fecha_id_asc`.
- No se modificaron, consultaron en detalle ni eliminaron citas personales en la base de producción.
- En el conjunto sintético `fechaHoraUtc` está representado como texto ISO 8601; en la colección de producción es BSON Date. La comparación demuestra el efecto del acceso indexado para filtro y orden en este conjunto, no reproduce todos los detalles del trabajo productivo.

## Resultados medidos

| Métrica | Sin índice (exploración) | Con índice compuesto |
|---|---:|---:|
| Documentos disponibles | 1500 | 1500 |
| Registros devueltos por ejecución | 10 | 10 |
| Número de ejecuciones | 7 | 7 |
| Mediana `executionTimeMillis` | 1 ms | 0 ms |
| Mediana `totalDocsExamined` | 1500 | 10 |
| Mediana `totalKeysExamined` | 0 | 10 |
| Plan ganador observado | `SORT` con `COLLSCAN` | `LIMIT` con `FETCH` / `IXSCAN` |

La reducción de documentos examinados fue de **99,33 %**, calculada como `(1500 - 10) / 1500 × 100`.

Los tiempos de ejecución observados fueron:

- Antes: **[1, 1, 1, 1, 1, 1, 1] ms**.
- Después: **[1, 0, 1, 0, 0, 0, 0] ms**.

El valor 0 ms es el redondeo de la medición del servidor, **no** significa ejecución instantánea. No se afirma un factor de aceleración determinado por esos tiempos ni una mejora garantizada en la latencia total HTTP.

## Reproducción de solo lectura

La base ya contiene el índice de la medición. Se pueden comparar ambos planes sin eliminarlo, mediante `hint({$natural:1})` e `hint("owner_fecha_id_asc")`:

```javascript
const c = db.getSiblingDB('ClinicaElTambo_Benchmark_20261123').citas_demo;
const filtro = { ownerUid: 'demo-uid-03' };
const orden = { fechaHoraUtc: 1, _id: 1 };

c.find(filtro).sort(orden).limit(10).hint({ $natural: 1 }).explain('executionStats');
c.find(filtro).sort(orden).limit(10).hint('owner_fecha_id_asc').explain('executionStats');
```

El script del repositorio `mongodb/analizar_consultas.mongosh.js` ejecuta siete repeticiones de ambas estrategias y muestra sus resultados, sin cambiar índices ni documentos.

## Evidencia entregable

1. Captura del nombre de la base de prueba y `countDocuments() = 1500`.
2. Captura de `getIndexes()` con el índice compuesto.
3. Dos capturas del `explain` mostrando `totalDocsExamined`, `totalKeysExamined` y plan ganador.
4. Tabla anterior y explicación de la mejora para el informe técnico.

**Conexión con el curso:** el laboratorio de la semana 10 solicita aplicar herramientas de análisis, proponer estrategias, probar consultas optimizadas y documentar la comparación de rendimiento.
