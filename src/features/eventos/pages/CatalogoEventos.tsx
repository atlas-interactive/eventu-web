import { Link } from 'react-router-dom';
import { SkeletonEstado } from '../../../components/ui/Skeleton';
import { FiltrosEventos } from '../components/FiltrosEventos';
import { useCatalogoEventos } from '../hooks/useCatalogoEventos';
import type { Evento } from '../../../types/evento';
import '../../../styles/event-catalog.css';

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

export function CatalogoEventos() {
    const catalogo = useCatalogoEventos();

    return (
        <main className="catalogo-eventos">
            <header className="catalogo-eventos-header">
                <h1 className="catalogo-eventos-titulo">Eventos en campus</h1>
            </header>

            {catalogo.errorCategorias && (
                <p className="catalogo-evento-error" role="alert">
                    {catalogo.errorCategorias}
                </p>
            )}
            <FiltrosEventos
                categorias={catalogo.categorias}
                filtros={catalogo.filtros}
                onChange={catalogo.setFiltros}
            />
            {catalogo.errorEventos && (
                <p className="catalogo-evento-error" role="alert">
                    {catalogo.errorEventos}
                </p>
            )}
            {catalogo.cargando && (
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
            {!catalogo.cargando &&
                !catalogo.errorEventos &&
                !catalogo.rangoFechasInvalido &&
                catalogo.eventos.length === 0 && (
                    <p className="catalogo-evento-mensaje">
                        {catalogo.hayFiltrosActivos
                            ? 'No se encontraron eventos con esos filtros.'
                            : 'No hay eventos disponibles por ahora.'}
                    </p>
                )}
            {!catalogo.cargando &&
                !catalogo.errorEventos &&
                !catalogo.rangoFechasInvalido &&
                catalogo.eventos.length > 0 && (
                    <ul className="catalogo-eventos-grid">
                        {catalogo.eventos.map((evento) => (
                            <li key={evento.id} className="catalogo-evento">
                                <span
                                    className={`catalogo-evento-categoria ${categoriaEstilo(evento.categoriaNombre)}`}
                                >
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
                                <Link
                                    to={`/usuario/eventos/${evento.id}`}
                                    className="catalogo-evento-detalle"
                                    aria-label={`Ver detalle de ${evento.titulo}`}
                                >
                                    Ver detalle
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
        </main>
    );
}
