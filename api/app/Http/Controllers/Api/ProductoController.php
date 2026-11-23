<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $datos = $request->validate([
            'categoria' => 'sometimes|in:Alimentos,Accesorios,Higiene,Otros',
            'q' => 'sometimes|string|max:80',
            'disponible' => 'sometimes|boolean',
            'orden' => 'sometimes|in:nombre_asc,precio_asc,precio_desc',
            'page' => 'sometimes|integer|min:1|max:10000'
        ]);
        $consulta = Producto::query()->where('activo', true);

        if (!empty($datos['categoria'])) {
            $consulta->where('categoria', $datos['categoria']);
        }

        if (array_key_exists('disponible', $datos)) {
            $consulta->where('disponible', (bool) $datos['disponible']);
        }

        if (!empty($datos['q'])) {
            $patron = new \MongoDB\BSON\Regex(preg_quote(trim($datos['q']), '/'), 'i');
            $consulta->where(function ($query) use ($patron) {
                $query->where('nombre', 'regex', $patron)
                    ->orWhere('descripcion', 'regex', $patron);
            });
        }

        $orden = $datos['orden'] ?? 'nombre_asc';
        if ($orden === 'precio_asc') {
            $consulta->orderBy('precio')->orderBy('nombre');
        } elseif ($orden === 'precio_desc') {
            $consulta->orderBy('precio', 'desc')->orderBy('nombre');
        } else {
            $consulta->orderBy('nombre')->orderBy('_id');
        }

        $resultado = $consulta->paginate(12, ['*'], 'page', (int) ($datos['page'] ?? 1));

        return response()->json([
            'data' => $resultado->getCollection()->map(fn (Producto $p) => $this->mostrar($p))->values(),
            'page' => $resultado->currentPage(),
            'total' => $resultado->total(),
            'lastPage' => $resultado->lastPage()
        ]);
    }

    public function adminIndex()
    {
        return response()->json(['data' => Producto::query()->orderBy('nombre')->limit(200)->get()
            ->map(fn (Producto $p) => $this->mostrar($p, true))->values()]);
    }

    public function store(Request $request)
    {
        $datos = $this->validar($request);
        $producto = Producto::create([...$datos, 'activo' => $datos['activo'] ?? true, 'disponible' => $datos['disponible'] ?? true]);
        return response()->json(['data' => $this->mostrar($producto, true)], 201);
    }

    public function update(Request $request, string $id)
    {
        $producto = $this->buscar($id);
        $producto->fill($this->validar($request));
        $producto->save();
        return response()->json(['data' => $this->mostrar($producto, true)]);
    }

    public function destroy(string $id)
    {
        $producto = $this->buscar($id);
        $producto->activo = false;
        $producto->save();
        return response()->json(['message' => 'Producto retirado del catálogo público.']);
    }

    private function validar(Request $request): array
    {
        return $request->validate([
            'nombre' => 'required|string|min:3|max:100',
            'categoria' => 'required|in:Alimentos,Accesorios,Higiene,Otros',
            'descripcion' => 'required|string|min:10|max:500',
            'precio' => 'nullable|numeric|min:0|max:100000',
            'disponible' => 'sometimes|boolean',
            'activo' => 'sometimes|boolean',
            'imagenUrl' => 'nullable|url|starts_with:https://|max:500'
        ]);
    }

    private function buscar(string $id): Producto
    {
        abort_unless(preg_match('/^[a-f0-9]{24}$/i', $id), 404);
        return Producto::query()->findOrFail($id);
    }

    private function mostrar(Producto $p, bool $admin = false): array
    {
        return [
            'id' => (string) $p->getKey(),
            'nombre' => $p->nombre,
            'categoria' => $p->categoria,
            'descripcion' => $p->descripcion,
            'precio' => $p->precio,
            'disponible' => (bool) $p->disponible,
            'imagenUrl' => $p->imagenUrl,
            ...($admin ? ['activo' => (bool) $p->activo] : [])
        ];
    }
}
