<?php

namespace App\Services;

use App\Models\Cita;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Throwable;

class CitaService
{
    public function __construct(
        private DisponibilidadService $disponibilidad
    ) {}

    public function listar(string $uid, string $periodo, int $pagina, int $tamano): array
    {
        $query = Cita::query()->where('ownerUid', $uid);
        $ahora = CarbonImmutable::now('UTC');

        if ($periodo === 'proximas') {
            $query->where('fechaHoraUtc', '>=', $ahora);
        }

        if ($periodo === 'anteriores') {
            $query->where('fechaHoraUtc', '<', $ahora);
        }

        $orden = $periodo === 'anteriores' ? 'desc' : 'asc';

        $resultado = $query
            ->orderBy('fechaHoraUtc', $orden)
            ->orderBy('_id', $orden)
            ->paginate($tamano, ['*'], 'page', $pagina);

        return [
            'data' => $resultado->getCollection()
                ->map(fn (Cita $c) => $this->formatear($c))
                ->values()
                ->all(),
            'page' => $resultado->currentPage(),
            'perPage' => $tamano,
            'total' => $resultado->total(),
            'lastPage' => $resultado->lastPage()
        ];
    }

    public function crear(string $uid, array $datos): array
    {
        $normalizados = $this->normalizar($datos);

        $cita = $this->guardarProtegido(function () use ($uid, $normalizados) {
            return Cita::create([
                'ownerUid' => $uid,
                ...$normalizados,
                'estado' => 'confirmada'
            ]);
        });

        return $this->formatear($cita);
    }

    public function editar(string $uid, string $id, array $datos): array
    {
        $cita = $this->buscar($uid, $id);

        if ($cita->estado !== 'confirmada') {
            throw new ConflictHttpException(
                'Solo se pueden editar citas confirmadas. Las citas antiguas deben regularizarse.'
            );
        }

        $normalizados = $this->normalizar($datos, $cita);

        $cita = $this->guardarProtegido(function () use ($cita, $normalizados) {
            $cita->fill($normalizados);
            $cita->save();
            return $cita;
        });

        return $this->formatear($cita);
    }

    public function borrar(string $uid, string $id): void
    {
        $cita = $this->buscar($uid, $id);

        if ($cita->estado === 'cancelada') {
            return;
        }

        if (in_array($cita->estado, ['en_curso', 'completada'], true)) {
            throw new ConflictHttpException(
                'No se puede cancelar una cita en curso o completada.'
            );
        }

        $cita->estado = 'cancelada';
        $cita->save();
    }

    private function buscar(string $uid, string $id): Cita
    {
        if (!preg_match('/^[a-f0-9]{24}$/i', $id)) {
            abort(404, 'Cita no encontrada.');
        }

        $cita = Cita::query()
            ->where('ownerUid', $uid)
            ->find($id);

        if (!$cita) {
            abort(404, 'Cita no encontrada.');
        }

        return $cita;
    }

    private function normalizar(array $datos, ?Cita $citaActual = null): array
    {
        $fecha = CarbonImmutable::parse($datos['fechaHora'])->utc();
        $local = $fecha->setTimezone('America/Lima');

        $ahora = CarbonImmutable::now('America/Lima');

        if (
            $fecha->lte(CarbonImmutable::now('UTC')) ||
            $local->startOfDay()->gt($ahora->startOfDay()->addDays(30))
        ) {
            throw ValidationException::withMessages([
                'fechaHora' => 'La cita debe ser futura y estar dentro de los proximos 30 dias.'
            ]);
        }

        if ($local->minute !== 0 || $local->second !== 0) {
            throw ValidationException::withMessages([
                'fechaHora' => 'Las citas deben comenzar en una hora exacta.'
            ]);
        }

        $veterinarioId = strtolower($datos['veterinarioId']);

        $disponibilidad = $this->disponibilidad->consultar(
            $veterinarioId,
            $local->format('Y-m-d')
        );

        $turnoValido = false;

        foreach ($disponibilidad['turnos'] as $turno) {
            if (
                CarbonImmutable::parse($turno['fechaHora'])->utc()->equalTo($fecha) &&
                (
                    $turno['disponible'] === true ||
                    (
                        $citaActual !== null &&
                        $citaActual->veterinarioId === $veterinarioId &&
                        $citaActual->fechaHoraUtc !== null &&
                        $citaActual->fechaHoraUtc->utc()->equalTo($fecha) &&
                        !Cita::query()
                            ->where('veterinarioId', $veterinarioId)
                            ->where('fechaHoraUtc', $fecha)
                            ->whereIn('estado', ['confirmada', 'en_curso'])
                            ->where('_id', '!=', $citaActual->getKey())
                            ->exists()
                    )
                )
            ) {
                $turnoValido = true;
                break;
            }
        }

        if (!$turnoValido) {
            throw ValidationException::withMessages([
                'fechaHora' => 'El turno no pertenece al horario disponible del veterinario.'
            ]);
        }

        return [
            'propietario' => trim($datos['propietario']),
            'mascota' => trim($datos['mascota']),
            'especie' => $datos['especie'],
            'motivo' => trim($datos['motivo']),
            'fechaHoraUtc' => $fecha,
            'veterinarioId' => $veterinarioId
        ];
    }

    private function guardarProtegido(callable $operacion): Cita
    {
        try {
            return $operacion();
        } catch (Throwable $error) {
            $actual = $error;

            do {
                if ((int) $actual->getCode() === 11000) {
                    throw new ConflictHttpException(
                        'Este veterinario ya tiene una reserva para ese turno.',
                        $error
                    );
                }

                $actual = $actual->getPrevious();
            } while ($actual !== null);

            throw $error;
        }
    }

    private function formatear(Cita $cita): array
    {
        return [
            'id' => (string) $cita->getKey(),
            'propietario' => $cita->propietario,
            'mascota' => $cita->mascota,
            'especie' => $cita->especie,
            'motivo' => $cita->motivo,
            'fechaHora' => $cita->fechaHoraUtc?->toIso8601String(),
            'veterinarioId' => $cita->veterinarioId ?? null,
            'estado' => $cita->estado ?? null,
            'tieneFoto' => !empty($cita->fotoId)
        ];
    }
}