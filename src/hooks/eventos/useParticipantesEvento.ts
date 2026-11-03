import { useEffect, useState } from 'react';
import { mensajeDeError } from '../../api/mensajeDeError';
import type { Evento, InscritoEvento } from '../../types/evento';
import { listarInscritosEvento, obtenerEvento } from '../../features/eventos/services/eventoService';

export function useParticipantesEvento(eventoId: number) {
    const [evento, setEvento] = useState<Evento | null>(null);
    const [inscritos, setInscritos] = useState<InscritoEvento[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let vigente = true;
        setEvento(null);
        setInscritos([]);
        setError('');

        if (!Number.isSafeInteger(eventoId) || eventoId <= 0) {
            setError('El identificador del evento no es válido.');
            setCargando(false);
            return () => {
                vigente = false;
            };
        }

        setCargando(true);
        Promise.all([obtenerEvento(eventoId), listarInscritosEvento(eventoId)])
            .then(([datosEvento, participantes]) => {
                if (!vigente) return;
                setEvento(datosEvento);
                setInscritos(participantes);
            })
            .catch((err: unknown) => {
                console.error('No se pudieron cargar los participantes del evento:', err);
                if (vigente) setError(mensajeDeError(err));
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });

        return () => {
            vigente = false;
        };
    }, [eventoId]);

    return { evento, inscritos, cargando, error };
}
