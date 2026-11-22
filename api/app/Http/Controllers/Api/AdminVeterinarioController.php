<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HorarioVeterinario;
use App\Models\Veterinario;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminVeterinarioController extends Controller
{
    public function index()
    {
        $horarios = HorarioVeterinario::query()->get()->groupBy('veterinarioId');
        return response()->json(['data' => Veterinario::query()->orderBy('nombre')->get()->map(fn ($v) => [
            'id' => (string) $v->getKey(),
            'nombre' => $v->nombre,
            'especialidad' => $v->especialidad,
            'activo' => (bool) $v->activo,
            'horarios' => ($horarios[(string) $v->getKey()] ?? collect())->map(fn ($h) => [
                'diaSemana' => (int) $h->diaSemana,
                'intervalos' => $h->intervalos ?? []
            ])->values()
        ])->values()]);
    }

    public function store(Request $request)
    {
        $datos = $this->validar($request);
        $vet = Veterinario::create([...$datos, 'activo' => $datos['activo'] ?? true]);
        return response()->json(['data' => ['id' => (string) $vet->getKey()]], 201);
    }

    public function update(Request $request, string $id)
    {
        $vet = $this->buscar($id);
        $vet->fill($this->validar($request));
        $vet->save();
        return response()->json(['message' => 'Profesional actualizado.']);
    }

    public function horario(Request $request, string $id, int $dia)
    {
        $this->buscar($id);
        abort_unless($dia >= 1 && $dia <= 7, 422, 'El día debe estar entre 1 y 7.');
        $datos = $request->validate([
            'intervalos' => 'required|array|max:4',
            'intervalos.*.inicio' => 'required|date_format:H:i',
            'intervalos.*.fin' => 'required|date_format:H:i'
        ]);

        $intervalos = $datos['intervalos'];
        usort($intervalos, fn ($a, $b) => strcmp($a['inicio'], $b['inicio']));
        $ultimo = '00:00';
        foreach ($intervalos as $intervalo) {
            $inicio = $intervalo['inicio'];
            $fin = $intervalo['fin'];
            if ($inicio < $ultimo || $inicio >= $fin || substr($inicio, -2) !== '00' || substr($fin, -2) !== '00') {
                throw ValidationException::withMessages(['intervalos' => 'Los intervalos deben ser horas completas, ordenadas y sin superponerse.']);
            }
            $ultimo = $fin;
        }

        HorarioVeterinario::query()->updateOrCreate(
            ['veterinarioId' => strtolower($id), 'diaSemana' => $dia],
            ['intervalos' => $intervalos, 'zonaHoraria' => 'America/Lima']
        );

        return response()->json(['message' => 'Horario guardado.']);
    }

    private function buscar(string $id): Veterinario
    {
        abort_unless(preg_match('/^[a-f0-9]{24}$/i', $id), 404);
        return Veterinario::query()->findOrFail($id);
    }

    private function validar(Request $request): array
    {
        return $request->validate([
            'nombre' => 'required|string|min:3|max:100',
            'especialidad' => 'required|string|min:3|max:100',
            'activo' => 'sometimes|boolean'
        ]);
    }
}
