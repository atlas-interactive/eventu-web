import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SkeletonEstado } from '../../../components/ui/Skeleton';
import { FiltrosEventos } from '../components/FiltrosEventos';
import { ordenarEventos, type OrdenEventos } from '../components/ResumenEventos';
import { TarjetaEvento } from '../components/TarjetaEvento';
import { useCatalogoEventos } from '../../../hooks/eventos/useCatalogoEventos';
import '../../../styles/event-catalog.css';

export function CatalogoEventos() {
    const catalogo = useCatalogoEventos();
    const [orden, setOrden] = useState<OrdenEventos>('fecha-proxima');
    const eventosOrdenados = ordenarEventos(catalogo.eventos, orden);

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
                cantidadEventos={eventosOrdenados.length}
                filtros={catalogo.filtros}
                mostrarResumen={
                    !catalogo.cargando && !catalogo.errorEventos && !catalogo.rangoFechasInvalido
                }
                onChange={catalogo.setFiltros}
                onOrdenChange={setOrden}
                orden={orden}
            />
            {catalogo.errorEventos && (
                <p className="catalogo-evento-error" role="alert">
                    {catalogo.errorEventos}
                </p>
            )}
            {catalogo.cargando && (
                <SkeletonEstado etiqueta="Cargando eventos">
                    <ul className="eventos-grid">
                        {Array.from({ length: 3 }, (_, indice) => (
                            <li key={indice} className="evento-card" aria-hidden="true">
                                <div className="evento-card-content">
                                    <span className="h-4 w-20 animate-pulse rounded bg-eventu-border" />
                                    <span className="h-5 w-3/4 animate-pulse rounded bg-eventu-border" />
                                    <span className="h-4 w-full animate-pulse rounded bg-eventu-border" />
                                </div>
                            </li>
                        ))}
                    </ul>
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
                eventosOrdenados.length > 0 && (
                    <ul className="eventos-grid">
                        {eventosOrdenados.map((evento) => (
                            <TarjetaEvento key={evento.id} evento={evento}>
                                <Link
                                    to={`/eventos/${evento.id}`}
                                    className="evento-catalogo-row-button"
                                    aria-label={`Ver detalle de ${evento.titulo}`}
                                >
                                    Ver detalle
                                </Link>
                            </TarjetaEvento>
                        ))}
                    </ul>
                )}
        </main>
    );
}
