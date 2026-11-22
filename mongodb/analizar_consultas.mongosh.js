// Script de solo lectura para mongosh. Ejecútalo sobre una base de PRUEBAS.
// Antes de ejecutarlo, define la variable de entorno UID_PRUEBA con un ownerUid de prueba,
// y conecta mongosh a la base correcta (ejemplo: clinica_eltambo).
const uid = process.env.UID_PRUEBA;
if (!uid) throw new Error('Configura UID_PRUEBA con un identificador de cuenta de prueba.');
const citas = db.getCollection('citas');
const filtro = {ownerUid: uid, fechaHoraUtc: {$gte: new Date()}};
const orden = {fechaHoraUtc: 1, _id: 1};
function observar(nombre, hint) {
  const resultado = citas.find(filtro).sort(orden).limit(10).hint(hint).explain('executionStats');
  printjson({
    estrategia: nombre,
    registrosEncontrados: resultado.executionStats.nReturned,
    documentosExaminados: resultado.executionStats.totalDocsExamined,
    clavesExaminadas: resultado.executionStats.totalKeysExamined,
    tiempoConsultaMs: resultado.executionStats.executionTimeMillis,
    plan: resultado.queryPlanner.winningPlan
  });
}
print('Índices existentes:'); printjson(citas.getIndexes());
observar('Exploración completa', {$natural: 1});
observar('Índice compuesto', 'owner_fecha_id_asc');
print('Realiza varias corridas con el mismo dataset; comparar una sola medición no prueba rendimiento.');
