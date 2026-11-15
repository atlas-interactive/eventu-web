import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mensajeDeError } from '../../api/mensajeDeError';
import type { EstadoInscripcion, Inscripcion } from '../../types/inscripcion';
import {
    cancelarInscripcion,
    listarMisInscripciones,
} from '../../features/inscripciones/services/inscripcionService';
import { listarEventos } from '../../features/eventos/services/eventoService';
import { eventoYaIniciado } from '../../features/eventos/estadoTemporalEvento';

export type FiltroInscripcion = 'TODAS' | EstadoInscripcion;

export function useMisInscripciones() {
    const { t } = useTranslation();
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState<FiltroInscripcion>('TODAS');
    const [aCancelar, setACancelar] = useState<Inscripcion | null>(null);
    const [cancelando, setCancelando] = useState(false);
    const [errorCancelacion, setErrorCancelacion] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        let vigente = true;
        Promise.all([listarMisInscripciones(), listarEventos()])
            .then(([datos, eventos]) => {
                if (!vigente) return;
                const estadosPorEvento = new Map(eventos.map(({ id, estado }) => [id, estado]));
                setInscripciones(
                    datos.map((inscripcion) => {
                        const estadoEvento = estadosPorEvento.get(inscripcion.eventoId) ??
                            inscripcion.eventoEstado ??
                            (inscripcion.estado === 'ACTIVA' &&
                                eventoYaIniciado(inscripcion.eventoFechaInicio)
                                ? 'PUBLICADO'
                                : undefined);

                        return { ...inscripcion, eventoEstado: estadoEvento };
                    }),
                );
            })
            .catch((err: unknown) => {
                console.error('No se pudieron cargar las inscripciones:', err);
                if (vigente) setError(mensajeDeError(err));
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });

        return () => {
            vigente = false;
        };
    }, []);

    const publicadas = inscripciones.filter(
        (inscripcion) => inscripcion.eventoEstado?.trim().toUpperCase() === 'PUBLICADO',
    );
    const conteos = publicadas.reduce(
        (total, inscripcion) => {
            total.TODAS += 1;
            total[inscripcion.estado] += 1;
            return total;
        },
        { TODAS: 0, ACTIVA: 0, CANCELADA: 0 },
    );
    const visibles = filtro === 'TODAS'
        ? publicadas
        : publicadas.filter((inscripcion) => inscripcion.estado === filtro);

    const solicitarCancelacion = (inscripcion: Inscripcion) => {
        setErrorCancelacion('');
        setMensajeExito('');
        if (eventoYaIniciado(inscripcion.eventoFechaInicio)) {
            setErrorCancelacion(t('comun.noCancelarInscripcionIniciada'));
            setACancelar(inscripcion);
            return;
        }
        setACancelar(inscripcion);
    };

    const cerrarConfirmacion = () => {
        if (cancelando) return;
        setACancelar(null);
        setErrorCancelacion('');
    };

    const confirmarCancelacion = async () => {
        const inscripcion = aCancelar;
        if (!inscripcion || cancelando) return;
        if (eventoYaIniciado(inscripcion.eventoFechaInicio)) {
            setErrorCancelacion(t('comun.noCancelarInscripcionIniciada'));
            return;
        }

        setCancelando(true);
        setErrorCancelacion('');
        try {
            const respuesta = await cancelarInscripcion(inscripcion.id);
            setInscripciones((actuales) =>
                actuales.map((actual) =>
                    actual.id === inscripcion.id
                        ? { ...actual, estado: 'CANCELADA' }
                        : actual,
                ),
            );
            setMensajeExito(respuesta.mensaje);
            setACancelar(null);
        } catch (err: unknown) {
            console.error('No se pudo cancelar la inscripción:', err);
            setErrorCancelacion(mensajeDeError(err));
        } finally {
            setCancelando(false);
        }
    };

    return {
        inscripciones: visibles,
        conteos,
        cargando,
        error,
        filtro,
        setFiltro,
        aCancelar,
        cancelando,
        errorCancelacion,
        mensajeExito,
        solicitarCancelacion,
        cerrarConfirmacion,
        confirmarCancelacion,
    };
}
