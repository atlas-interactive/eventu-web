import { CalendarPlus, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { IconoAviso } from '../../../components/ui/IconoAviso';
import { Skeleton, SkeletonEstado } from '../../../components/ui/Skeleton';
import { FiltrosEventos } from '../components/FiltrosEventos';
import { TarjetaEvento } from '../components/TarjetaEvento';
import { ConfirmarCancelacionEvento } from '../components/ConfirmarCancelacionEvento';
import { useGestionEventos } from '../../../hooks/eventos/useGestionEventos';
import '../../../styles/events.css';

export function GestionEventos() {
    const location = useLocation();
    const mensajeNavegacion = (location.state as { mensaje?: string } | null)?.mensaje ?? '';
    const gestion = useGestionEventos(mensajeNavegacion);

    return (
        <main className="evento-page evento-page--list">
            <header className="evento-list-header">
                <div>
                    <h1 className="evento-page-title evento-page-title--list">
                        {gestion.administrador ? 'Todos los eventos' : 'Mis eventos'}
                    </h1>
                    <p className="workflow-description">Eventos publicados que puedes gestionar.</p>
                </div>
                <Link to="/organizador/eventos/nuevo" className="workflow-button workflow-button--primary gap-1.5">
                    <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Crear evento
                </Link>
            </header>

            {gestion.mensajeExito && (
                <p role="status" className="evento-list-message evento-list-message--success flex items-start gap-2">
                    <IconoAviso tipo="exito" className="mt-0.5 h-4 w-4" />
                    <span>{gestion.mensajeExito}</span>
                </p>
            )}
            {gestion.error && (
                <p role="alert" className="evento-list-message flex items-start gap-2">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{gestion.error}</span>
                </p>
            )}
            {gestion.errorReporte && (
                <p role="alert" className="evento-list-message flex items-start gap-2">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{gestion.errorReporte}</span>
                </p>
            )}
            {gestion.errorCategorias && (
                <p role="alert" className="evento-list-message">
                    {gestion.errorCategorias}
                </p>
            )}
            <FiltrosEventos
                categorias={gestion.categorias}
                filtros={gestion.filtros}
                onChange={gestion.setFiltros}
                mostrarEstado
            />
            {gestion.cargando && (
                <SkeletonEstado etiqueta="Cargando eventos">
                    <ul className="evento-list">
                        {Array.from({ length: 3 }, (_, indice) => (
                            <li key={indice} className="evento-card">
                                <div className="evento-card-content w-full space-y-2">
                                    <Skeleton className="h-6 w-2/3" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="evento-card-actions sm:flex-row">
                                    <Skeleton className="h-11 w-full rounded-md sm:w-24" />
                                    <Skeleton className="h-11 w-full rounded-md sm:w-24" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </SkeletonEstado>
            )}
            {!gestion.cargando && !gestion.error && !gestion.rangoFechasInvalido && gestion.eventos.length === 0 && (
                <p className="evento-list-state">
                    <CalendarPlus className="mr-2 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
                    {gestion.filtros.texto ||
                    gestion.filtros.categoriaId ||
                    gestion.filtros.fechaDesde ||
                    gestion.filtros.fechaHasta ||
                    (gestion.filtros.estado && gestion.filtros.estado !== 'PUBLICADO')
                        ? 'No se encontraron eventos con esos filtros.'
                        : 'Aún no tienes eventos publicados.'}
                </p>
            )}

            {!gestion.cargando && !gestion.error && !gestion.rangoFechasInvalido && gestion.eventos.length > 0 && (
                <ul className="evento-list">
                    {gestion.eventos.map((evento) => (
                        <TarjetaEvento
                            key={evento.id}
                            evento={evento}
                            descargando={gestion.descargandoId === evento.id}
                            reporteDeshabilitado={gestion.descargandoId !== null}
                            onDescargarReporte={gestion.descargarReporte}
                            onSolicitarCancelacion={gestion.solicitarCancelacion}
                        />
                    ))}
                </ul>
            )}

            {gestion.aCancelar && (
                <ConfirmarCancelacionEvento
                    evento={gestion.aCancelar}
                    cancelando={gestion.cancelando}
                    error={gestion.errorCancelar}
                    onCerrar={gestion.cerrarModalCancelar}
                    onConfirmar={gestion.confirmarCancelacion}
                />
            )}
        </main>
    );
}
