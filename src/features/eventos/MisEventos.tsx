import { useEffect, useState } from 'react';
import { CalendarDays, CalendarPlus, CircleX, FileDown, MapPin, Pencil, Plus, Tag, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { Evento } from '../../types/evento';
import { IconoAviso } from '../../components/ui/IconoAviso';
import { ModalAccesible } from '../../components/ui/ModalAccesible';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { esAdministrador, obtenerSesion } from '../sesion/sesion';
import { mensajeDeError } from '../../api/mensajeDeError';
import { guardarArchivo } from '../../api/descargas';
import { cancelarEvento, descargarReporteEvento, listarEventos } from './services/eventoService';
import '../../styles/events.css';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const estaCancelado = (evento: Evento) => evento.estado.toUpperCase() === 'CANCELADO';

// El organizador ve sus eventos publicados; el administrador ve todos (puede editar cualquiera)
export function MisEventos() {
    const location = useLocation();
    const mensajeNavegacion = (location.state as { mensaje?: string } | null)?.mensaje ?? '';
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState(mensajeNavegacion);
    const [aCancelar, setACancelar] = useState<Evento | null>(null);
    const [cancelando, setCancelando] = useState(false);
    const [errorCancelar, setErrorCancelar] = useState('');
    const [descargandoId, setDescargandoId] = useState<number | null>(null);
    const [errorReporte, setErrorReporte] = useState('');

    useEffect(() => {
        // Evita actualizar el estado si la respuesta llega después de desmontar la pantalla.
        let vigente = true;
        const sesion = obtenerSesion();
        listarEventos()
            .then((datos) => {
                if (!vigente) return;
                setEventos(esAdministrador(sesion) ? datos : datos.filter((e) => e.organizadorId === sesion?.usuarioId));
            })
            .catch((err: unknown) => {
                console.error('No se pudo cargar el listado de eventos:', err);
                if (vigente) setError('No se pudieron cargar los eventos. Intenta de nuevo más tarde.');
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });
        return () => {
            vigente = false;
        };
    }, []);

    const cerrarModalCancelar = () => {
        if (cancelando) return;
        setACancelar(null);
        setErrorCancelar('');
    };

    const confirmarCancelacion = async () => {
        if (!aCancelar || cancelando) return;
        setCancelando(true);
        setErrorCancelar('');
        try {
            const respuesta = await cancelarEvento(aCancelar.id);
            // GET /eventos solo trae publicados: el cancelado sale de la lista sin recargar
            setEventos((previos) => previos.filter((e) => e.id !== aCancelar.id));
            setMensajeExito(respuesta.mensaje || `El evento «${aCancelar.titulo}» fue cancelado.`);
            setACancelar(null);
        } catch (err: unknown) {
            console.error('No se pudo cancelar el evento:', err);
            setErrorCancelar(mensajeDeError(err));
        } finally {
            setCancelando(false);
        }
    };

    // Un reporte a la vez: los demás botones quedan deshabilitados mientras el backend genera el PDF
    const descargarReporte = async (evento: Evento) => {
        if (descargandoId !== null) return;
        setDescargandoId(evento.id);
        setErrorReporte('');
        try {
            const pdf = await descargarReporteEvento(evento.id);
            guardarArchivo(pdf, `reporte-evento-${evento.id}.pdf`);
        } catch (err: unknown) {
            console.error('No se pudo descargar el reporte:', err);
            setErrorReporte(mensajeDeError(err));
        } finally {
            setDescargandoId(null);
        }
    };

    return (
        <main className="evento-page evento-page--list">
            <header className="evento-list-header">
                <div>
                    <h1 className="evento-page-title evento-page-title--list">Mis eventos</h1>
                    <p className="workflow-description">Eventos publicados que puedes gestionar.</p>
                </div>
                <Link to="/organizador/eventos/nuevo" className="workflow-button workflow-button--primary gap-1.5">
                    <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Crear evento
                </Link>
            </header>

            {mensajeExito && (
                <p role="status" className="evento-list-message evento-list-message--success flex items-start gap-2">
                    <IconoAviso tipo="exito" className="mt-0.5 h-4 w-4" />
                    <span>{mensajeExito}</span>
                </p>
            )}
            {error && (
                <p role="alert" className="evento-list-message flex items-start gap-2">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{error}</span>
                </p>
            )}
            {errorReporte && (
                <p role="alert" className="evento-list-message flex items-start gap-2">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{errorReporte}</span>
                </p>
            )}
            {cargando && (
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
            {!cargando && !error && eventos.length === 0 && (
                <p className="evento-list-state">
                    <CalendarPlus className="mr-2 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
                    Aún no tienes eventos publicados.
                </p>
            )}

            {eventos.length > 0 && (
                <ul className="evento-list">
                    {eventos.map((evento) => (
                        <li
                            key={evento.id}
                            className="evento-card"
                        >
                            <div className="evento-card-content">
                                <div className="evento-card-titleline">
                                    <h2 className="evento-card-title">{evento.titulo}</h2>
                                    <span
                                        className={`evento-card-status ${
                                            estaCancelado(evento)
                                                ? 'evento-card-status--cancelled'
                                                : 'evento-card-status--published'
                                        }`}
                                    >
                                        {estaCancelado(evento) ? 'Cancelado' : 'Publicado'}
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
                                    <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    Cupos: {evento.cuposDisponibles} disponibles de {evento.cuposMaximos}
                                </span>
                            </div>
                            <div className="evento-card-actions">
                                <Link
                                    to={`/organizador/eventos/${evento.id}/editar`}
                                    className="evento-row-button gap-1.5"
                                    aria-label={`Editar evento ${evento.titulo}`}
                                >
                                    <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    Editar
                                </Link>
                                {!estaCancelado(evento) && (
                                    <button
                                        type="button"
                                        className="evento-row-button gap-1.5"
                                        aria-label={`Descargar reporte de inscritos de ${evento.titulo}`}
                                        aria-busy={descargandoId === evento.id}
                                        disabled={descargandoId !== null}
                                        onClick={() => descargarReporte(evento)}
                                    >
                                        <FileDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {descargandoId === evento.id ? 'Generando…' : 'Reporte PDF'}
                                    </button>
                                )}
                                {!estaCancelado(evento) && (
                                    <button
                                        type="button"
                                        className="evento-row-button evento-row-button--danger gap-1.5"
                                        aria-label={`Cancelar evento ${evento.titulo}`}
                                        onClick={() => {
                                            setMensajeExito('');
                                            setErrorCancelar('');
                                            setACancelar(evento);
                                        }}
                                    >
                                        <CircleX className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {aCancelar && (
                <ModalAccesible
                    titulo="¿Cancelar evento?"
                    idTitulo="titulo-cancelar-evento"
                    onCerrar={cerrarModalCancelar}
                    icono={
                        <span className="evento-dialog-icon">
                            !
                        </span>
                    }
                >
                    <h3 className="evento-dialog-title">{aCancelar.titulo}</h3>
                    <p className="evento-dialog-copy">
                        Se notificará por correo a los {aCancelar.cuposMaximos - aCancelar.cuposDisponibles} usuarios inscritos, sus inscripciones
                        pasaran a ser canceladas y ya no se podrán realizar nuevas inscripciones. Esta acciónn no elimina el registro histórico del evento.
                    </p>
                    {errorCancelar && (
                        <p role="alert" className="workflow-inline-error evento-dialog-error flex items-start gap-2">
                            <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                            {errorCancelar}
                        </p>
                    )}
                    <div className="workflow-dialog-actions">
                        <button type="button" className="workflow-button workflow-button--secondary" onClick={cerrarModalCancelar} disabled={cancelando}>
                            Volver
                        </button>
                        <button
                            type="button"
                            className="workflow-button workflow-button--primary"
                            onClick={confirmarCancelacion}
                            disabled={cancelando}
                        >
                            {cancelando ? 'Cancelando…' : 'Cancelar evento'}
                        </button>
                    </div>
                </ModalAccesible>
            )}
        </main>
    );
}
