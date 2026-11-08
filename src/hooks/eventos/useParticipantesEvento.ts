import { useEffect, useState } from 'react';
import { mensajeDeError } from '../../api/mensajeDeError';
import type { Evento, InscritoEvento } from '../../types/evento';
import { listarInscritosEvento, obtenerEvento } from '../../features/eventos/services/eventoService';

export function useParticipantesEvento(eventoId: number) {
    const [resultado, setResultado] = useState<{
        eventoId: number;
        evento: Evento | null;
        inscritos: InscritoEvento[];
        error: string;
    } | null>(null);
    const identificadorValido = Number.isSafeInteger(eventoId) && eventoId > 0;
    const resultadoActual = resultado?.eventoId === eventoId ? resultado : null;
    const cargando = identificadorValido && !resultadoActual;
    const evento = resultadoActual?.evento ?? null;
    const inscritos = resultadoActual?.inscritos ?? [];
    const error = !identificadorValido
        ? 'El identificador del evento no es válido.'
        : resultadoActual?.error ?? '';

    useEffect(() => {
        let vigente = true;
        if (!identificadorValido) {
            return () => {
                vigente = false;
            };
        }

        Promise.all([obtenerEvento(eventoId), listarInscritosEvento(eventoId)])
            .then(([datosEvento, participantes]) => {
                if (!vigente) return;
                setResultado({
                    eventoId,
                    evento: datosEvento,
                    inscritos: participantes,
                    error: '',
                });
            })
            .catch((err: unknown) => {
                console.error('No se pudieron cargar los participantes del evento:', err);
                if (vigente) {
                    setResultado({
                        eventoId,
                        evento: null,
                        inscritos: [],
                        error: mensajeDeError(err),
                    });
                }
            });

        return () => {
            vigente = false;
        };
    }, [eventoId, identificadorValido]);

    return { evento, inscritos, cargando, error };
}
