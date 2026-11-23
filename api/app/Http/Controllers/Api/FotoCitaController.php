<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use Illuminate\Http\Request;
use MongoDB\BSON\ObjectId;
use MongoDB\Client;

class FotoCitaController extends Controller
{
    private function bucket()
    {
        $client = new Client((string) config('database.connections.mongodb.dsn'), [], [
            'serverSelectionTimeoutMS' => 5000,
            'connectTimeoutMS' => 5000
        ]);
        $database = $client->selectDatabase((string) config('database.connections.mongodb.database'));
        return $database->selectGridFSBucket(['bucketName' => 'fotos_citas']);
    }

    private function cita(string $id, ?string $uid = null): Cita
    {
        abort_unless(preg_match('/^[a-f0-9]{24}$/i', $id), 404);
        $query = Cita::query();
        if ($uid !== null) $query->where('ownerUid', $uid);
        return $query->findOrFail($id);
    }

    public function store(Request $request, string $id)
    {
        $cita = $this->cita($id, (string) $request->attributes->get('firebase_uid'));
        $datos = $request->validate(['foto' => 'required|file|mimes:jpg,jpeg,png,webp|max:3072']);
        $foto = $datos['foto'];
        $mime = $foto->getMimeType();

        abort_unless(in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true), 422, 'Formato de imagen inválido.');

        $archivo = fopen($foto->getRealPath(), 'rb');
        abort_unless($archivo !== false, 422, 'No se pudo abrir la imagen.');

        $bucket = $this->bucket();
        try {
            $objeto = $bucket->uploadFromStream('foto-cita', $archivo, [
                'metadata' => [
                    'ownerUid' => (string) $request->attributes->get('firebase_uid'),
                    'citaId' => (string) $cita->getKey(),
                    'contentType' => $mime
                ]
            ]);
        } finally {
            fclose($archivo);
        }

        $anterior = $cita->fotoId ?? null;
        $cita->fotoId = (string) $objeto;
        $cita->save();

        if ($anterior && preg_match('/^[a-f0-9]{24}$/i', (string) $anterior)) {
            try { $bucket->delete(new ObjectId((string) $anterior)); }
            catch (\Throwable $error) { report($error); }
        }

        return response()->json(['message' => 'Imagen adjuntada correctamente.', 'tieneFoto' => true], 201);
    }

    public function show(Request $request, string $id)
    {
        $uid = (string) $request->attributes->get('firebase_uid');
        $cita = $this->cita($id, $uid);
        return $this->render($cita);
    }

    public function showAdmin(string $id)
    {
        return $this->render($this->cita($id));
    }

    private function render(Cita $cita)
    {
        $fotoId = (string) ($cita->fotoId ?? '');
        abort_unless(preg_match('/^[a-f0-9]{24}$/i', $fotoId), 404, 'La cita no tiene imagen.');
        $bucket = $this->bucket();
        $id = new ObjectId($fotoId);
        $archivo = $bucket->findOne(['_id' => $id]);
        abort_unless($archivo, 404, 'Imagen no encontrada.');

        $mime = (string) ($archivo->getMetadata()['contentType'] ?? '');
        abort_unless(in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true), 404);

        return response()->stream(function() use ($bucket, $id) {
            $stream = $bucket->openDownloadStream($id);
            try { fpassthru($stream); }
            finally { fclose($stream); }
        }, 200, [
            'Content-Type' => $mime,
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Disposition' => 'inline'
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $cita = $this->cita($id, (string) $request->attributes->get('firebase_uid'));
        $fotoId = (string) ($cita->fotoId ?? '');
        if ($fotoId && preg_match('/^[a-f0-9]{24}$/i', $fotoId)) {
            $this->bucket()->delete(new ObjectId($fotoId));
            $cita->fotoId = null;
            $cita->save();
        }
        return response()->json(['message' => 'Imagen eliminada.']);
    }
}
