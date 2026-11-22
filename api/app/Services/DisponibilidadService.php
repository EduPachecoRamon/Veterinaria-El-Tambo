<?php

namespace App\Services;

use App\Models\Cita;
use App\Models\HorarioVeterinario;
use App\Models\Veterinario;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

class DisponibilidadService
{
    public function consultar(string $veterinarioId, string $fecha): array
    {
        $zona = 'America/Lima';

        if (!preg_match('/^[a-f0-9]{24}$/i', $veterinarioId)) {
            abort(404, 'Veterinario no encontrado.');
        }

        $veterinario = Veterinario::query()
            ->where('activo', true)
            ->find($veterinarioId);

        if (!$veterinario) {
            abort(404, 'Veterinario no encontrado o inactivo.');
        }

        try {
            $dia = CarbonImmutable::createFromFormat('!Y-m-d', $fecha, $zona);
        } catch (\Throwable $e) {
            $dia = false;
        }

        if (!$dia || $dia->format('Y-m-d') !== $fecha) {
            throw ValidationException::withMessages([
                'fecha' => 'La fecha debe tener formato AAAA-MM-DD.'
            ]);
        }

        $hoy = CarbonImmutable::now($zona)->startOfDay();

        if ($dia->lt($hoy) || $dia->gt($hoy->addDays(30))) {
            throw ValidationException::withMessages([
                'fecha' => 'Solo se permiten fechas entre hoy y los proximos 30 dias.'
            ]);
        }

        $horario = HorarioVeterinario::query()
            ->where('veterinarioId', $veterinarioId)
            ->where('diaSemana', $dia->dayOfWeekIso)
            ->first();

        $inicioUtc = $dia->utc();
        $finUtc = $dia->addDay()->utc();

        $ocupadas = Cita::query()
            ->where('veterinarioId', $veterinarioId)
            ->whereIn('estado', ['confirmada', 'en_curso'])
            ->where('fechaHoraUtc', '>=', $inicioUtc)
            ->where('fechaHoraUtc', '<', $finUtc)
            ->get()
            ->mapWithKeys(fn (Cita $cita) => [
                $cita->fechaHoraUtc->utc()->format('Y-m-d H:i:s') => true
            ])
            ->all();

        $turnos = [];
        $ahora = CarbonImmutable::now($zona);

        if ($horario) {
            foreach ($horario->intervalos ?? [] as $intervalo) {
                $inicio = $dia->setTimeFromTimeString($intervalo['inicio']);
                $fin = $dia->setTimeFromTimeString($intervalo['fin']);

                for (
                    $turno = $inicio;
                    $turno->addHour()->lte($fin);
                    $turno = $turno->addHour()
                ) {
                    if ($turno->lte($ahora)) {
                        continue;
                    }

                    $turnoUtc = $turno->utc();
                    $clave = $turnoUtc->format('Y-m-d H:i:s');

                    $turnos[] = [
                        'hora' => $turno->format('H:i'),
                        'fechaHora' => $turnoUtc->toIso8601String(),
                        'disponible' => !isset($ocupadas[$clave])
                    ];
                }
            }
        }

        return [
            'veterinarioId' => $veterinarioId,
            'fecha' => $fecha,
            'zonaHoraria' => $zona,
            'duracionMinutos' => 60,
            'turnos' => $turnos
        ];
    }
}