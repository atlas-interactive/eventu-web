import { useState } from 'react';
import { mensajeDeError } from '../../api/mensajeDeError';
import { inscribirEnEvento } from '../../features/inscripciones/services/inscripcionService';

export function useInscripcionEvento() {
    const [inscribiendo, setInscribiendo] = useState(false);
    const [error, setError] = useState('');
    const [inscripcionRealizada, setInscripcionRealizada] = useState(false);

    const inscribir = async (eventoId: number) => {
        if (inscribiendo || inscripcionRealizada) return;
        setInscribiendo(true);
        setError('');
        try {
            await inscribirEnEvento(eventoId);
            setInscripcionRealizada(true);
        } catch (err: unknown) {
            console.error('No se pudo realizar la inscripción al evento:', err);
            setError(mensajeDeError(err));
        } finally {
            setInscribiendo(false);
        }
    };

    return { inscribiendo, error, inscripcionRealizada, inscribir };
}
