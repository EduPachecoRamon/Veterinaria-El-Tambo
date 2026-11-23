const objetivo = 'ClinicaElTambo_Benchmark_20261123';
if (db.getName() !== objetivo) throw new Error('Conecta primero a la base aislada ' + objetivo);
const collection = db.getCollection('citas_demo');
if (collection.countDocuments({}) < 1000) throw new Error('El conjunto de prueba debe tener al menos 1000 documentos.');
const indexName = 'owner_fecha_id_asc';
if (!collection.getIndexes().some(x => x.name === indexName)) throw new Error('Falta el índice del experimento; no se creará automáticamente.');

const filter = {ownerUid: 'demo-uid-03'};
const sort = {fechaHoraUtc: 1, _id: 1};
const repetitions = 7;

function median(values) {
  const sorted = [...values].sort((a,b) => a-b);
  return sorted[Math.floor(sorted.length/2)];
}

function measure(name,hint) {
  const results = [];
  for(let i=0;i<repetitions;i++) {
    const plan = collection.find(filter).sort(sort).limit(10).hint(hint).explain('executionStats');
    results.push({
      ms: plan.executionStats.executionTimeMillis,
      docs: plan.executionStats.totalDocsExamined,
      keys: plan.executionStats.totalKeysExamined,
      returned: plan.executionStats.nReturned
    });
  }
  return {
    strategy:name,
    executions:repetitions,
    medianMs:median(results.map(r=>r.ms)),
    medianDocsExamined:median(results.map(r=>r.docs)),
    medianKeysExamined:median(results.map(r=>r.keys)),
    returned:results[0].returned,
    observations:results
  };
}

const natural = measure('Exploración completa',{$natural:1});
const indexed = measure('Índice compuesto',indexName);
print('Base: '+db.getName());
print('Total de documentos: '+collection.countDocuments({}));
printjson(natural);
printjson(indexed);
if(natural.returned!==indexed.returned) throw new Error('La comparación no es válida: cantidades diferentes.');
print('Reducción de documentos examinados (%): '+((natural.medianDocsExamined-indexed.medianDocsExamined)/natural.medianDocsExamined*100).toFixed(2));
