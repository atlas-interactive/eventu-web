import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { mensajeDeError } from '../../api/mensajeDeError';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import type { Evento } from '../../types/evento';
import { obtenerEvento } from './services/eventoService';
import '../../styles/event-detail.css';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' });
const formatoHora = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' });

const estaCancelado = (evento: Evento) => evento.estado.toUpperCase() === 'CANCELADO';

export function DetalleEvento() {
    const { id } = useParams();
    const idEvento = Number(id);
    const [evento, setEvento] = useState<Evento | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [noEncontrado, setNoEncontrado] = useState(false);

    useEffect(() => {
        let vigente = true;
        setEvento(null);
        setError('');
        setNoEncontrado(false);

        if (!Number.isSafeInteger(idEvento) || idEvento <= 0) {
            setNoEncontrado(true);
            setCargando(false);
            return () => {
                vigente = false;
            };
        }

        setCargando(true);
        obtenerEvento(idEvento)
            .then((datos) => {
                if (vigente) setEvento(datos);
            })
            .catch((err: unknown) => {
                console.error('No se pudo cargar el detalle del evento:', err);
                if (!vigente) return;
                if (isAxiosError(err) && err.response?.status === 404) {
                    setNoEncontrado(true);
                } else {
                    setError(mensajeDeError(err));
                }
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });

        return () => {
            vigente = false;
        };
    }, [idEvento]);

    if (cargando) {
        return (
            <main className="detalle-evento-page">
                <SkeletonEstado etiqueta="Cargando detalle del evento" className="detalle-evento-skeleton">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-6 h-5 w-24" />
                    <Skeleton className="mt-3 h-8 w-2/3" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-3/4" />
                </SkeletonEstado>
            </main>
        );
    }

    if (noEncontrado || error || !evento) {
        return (
            <main className="detalle-evento-page">
                <Link to="/eventos" className="detalle-evento-volver">
                    ← Volver a eventos
                </Link>
                <p role="alert" className="detalle-evento-error">
                    {noEncontrado ? 'No se encontró el evento solicitado.' : error || 'No se pudo cargar el evento.'}
                </p>
            </main>
        );
    }

    const cancelado = estaCancelado(evento);
    const agotado = evento.cuposDisponibles <= 0;
    const inscritos = Math.min(evento.cuposMaximos, Math.max(0, evento.cuposMaximos - evento.cuposDisponibles));
    const porcentajeOcupado =
        evento.cuposMaximos > 0 ? Math.min(100, (inscritos / evento.cuposMaximos) * 100) : 0;
    const fechaInicio = new Date(evento.fechaInicio);
    const estadoVisible = cancelado ? 'Evento cancelado' : agotado ? 'Cupos agotados' : '';

    return (
        <main className="detalle-evento-page">
            <Link to="/eventos" className="detalle-evento-volver">
                ← Volver a eventos
            </Link>
            <div className="detalle-evento-layout">
                <article className="detalle-evento-contenido">
                    <div className="detalle-evento-etiquetas">
                        <span className="detalle-evento-categoria">{evento.categoriaNombre}</span>
                        {estadoVisible && (
                            <span
                                className={`detalle-evento-estado ${
                                    cancelado ? 'detalle-evento-estado--cancelado' : 'detalle-evento-estado--agotado'
                                }`}
                            >
                                {estadoVisible}
                            </span>
                        )}
                    </div>
                    <h1 className="detalle-evento-titulo">{evento.titulo}</h1>
                    <p className="detalle-evento-descripcion">{evento.descripcion}</p>

                    <div className="detalle-evento-informacion">
                        <p>
                            <CalendarDays aria-hidden="true" />
                            <time dateTime={evento.fechaInicio}>{formatoFecha.format(fechaInicio)}</time>
                        </p>
                        <p>
                            <Clock3 aria-hidden="true" />
                            {formatoHora.format(fechaInicio)}
                        </p>
                        <p>
                            <MapPin aria-hidden="true" />
                            {evento.ubicacion}
                        </p>
                        <p>
                            <Users aria-hidden="true" />
                            {inscritos} inscritos de {evento.cuposMaximos} cupos
                        </p>
                    </div>

                    <div
                        className="detalle-evento-cupos"
                        role="meter"
                        aria-label="Cupos ocupados"
                        aria-valuemin={0}
                        aria-valuemax={evento.cuposMaximos}
                        aria-valuenow={inscritos}
                    >
                        <span style={{ width: `${porcentajeOcupado}%` }} />
                    </div>
                    <p className="detalle-evento-cupos-texto">
                        {evento.cuposDisponibles > 0 ? `${evento.cuposDisponibles} cupos disponibles` : '0 cupos disponibles'}
                    </p>

                    <div className="detalle-evento-organiza">
                        <span>Organiza</span>
                        <p>{evento.organizadorNombre}</p>
                    </div>
                </article>

                <aside className="detalle-evento-panel" aria-label="Inscripción y categoría">
                    {cancelado ? (
                        <p className="detalle-evento-panel-estado">Evento cancelado</p>
                    ) : agotado ? (
                        <p className="detalle-evento-panel-estado">Cupos agotados</p>
                    ) : (
                        <button
                            type="button"
                            className="detalle-evento-inscripcion"
                            disabled
                            aria-label="Inscribirme al evento; inscripción no disponible"
                        >
                            Inscribirme al evento
                        </button>
                    )}
                    <div className="detalle-evento-panel-categoria">
                        <span>Categoría</span>
                        <span className="detalle-evento-categoria">{evento.categoriaNombre}</span>
                    </div>
                </aside>
            </div>
        </main>
    );
}
