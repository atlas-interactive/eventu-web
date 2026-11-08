import { useEffect, useState } from 'react';
import { mensajeDeError } from '../../api/mensajeDeError';
import type { Evento } from '../../types/evento';
import type { Inscripcion } from '../../types/inscripcion';
import {
    cancelarInscripcion,
    inscribirEnEvento,
    obtenerInscripcionActiva,
} from '../../features/inscripciones/services/inscripcionService';

export function useInscripcionEvento(eventoId: number, habilitado = true) {
    const [intentoVerificacion, setIntentoVerificacion] = useState(0);
    const claveVerificacion = `${eventoId}:${habilitado}:${intentoVerificacion}`;
    const identificadorValido = habilitado && Number.isSafeInteger(eventoId) && eventoId > 0;
    const [resultadoVerificacion, setResultadoVerificacion] = useState<{
        clave: string;
        inscripcion: Inscripcion | null;
        error: string;
    } | null>(null);
    const resultadoActual = resultadoVerificacion?.clave === claveVerificacion
        ? resultadoVerificacion
        : null;
    const verificando = identificadorValido && !resultadoActual;
    const inscripcionActiva = resultadoActual?.inscripcion ?? null;
    const yaInscrito = inscripcionActiva !== null;
    const errorVerificacion = resultadoActual?.error ?? '';
    const [inscribiendo, setInscribiendo] = useState(false);
    const [error, setError] = useState('');
    const [inscripcionRealizada, setInscripcionRealizada] = useState(false);
    const [cancelando, setCancelando] = useState(false);
    const [errorCancelacion, setErrorCancelacion] = useState('');

    useEffect(() => {
        let vigente = true;
        if (!identificadorValido) {
            return () => {
                vigente = false;
            };
        }

        obtenerInscripcionActiva(eventoId)
            .then((activa) => {
                if (!vigente) return;
                setResultadoVerificacion({
                    clave: claveVerificacion,
                    inscripcion: activa,
                    error: '',
                });
            })
            .catch((err: unknown) => {
                console.error('No se pudo verificar la inscripción al evento:', err);
                if (vigente) {
                    setResultadoVerificacion({
                        clave: claveVerificacion,
                        inscripcion: null,
                        error: mensajeDeError(err),
                    });
                }
            });

        return () => {
            vigente = false;
        };
    }, [eventoId, habilitado, intentoVerificacion, claveVerificacion, identificadorValido]);

    const reintentarVerificacion = () => setIntentoVerificacion((intento) => intento + 1);

    const inscribir = async (evento: Evento): Promise<boolean> => {
        if (verificando || errorVerificacion || yaInscrito || inscribiendo || inscripcionRealizada) return false;
        setInscribiendo(true);
        setError('');
        try {
            const respuesta = await inscribirEnEvento(eventoId);
            const nuevaInscripcion: Inscripcion = {
                id: respuesta.inscripcionId,
                estado: 'ACTIVA',
                codigoQr: respuesta.codigoQr,
                fechaInscripcion: new Date().toISOString(),
                eventoId,
                eventoTitulo: evento.titulo,
                eventoFechaInicio: evento.fechaInicio,
                eventoUbicacion: evento.ubicacion,
                eventoEstado: evento.estado,
            };
            setResultadoVerificacion({
                clave: claveVerificacion,
                inscripcion: nuevaInscripcion,
                error: '',
            });
            setInscripcionRealizada(true);
            return true;
        } catch (err: unknown) {
            console.error('No se pudo realizar la inscripción al evento:', err);
            setError(mensajeDeError(err));
            return false;
        } finally {
            setInscribiendo(false);
        }
    };

    const cancelarInscripcionActiva = async (): Promise<boolean> => {
        if (!inscripcionActiva || cancelando) return false;
        setCancelando(true);
        setErrorCancelacion('');
        try {
            await cancelarInscripcion(inscripcionActiva.id);
            setResultadoVerificacion({
                clave: claveVerificacion,
                inscripcion: null,
                error: '',
            });
            setInscripcionRealizada(false);
            return true;
        } catch (err: unknown) {
            console.error('No se pudo cancelar la inscripción al evento:', err);
            setErrorCancelacion(mensajeDeError(err));
            return false;
        } finally {
            setCancelando(false);
        }
    };

    return {
        verificando,
        yaInscrito,
        inscripcionActiva,
        errorVerificacion,
        reintentarVerificacion,
        inscribiendo,
        error,
        inscripcionRealizada,
        cancelarInscripcionActiva,
        cancelando,
        errorCancelacion,
        inscribir,
    };
}
