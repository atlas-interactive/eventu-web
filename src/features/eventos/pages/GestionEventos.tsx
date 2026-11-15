import { useState } from 'react';
import { CalendarPlus, CircleX, Pencil, Plus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { IconoAviso } from '../../../components/ui/IconoAviso';
import { Skeleton, SkeletonEstado } from '../../../components/ui/Skeleton';
import { FiltrosEventos } from '../components/FiltrosEventos';
import { ordenarEventos, type OrdenEventos } from '../eventoOrdenamiento';
import { TarjetaEvento } from '../components/TarjetaEvento';
import { ConfirmarCancelacionEvento } from '../components/ConfirmarCancelacionEvento';
import { eventoYaIniciado } from '../estadoTemporalEvento';
import { useGestionEventos } from '../../../hooks/eventos/useGestionEventos';
import { useAhoraBogota } from '../../../hooks/eventos/useAhoraBogota';
import '../../../styles/events.css';

export function GestionEventos() {
    const { t } = useTranslation();
    const ahora = useAhoraBogota();
    const location = useLocation();
    const mensajeNavegacion = (location.state as { mensaje?: string } | null)?.mensaje ?? '';
    const gestion = useGestionEventos(mensajeNavegacion);
    const [orden, setOrden] = useState<OrdenEventos>('fecha-proxima');
    const eventosOrdenados = ordenarEventos(gestion.eventos, orden);

    return (
        <main className="evento-page evento-page--list">
            <header className="evento-list-header">
                <div>
                    <h1 className="evento-page-title evento-page-title--list">
                        {gestion.administrador ? t('gestion.todos') : t('gestion.misEventos')}
                    </h1>
                    <p className="workflow-description">{t('gestion.descripcion')}</p>
                </div>
                <Link to="/organizador/eventos/nuevo" className="workflow-button workflow-button--primary gap-1.5">
                    <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {t('gestion.crear')}
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
            {gestion.errorCategorias && (
                <p role="alert" className="evento-list-message">
                    {gestion.errorCategorias}
                </p>
            )}
            <FiltrosEventos
                categorias={gestion.categorias}
                cantidadEventos={eventosOrdenados.length}
                filtros={gestion.filtros}
                mostrarResumen={!gestion.cargando && !gestion.error && !gestion.rangoFechasInvalido}
                onChange={gestion.setFiltros}
                onOrdenChange={setOrden}
                mostrarEstado
                orden={orden}
            />
            {gestion.cargando && (
                <SkeletonEstado etiqueta={t('gestion.cargando')}>
                    <ul className="eventos-grid">
                        {Array.from({ length: 3 }, (_, indice) => (
                            <li key={indice} className="evento-card">
                                <div className="evento-card-content w-full">
                                    <Skeleton className="h-6 w-2/3" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="evento-card-actions">
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
                        ? t('gestion.sinResultados')
                        : t('gestion.vacio')}
                </p>
            )}

            {!gestion.cargando && !gestion.error && !gestion.rangoFechasInvalido && eventosOrdenados.length > 0 && (
                <ul className="eventos-grid">
                    {eventosOrdenados.map((evento) => (
                        <TarjetaEvento
                            key={evento.id}
                            evento={evento}
                        >
                            <Link
                                to={`/organizador/eventos/${evento.id}/inscritos`}
                                className="evento-row-button"
                                aria-label={t('gestion.verInscritosAria', { titulo: evento.titulo })}
                            >
                                <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                                {t('gestion.inscritos')}
                            </Link>
                            {evento.estado.toUpperCase() !== 'CANCELADO' &&
                                !(evento.estado.toUpperCase() === 'PUBLICADO' &&
                                    eventoYaIniciado(evento.fechaInicio, ahora)) && (
                                <>
                                    <Link
                                        to={`/organizador/eventos/${evento.id}/editar`}
                                        className="evento-row-button"
                                        aria-label={t('gestion.editarAria', { titulo: evento.titulo })}
                                    >
                                        <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {t('gestion.editar')}
                                    </Link>
                                    <button
                                        type="button"
                                        className="evento-row-button evento-row-button--danger"
                                        aria-label={t('gestion.cancelarAria', { titulo: evento.titulo })}
                                        onClick={() => gestion.solicitarCancelacion(evento)}
                                    >
                                        <CircleX className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {t('gestion.cancelar')}
                                    </button>
                                </>
                            )}
                        </TarjetaEvento>
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
