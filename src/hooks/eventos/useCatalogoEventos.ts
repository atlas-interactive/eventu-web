import { useEffect, useState } from 'react';
import type { Categoria } from '../../types/categoria';
import type { Evento, FiltrosEvento } from '../../types/evento';
import { mensajeDeError } from '../../api/mensajeDeError';
import { listarCategorias } from '../../features/categorias/services/categoriaService';
import { listarEventos } from '../../features/eventos/services/eventoService';

const fechasInvalidas = (filtros: FiltrosEvento) =>
    Boolean(filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta);

export function useCatalogoEventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [filtros, setFiltros] = useState<FiltrosEvento>({});
    const [cargando, setCargando] = useState(true);
    const [errorEventos, setErrorEventos] = useState('');
    const [errorCategorias, setErrorCategorias] = useState('');
    const rangoFechasInvalido = fechasInvalidas(filtros);
    const hayFiltrosActivos = Boolean(
        filtros.texto?.trim() || filtros.categoriaId || filtros.fechaDesde || filtros.fechaHasta,
    );

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
        setErrorEventos('');
        const espera = filtros.texto?.trim() ? 300 : 0;
        const temporizador = window.setTimeout(() => {
            listarEventos(filtros)
                .then((datos) => {
                    if (vigente) setEventos(datos);
                })
                .catch((err: unknown) => {
                    console.error('No se pudo cargar el catálogo de eventos:', err);
                    if (vigente) setErrorEventos(mensajeDeError(err));
                })
                .finally(() => {
                    if (vigente) setCargando(false);
                });
        }, espera);

        return () => {
            vigente = false;
            window.clearTimeout(temporizador);
        };
    }, [filtros.categoriaId, filtros.fechaDesde, filtros.fechaHasta, filtros.texto, rangoFechasInvalido]);

    return {
        eventos,
        categorias,
        filtros,
        setFiltros,
        cargando,
        errorEventos,
        errorCategorias,
        rangoFechasInvalido,
        hayFiltrosActivos,
    };
}
