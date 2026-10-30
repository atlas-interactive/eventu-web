import { useEffect, useState } from 'react';
import { CalendarDays, CalendarPlus, CircleAlert, CircleCheck, CircleX, MapPin, Pencil, Plus, Tag, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { Evento } from '../../types/evento';
import { ModalAccesible } from '../categorias/components/ModalAccesible';
import { esAdministrador, obtenerSesion } from '../sesion/sesion';
import { mensajeDeError } from './mensajeDeError';
import { cancelarEvento, listarEventos } from './services/eventoService';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const botonPrimario =
    'inline-flex items-center gap-1.5 rounded-[0.4375rem] bg-eventu-institutional-red px-4 py-2 text-sm font-medium text-eventu-white-surface hover:bg-eventu-institutional-red-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red disabled:opacity-60';
const botonSecundario =
    'inline-flex rounded-[0.4375rem] border border-eventu-field-border bg-eventu-white-surface px-4 py-2 text-sm font-medium text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red disabled:opacity-60';
const botonFila =
    'inline-flex h-11 items-center justify-center gap-1.5 rounded-[0.4375rem] border border-eventu-field-border bg-eventu-white-surface px-4 text-sm font-semibold text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';
const botonCancelarFila =
    'inline-flex h-11 items-center justify-center gap-1.5 rounded-[0.4375rem] border border-eventu-institutional-red bg-eventu-white-surface px-4 text-sm font-semibold text-eventu-institutional-red hover:bg-eventu-soft-red-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';

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

    return (
        <main className="mx-auto w-full max-w-[70rem] px-4 py-8 sm:px-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-[1.375rem] font-semibold text-eventu-main-ink">Mis eventos</h1>
                    <p className="mt-1 text-sm text-eventu-secondary-text">Eventos publicados que puedes gestionar.</p>
                </div>
                <Link to="/organizador/eventos/nuevo" className={botonPrimario}>
                    <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Crear evento
                </Link>
            </header>

            {mensajeExito && (
                <p role="status" className="mb-4 flex items-start gap-2 rounded-md bg-eventu-green-background px-4 py-3 text-sm text-eventu-success">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{mensajeExito}</span>
                </p>
            )}
            {error && (
                <p role="alert" className="mb-4 flex items-start gap-2 text-sm text-eventu-error">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                </p>
            )}
            {cargando && <p className="text-sm text-eventu-secondary-text">Cargando…</p>}
            {!cargando && !error && eventos.length === 0 && (
                <div className="flex flex-col items-center rounded-lg border border-dashed border-eventu-border bg-eventu-white-surface px-6 py-10 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-eventu-soft-red-background text-eventu-institutional-red">
                        <CalendarPlus className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm text-eventu-secondary-text">Aún no tienes eventos publicados.</p>
                </div>
            )}

            {eventos.length > 0 && (
                <ul className="space-y-3">
                    {eventos.map((evento) => (
                        <li
                            key={evento.id}
                            className="flex flex-col gap-3 rounded-lg border border-eventu-border bg-eventu-white-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0 break-words">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <h2 className="text-base font-semibold text-eventu-main-ink">{evento.titulo}</h2>
                                    <span
                                        className={
                                            estaCancelado(evento)
                                                ? 'inline-block rounded bg-[#ededeb] px-3 py-1 text-xs font-medium text-eventu-secondary-text'
                                                : 'inline-block rounded bg-eventu-green-background px-3 py-1 text-xs font-medium text-eventu-success'
                                        }
                                    >
                                        <span className="sr-only">Estado: </span>
                                        {estaCancelado(evento) ? 'Cancelado' : 'Publicado'}
                                    </span>
                                </div>
                                <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-eventu-secondary-text">
                                    <li className="inline-flex items-center gap-1.5">
                                        <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {formatoFecha.format(new Date(evento.fechaInicio))}
                                    </li>
                                    <li className="inline-flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {evento.ubicacion}
                                    </li>
                                    {evento.categoriaNombre && (
                                        <li className="inline-flex items-center gap-1.5">
                                            <Tag className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            {evento.categoriaNombre}
                                        </li>
                                    )}
                                    <li className="inline-flex items-center gap-1.5">
                                        <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        Cupos: {evento.cuposDisponibles} disponibles de {evento.cuposMaximos}
                                    </li>
                                </ul>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
                                <Link
                                    to={`/organizador/eventos/${evento.id}/editar`}
                                    className={botonFila}
                                    aria-label={`Editar evento ${evento.titulo}`}
                                >
                                    <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    Editar
                                </Link>
                                {!estaCancelado(evento) && (
                                    <button
                                        type="button"
                                        className={botonCancelarFila}
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
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-700">
                            !
                        </span>
                    }
                >
                    <h3 className="break-words text-sm font-medium text-eventu-main-ink">{aCancelar.titulo}</h3>
                    <p className="mt-2 text-sm text-eventu-secondary-text">
                        Se notificará por correo a los {aCancelar.cuposMaximos - aCancelar.cuposDisponibles} usuarios inscritos, sus inscripciones
                        pasaran a ser canceladas y ya no se podrán realizar nuevas inscripciones. Esta acciónn no elimina el registro histórico del evento.
                    </p>
                    {errorCancelar && (
                        <p role="alert" className="mt-3 text-sm text-eventu-error">
                            {errorCancelar}
                        </p>
                    )}
                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button type="button" className={botonSecundario} onClick={cerrarModalCancelar} disabled={cancelando}>
                            Volver
                        </button>
                        <button
                            type="button"
                            className={botonPrimario}
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
