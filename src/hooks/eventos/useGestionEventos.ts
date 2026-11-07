import { useEffect, useState } from 'react';
import type { Evento, FiltrosEvento } from '../../types/evento';
import type { Categoria } from '../../types/categoria';
import { mensajeDeError } from '../../api/mensajeDeError';
import { esAdministrador, obtenerSesion } from '../../features/sesion/sesion';
import {
    cancelarEvento,
    listarEventos,
    listarMisEventos,
} from '../../features/eventos/services/eventoService';
import { listarCategorias } from '../../features/categorias/services/categoriaService';

const fechasInvalidas = (filtros: FiltrosEvento) =>
    Boolean(filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta);

export function useGestionEventos(mensajeInicial = '') {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [errorCategorias, setErrorCategorias] = useState('');
    const [filtros, setFiltros] = useState<FiltrosEvento>({ estado: 'PUBLICADO' });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState(mensajeInicial);
    const [aCancelar, setACancelar] = useState<Evento | null>(null);
    const [cancelando, setCancelando] = useState(false);
    const [errorCancelar, setErrorCancelar] = useState('');
    const administrador = esAdministrador(obtenerSesion());
    const rangoFechasInvalido = fechasInvalidas(filtros);
    const eventosVisibles = filtros.estado && filtros.estado !== 'TODOS'
        ? eventos.filter((evento) => evento.estado.toUpperCase() === filtros.estado)
        : eventos;

    useEffect(() => {
        let vigente = true;
        listarCategorias(true)
            .then((datos) => {
                if (vigente) setCategorias(datos);
            })
            .catch((err: unknown) => {
                console.error('No se pudieron cargar las categorías de eventos:', err);
                if (vigente) setErrorCategorias('No se pudieron cargar las categorías.');
            });
        return () => {
            vigente = false;
        };
    }, []);

    useEffect(() => {
        let vigente = true;
        if (rangoFechasInvalido) {
            setCargando(false);
            return () => {
                vigente = false;
            };
        }

        setCargando(true);
        setError('');
        const espera = filtros.texto?.trim() ? 300 : 0;
        const { estado: _estado, ...filtrosConsulta } = filtros;
        const temporizador = window.setTimeout(() => {
            (administrador ? listarEventos(filtrosConsulta) : listarMisEventos(filtrosConsulta))
                .then((datos) => {
                    if (!vigente) return;
                    setEventos(datos);
                })
                .catch((err: unknown) => {
                    console.error('No se pudo cargar el listado de eventos:', err);
                    if (vigente) setError('No se pudieron cargar los eventos. Intenta de nuevo más tarde.');
                })
                .finally(() => {
                    if (vigente) setCargando(false);
                });
        }, espera);

        return () => {
            vigente = false;
            window.clearTimeout(temporizador);
        };
    }, [
        administrador,
        filtros.categoriaId,
        filtros.fechaDesde,
        filtros.fechaHasta,
        filtros.texto,
        rangoFechasInvalido,
    ]);

    const solicitarCancelacion = (evento: Evento) => {
        setMensajeExito('');
        setErrorCancelar('');
        setACancelar(evento);
    };

    const cerrarModalCancelar = () => {
        if (cancelando) return;
        setACancelar(null);
        setErrorCancelar('');
    };

    const confirmarCancelacion = async () => {
        const eventoACancelar = aCancelar;
        if (!eventoACancelar || cancelando) return;
        setCancelando(true);
        setErrorCancelar('');
        try {
            const respuesta = await cancelarEvento(eventoACancelar.id);
            // Actualiza la lista local sin volver a consultar el endpoint.
            setEventos((previos) => previos.filter((evento) => evento.id !== eventoACancelar.id));
            setMensajeExito(respuesta.mensaje || `El evento «${eventoACancelar.titulo}» fue cancelado.`);
            setACancelar(null);
        } catch (err: unknown) {
            console.error('No se pudo cancelar el evento:', err);
            setErrorCancelar(mensajeDeError(err));
        } finally {
            setCancelando(false);
        }
    };

    return {
        eventos: eventosVisibles,
        categorias,
        errorCategorias,
        filtros,
        setFiltros,
        cargando,
        error,
        mensajeExito,
        aCancelar,
        cancelando,
        errorCancelar,
        administrador,
        rangoFechasInvalido,
        solicitarCancelacion,
        cerrarModalCancelar,
        confirmarCancelacion,
    };
}
