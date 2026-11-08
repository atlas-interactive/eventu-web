import { CalendarDays, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Evento } from '../../../types/evento';
import '../../../styles/event-card.css';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

interface TarjetaEventoProps {
    evento: Evento;
    children?: ReactNode;
}

const porcentajeOcupado = (evento: Evento): number => {
    if (evento.cuposMaximos <= 0) return 0;
    const ocupados = evento.cuposMaximos - evento.cuposDisponibles;
    return Math.max(0, Math.min(100, (ocupados / evento.cuposMaximos) * 100));
};

export function TarjetaEvento({ evento, children }: TarjetaEventoProps) {
    const estaCancelado = evento.estado.toUpperCase() === 'CANCELADO';
    const ocupados = evento.cuposMaximos > 0
        ? Math.max(0, Math.min(evento.cuposMaximos, evento.cuposMaximos - evento.cuposDisponibles))
        : 0;
    const estaLleno = evento.cuposMaximos > 0 && evento.cuposDisponibles <= 0;
    const porcentaje = porcentajeOcupado(evento);

    return (
        <li className="evento-card">
            <div className="evento-card-content">
                <div className="evento-card-heading">
                    {evento.categoriaNombre && (
                        <span className="evento-card-category">
                            {evento.categoriaNombre}
                        </span>
                    )}
                    <span
                        className={`evento-card-status ${
                            estaCancelado ? 'evento-card-status--cancelled' : 'evento-card-status--published'
                        }`}
                    >
                        <span className="evento-card-status-dot" aria-hidden="true" />
                        {estaCancelado ? 'Cancelado' : 'Publicado'}
                    </span>
                </div>

                <h2 className="evento-card-title">{evento.titulo}</h2>

                <div className="evento-card-metadata">
                    <span className="evento-card-meta">
                        <CalendarDays aria-hidden="true" />
                        <time dateTime={evento.fechaInicio}>
                            {formatoFecha.format(new Date(evento.fechaInicio))}
                        </time>
                    </span>
                    <span className="evento-card-meta">
                        <MapPin aria-hidden="true" />
                        {evento.ubicacion}
                    </span>
                </div>

                <div className="evento-card-capacity">
                    <div className="evento-card-capacity-label">
                        <span>Cupos ocupados</span>
                        <strong>
                            {ocupados} / {evento.cuposMaximos}
                            {estaLleno && <span> · Lleno</span>}
                        </strong>
                    </div>
                    <div
                        className="evento-card-capacity-track"
                        role="meter"
                        aria-label={`Cupos ocupados de ${evento.titulo}`}
                        aria-valuemin={0}
                        aria-valuemax={Math.max(1, evento.cuposMaximos)}
                        aria-valuenow={ocupados}
                    >
                        <span
                            className="evento-card-capacity-fill"
                            style={{ width: `${porcentaje}%` }}
                        />
                    </div>
                </div>
            </div>

            {children && <div className="evento-card-actions">{children}</div>}
        </li>
    );
}
