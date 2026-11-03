import { Armchair, CalendarDays, CircleX, FileDown, MapPin, Pencil, Tag, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Evento } from '../../../types/evento';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

interface TarjetaEventoProps {
    evento: Evento;
    descargando: boolean;
    reporteDeshabilitado: boolean;
    onDescargarReporte: (evento: Evento) => void;
    onSolicitarCancelacion: (evento: Evento) => void;
}

export function TarjetaEvento({
    evento,
    descargando,
    reporteDeshabilitado,
    onDescargarReporte,
    onSolicitarCancelacion,
}: TarjetaEventoProps) {
    const estaCancelado = evento.estado.toUpperCase() === 'CANCELADO';

    return (
        <li className="evento-card">
            <div className="evento-card-content">
                <div className="evento-card-titleline">
                    <h2 className="evento-card-title">{evento.titulo}</h2>
                    <span
                        className={`evento-card-status ${
                            estaCancelado
                                ? 'evento-card-status--cancelled'
                                : 'evento-card-status--published'
                        }`}
                    >
                        {estaCancelado ? 'Cancelado' : 'Publicado'}
                    </span>
                </div>
                <div className="evento-card-metadata">
                    <span className="evento-card-meta">
                        <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {formatoFecha.format(new Date(evento.fechaInicio))}
                    </span>
                    <span className="evento-card-meta">
                        <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {evento.ubicacion}
                    </span>
                    {evento.categoriaNombre && (
                        <span className="evento-card-meta">
                            <Tag className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {evento.categoriaNombre}
                        </span>
                    )}
                </div>
                <span className="evento-card-meta evento-card-capacity">
                    <Armchair className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Cupos: {evento.cuposDisponibles} disponibles de {evento.cuposMaximos}
                </span>
                <Link
                    to={`/organizador/eventos/${evento.id}/inscritos`}
                    className="evento-card-meta evento-card-participants"
                    aria-label={`Ver inscritos y asistencias de ${evento.titulo}`}
                >
                    <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Ver inscritos y asistencias
                </Link>
            </div>
            <div className="evento-card-actions">
                {!estaCancelado && (
                    <button
                        type="button"
                        className="evento-row-button gap-1.5"
                        aria-label={`Descargar reporte de inscritos de ${evento.titulo}`}
                        aria-busy={descargando}
                        disabled={reporteDeshabilitado}
                        onClick={() => onDescargarReporte(evento)}
                    >
                        <FileDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {descargando ? 'Generando…' : 'Reporte PDF'}
                    </button>
                )}
                {!estaCancelado && (
                    <button
                        type="button"
                        className="evento-row-button evento-row-button--danger gap-1.5"
                        aria-label={`Cancelar evento ${evento.titulo}`}
                        onClick={() => onSolicitarCancelacion(evento)}
                    >
                        <CircleX className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Cancelar
                    </button>
                )}
                {!estaCancelado && (
                    <Link
                        to={`/organizador/eventos/${evento.id}/editar`}
                        className="evento-row-button gap-1.5"
                        aria-label={`Editar evento ${evento.titulo}`}
                    >
                        <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Editar
                    </Link>
                )}
            </div>
        </li>
    );
}
