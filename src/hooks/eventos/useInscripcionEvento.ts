import { useEffect, useState } from 'react';
import { mensajeDeError } from '../../api/mensajeDeError';
import {
    inscribirEnEvento,
    tieneInscripcionActiva,
} from '../../features/inscripciones/services/inscripcionService';

export function useInscripcionEvento(eventoId: number, habilitado = true) {
    const [verificando, setVerificando] = useState(habilitado);
    const [yaInscrito, setYaInscrito] = useState(false);
    const [errorVerificacion, setErrorVerificacion] = useState('');
    const [intentoVerificacion, setIntentoVerificacion] = useState(0);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [error, setError] = useState('');
    const [inscripcionRealizada, setInscripcionRealizada] = useState(false);

    useEffect(() => {
        let vigente = true;
        if (!habilitado || !Number.isSafeInteger(eventoId) || eventoId <= 0) {
            setVerificando(false);
            setYaInscrito(false);
            setErrorVerificacion('');
            return () => {
                vigente = false;
            };
        }

        setVerificando(true);
        setErrorVerificacion('');
        tieneInscripcionActiva(eventoId)
            .then((activa) => {
                if (vigente) setYaInscrito(activa);
            })
            .catch((err: unknown) => {
                console.error('No se pudo verificar la inscripción al evento:', err);
                if (vigente) setErrorVerificacion(mensajeDeError(err));
            })
            .finally(() => {
                if (vigente) setVerificando(false);
            });

        return () => {
            vigente = false;
        };
    }, [eventoId, habilitado, intentoVerificacion]);

    const reintentarVerificacion = () => setIntentoVerificacion((intento) => intento + 1);

    const inscribir = async () => {
        if (verificando || errorVerificacion || yaInscrito || inscribiendo || inscripcionRealizada) return;
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

    return {
        verificando,
        yaInscrito,
        errorVerificacion,
        reintentarVerificacion,
        inscribiendo,
        error,
        inscripcionRealizada,
        inscribir: () => inscribir(),
    };
}
