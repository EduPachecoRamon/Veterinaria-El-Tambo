const cases = [
  {nombre: 'Frontend disponible', url: 'https://vet-tambo-frontend.onrender.com/', expected: 200},
  {nombre: 'Salud de Laravel', url: 'https://vet-tambo-api.onrender.com/api/salud', expected: 200},
  {nombre: 'API sin token', url: 'https://vet-tambo-api.onrender.com/api/yo', expected: 401}
];

let failed = 0;

for (const item of cases) {
  try {
    const response = await fetch(item.url, {signal: AbortSignal.timeout(15000)});
    const headers = {
      contentType: response.headers.get('content-type'),
      nosniff: response.headers.get('x-content-type-options'),
      frameOptions: response.headers.get('x-frame-options')
    };
    let passed = response.status === item.expected;
    if (item.nombre === 'Salud de Laravel') {
      const data = await response.json();
      passed = passed && data.estado === 'activo' && headers.nosniff === 'nosniff';
    }
    if (item.nombre === 'Frontend disponible') {
      const html = await response.text();
      passed = passed && html.includes('id="root"');
    }
    if (!passed) failed += 1;
    process.stdout.write(JSON.stringify({caso: item.nombre, status: response.status, esperado: item.expected, ok: passed, cabeceras: headers}) + '\n');
  } catch (error) {
    failed += 1;
    process.stdout.write(JSON.stringify({caso:item.nombre,ok:false,error:error.name}) + '\n');
  }
}

if (failed) process.exitCode = 1;
