import { useEffect, useState } from 'react';
import { listarCategorias } from '../categorias/services/categoriaService';
import { mensajeDeError } from '../../api/mensajeDeError';
import { SkeletonEstado } from '../../components/ui/Skeleton';
import { FiltrosEventos } from '../eventos/components/FiltrosEventos';
import { listarEventos } from '../eventos/services/eventoService';
import type { Categoria } from '../../types/categoria';
import type { Evento, FiltrosEvento } from '../../types/evento';
import '../../styles/event-catalog.css';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const categoriaEstilo = (nombre: string): string => {
    const normalizado = nombre.toLocaleLowerCase('es-CO');
    if (normalizado.includes('cultur')) return 'catalogo-evento-categoria--cultural';
    if (normalizado.includes('deport')) return 'catalogo-evento-categoria--deportivo';
    return '';
};

const cuposOcupadosPorcentaje = (evento: Evento): number => {
    if (evento.cuposMaximos <= 0) return 0;
    return Math.max(
        0,
        Math.min(100, ((evento.cuposMaximos - evento.cuposDisponibles) / evento.cuposMaximos) * 100),
    );
};

const fechasInvalidas = (filtros: FiltrosEvento) =>
    Boolean(filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta);

export function InicioUsuario() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [filtros, setFiltros] = useState<FiltrosEvento>({});
    const [cargando, setCargando] = useState(true);
    const [errorEventos, setErrorEventos] = useState('');
    const [errorCategorias, setErrorCategorias] = useState('');

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
        if (fechasInvalidas(filtros)) {
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
    }, [filtros.categoriaId, filtros.fechaDesde, filtros.fechaHasta, filtros.texto]);

    const hayFiltrosActivos = Boolean(
        filtros.texto?.trim() || filtros.categoriaId || filtros.fechaDesde || filtros.fechaHasta,
    );

    return (
        <main className="catalogo-eventos">
            <header className="catalogo-eventos-header">
                <h1 className="catalogo-eventos-titulo">Eventos en campus</h1>
            </header>

            {errorCategorias && <p className="catalogo-evento-error" role="alert">{errorCategorias}</p>}
            <FiltrosEventos categorias={categorias} filtros={filtros} onChange={setFiltros} />
            {errorEventos && <p className="catalogo-evento-error" role="alert">{errorEventos}</p>}
            {cargando && (
                <SkeletonEstado etiqueta="Cargando eventos">
                    <div className="catalogo-eventos-grid">
                        {Array.from({ length: 3 }, (_, indice) => (
                            <div key={indice} className="catalogo-evento" aria-hidden="true">
                                <span className="h-4 w-20 animate-pulse rounded bg-eventu-border" />
                                <span className="h-5 w-3/4 animate-pulse rounded bg-eventu-border" />
                                <span className="h-4 w-full animate-pulse rounded bg-eventu-border" />
                            </div>
                        ))}
                    </div>
                </SkeletonEstado>
            )}
            {!cargando && !errorEventos && !fechasInvalidas(filtros) && eventos.length === 0 && (
                <p className="catalogo-evento-mensaje">
                    {hayFiltrosActivos ? 'No se encontraron eventos con esos filtros.' : 'No hay eventos disponibles por ahora.'}
                </p>
            )}
            {!cargando && !errorEventos && !fechasInvalidas(filtros) && eventos.length > 0 && (
                <ul className="catalogo-eventos-grid">
                    {eventos.map((evento) => (
                        <li key={evento.id} className="catalogo-evento">
                            <span className={`catalogo-evento-categoria ${categoriaEstilo(evento.categoriaNombre)}`}>
                                {evento.categoriaNombre}
                            </span>
                            <h2 className="catalogo-evento-titulo">{evento.titulo}</h2>
                            <div className="catalogo-evento-detalles">
                                <time dateTime={evento.fechaInicio}>
                                    {formatoFecha.format(new Date(evento.fechaInicio))}
                                </time>
                                <span>{evento.ubicacion}</span>
                            </div>
                            <div
                                className="catalogo-evento-cupos"
                                role="meter"
                                aria-label="Cupos ocupados"
                                aria-valuemin={0}
                                aria-valuemax={evento.cuposMaximos}
                                aria-valuenow={evento.cuposMaximos - evento.cuposDisponibles}
                            >
                                <div
                                    className="catalogo-evento-cupos-ocupados"
                                    style={{ width: `${cuposOcupadosPorcentaje(evento)}%` }}
                                />
                            </div>
                            <p className="catalogo-evento-detalles">
                                {evento.cuposDisponibles} cupos disponibles de {evento.cuposMaximos}
                            </p>
                            <button
                                type="button"
                                className="catalogo-evento-detalle"
                                disabled
                                title="La consulta de detalles estará disponible próximamente."
                            >
                                Ver detalle
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
