<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;
use MongoDB\BSON\ObjectId;
use MongoDB\Client;

class FotoProductoController extends Controller
{
    private function bucket()
    {
        $client = new Client((string) config('database.connections.mongodb.dsn'), [], ['serverSelectionTimeoutMS' => 5000]);
        return $client->selectDatabase((string) config('database.connections.mongodb.database'))
            ->selectGridFSBucket(['bucketName' => 'fotos_productos']);
    }

    private function producto(string $id): Producto
    {
        abort_unless(preg_match('/^[a-f0-9]{24}$/i', $id), 404);
        return Producto::query()->findOrFail($id);
    }

    public function store(Request $request, string $id)
    {
        $producto = $this->producto($id);
        $archivo = $request->validate(['foto' => 'required|file|mimes:jpg,jpeg,png,webp|max:3072'])['foto'];
        $mime = $archivo->getMimeType();
        abort_unless(in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true), 422);

        $stream = fopen($archivo->getRealPath(), 'rb');
        abort_unless($stream !== false, 422);
        $bucket = $this->bucket();
        try {
            $fotoId = $bucket->uploadFromStream('foto-producto', $stream, [
                'metadata' => ['contentType' => $mime, 'productoId' => (string) $producto->getKey()]
            ]);
        } finally {
            fclose($stream);
        }

        $anterior = $producto->fotoId ?? null;
        $producto->fotoId = (string) $fotoId;
        $producto->save();

        if ($anterior && preg_match('/^[a-f0-9]{24}$/i', (string) $anterior)) {
            try { $bucket->delete(new ObjectId((string) $anterior)); }
            catch (\Throwable $e) { report($e); }
        }

        return response()->json(['message' => 'Fotografía actualizada.'], 201);
    }

    public function show(string $id)
    {
        $producto = $this->producto($id);
        abort_unless((bool) $producto->activo, 404);
        $fotoId = (string) ($producto->fotoId ?? '');
        abort_unless(preg_match('/^[a-f0-9]{24}$/i', $fotoId), 404);
        $bucket = $this->bucket();
        $id = new ObjectId($fotoId);
        $archivo = $bucket->findOne(['_id' => $id]);
        abort_unless($archivo !== null, 404);
        $metadata = $archivo->getMetadata();
        $mime = (string) ($metadata['contentType'] ?? '');
        abort_unless(in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true), 404);

        return response()->stream(function() use ($bucket, $id) {
            $stream = $bucket->openDownloadStream($id);
            try { fpassthru($stream); }
            finally { fclose($stream); }
        }, 200, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=300',
            'X-Content-Type-Options' => 'nosniff'
        ]);
    }
}
