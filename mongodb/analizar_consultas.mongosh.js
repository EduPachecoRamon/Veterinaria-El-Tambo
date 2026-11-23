const uid = process.env.UID_PRUEBA;
if (!uid) throw new Error('Define UID_PRUEBA de una cuenta de prueba antes de analizar consultas.');

const collection = db.getCollection('citas');
const indexes = collection.getIndexes();
const indexed = indexes.some(x => x.name === 'owner_fecha_id_asc');
const repetitions = 7;
const filter = {ownerUid: uid};
const sort = {fechaHoraUtc: 1, _id: 1};

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function inspect(name, hint) {
  const samples = [];
  for (let i = 0; i < repetitions; i++) {
    const result = collection.find(filter).sort(sort).limit(10).hint(hint).explain('executionStats');
    const stats = result.executionStats;
    samples.push({
      timeMs: stats.executionTimeMillis,
      docsExamined: stats.totalDocsExamined,
      keysExamined: stats.totalKeysExamined,
      returned: stats.nReturned
    });
  }
  return {
    strategy: name,
    runs: repetitions,
    medianTimeMs: median(samples.map(x => x.timeMs)),
    medianDocsExamined: median(samples.map(x => x.docsExamined)),
    medianKeysExamined: median(samples.map(x => x.keysExamined)),
    returned: samples[0].returned
  };
}

print('Base de datos: ' + db.getName());
print('Documentos totales: ' + collection.estimatedDocumentCount());
print('Indices: ' + indexes.map(i => i.name).join(', '));
const natural = inspect('COLLSCAN (referencia sin indice)', {$natural: 1});
printjson(natural);
if (!indexed) {
  print('PENDIENTE: owner_fecha_id_asc no existe; no se inventa la medicion indexada.');
} else {
  const optimized = inspect('Indice compuesto por propietario y fecha', 'owner_fecha_id_asc');
  printjson(optimized);
  if (natural.returned !== optimized.returned) {
    print('ADVERTENCIA: cantidad de resultados diferente; detener comparacion.');
  }
}
print('Interpretar con un dataset de prueba suficiente; no usar un dato aislado como prueba de mejora.');
