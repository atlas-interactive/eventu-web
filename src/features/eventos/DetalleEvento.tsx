import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
    CalendarDays,
    CalendarPlus,
    Check,
    Clock3,
    MapPin,
    Users,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { guardarArchivo } from '../../api/descargas';
import { mensajeDeError } from '../../api/mensajeDeError';
import { ModalAccesible } from '../../components/ui/ModalAccesible';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { ConfirmarCancelacionInscripcion } from '../inscripciones/components/ConfirmarCancelacionInscripcion';
import { EntradaQr } from '../inscripciones/components/EntradaQr';
import type { Evento } from '../../types/evento';
import type { Inscripcion } from '../../types/inscripcion';
import { esAdministrador, esOrganizador, esUsuario, obtenerSesion } from '../sesion/sesion';
import { useInscripcionEvento } from '../../hooks/eventos/useInscripcionEvento';
import { ConfirmacionInscripcion } from './components/ConfirmacionInscripcion';
import { obtenerEvento } from './services/eventoService';
import '../../styles/event-detail.css';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' });
const formatoHora = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' });
const formatoDia = new Intl.DateTimeFormat('es-CO', { weekday: 'short' });
const formatoMes = new Intl.DateTimeFormat('es-CO', { month: 'short' });

const estaCancelado = (evento: Evento) => evento.estado.toUpperCase() === 'CANCELADO';

const escaparTextoIcs = (texto: string) =>
    texto.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

const descargarCalendario = (evento: Evento) => {
    const fechaInicio = new Date(evento.fechaInicio);
    if (Number.isNaN(fechaInicio.getTime())) {
        throw new Error('La fecha del evento no es válida para crear el calendario.');
    }

    const inicioUtc = fechaInicio.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const contenido = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//EventU//Eventos//ES',
        'BEGIN:VEVENT',
        `UID:eventu-event-${evento.id}@eventu`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
        `DTSTART:${inicioUtc}`,
        `SUMMARY:${escaparTextoIcs(evento.titulo)}`,
        `LOCATION:${escaparTextoIcs(evento.ubicacion)}`,
        `DESCRIPTION:${escaparTextoIcs(evento.descripcion)}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');

    guardarArchivo(
        new Blob([contenido], { type: 'text/calendar;charset=utf-8' }),
        `evento-${evento.id}.ics`,
    );
};

export function DetalleEvento() {
    const { id } = useParams();
    const idEvento = Number(id);
    const sesion = obtenerSesion();
    const puedeConsultarInscripcion = esUsuario(sesion) || esOrganizador(sesion);
    const inscripcion = useInscripcionEvento(
        idEvento,
        puedeConsultarInscripcion && Number.isSafeInteger(idEvento) && idEvento > 0,
    );
    const [resultadoEvento, setResultadoEvento] = useState<{
        id: number;
        evento: Evento | null;
        error: string;
        noEncontrado: boolean;
    } | null>(null);
    const identificadorValido = Number.isSafeInteger(idEvento) && idEvento > 0;
    const resultadoActual = resultadoEvento?.id === idEvento ? resultadoEvento : null;
    const evento = resultadoActual?.evento ?? null;
    const error = resultadoActual?.error ?? '';
    const noEncontrado = !identificadorValido || Boolean(resultadoActual?.noEncontrado);
    const cargando = identificadorValido && !resultadoActual;
    const [aCancelar, setACancelar] = useState<Inscripcion | null>(null);
    const [errorCalendario, setErrorCalendario] = useState('');
    const [entradaAbierta, setEntradaAbierta] = useState(false);

    useEffect(() => {
        let vigente = true;
        if (!identificadorValido) {
            return () => {
                vigente = false;
            };
        }

        obtenerEvento(idEvento)
            .then((datos) => {
                if (vigente) {
                    setResultadoEvento({ id: idEvento, evento: datos, error: '', noEncontrado: false });
                }
            })
            .catch((err: unknown) => {
                console.error('No se pudo cargar el detalle del evento:', err);
                if (!vigente) return;
                if (isAxiosError(err) && err.response?.status === 404) {
                    setResultadoEvento({ id: idEvento, evento: null, error: '', noEncontrado: true });
                } else {
                    setResultadoEvento({
                        id: idEvento,
                        evento: null,
                        error: mensajeDeError(err),
                        noEncontrado: false,
                    });
                }
            });

        return () => {
            vigente = false;
        };
    }, [idEvento, identificadorValido]);

    if (cargando) {
        return (
            <main className="detalle-evento-page">
                <SkeletonEstado etiqueta="Cargando detalle del evento" className="detalle-evento-skeleton">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-6 h-32 w-full rounded-xl" />
                    <Skeleton className="mt-5 h-8 w-2/3" />
                    <Skeleton className="mt-5 h-20 w-full" />
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
    const esPropio = evento.organizadorId === sesion?.usuarioId;
    const puedeInscribirse = esUsuario(sesion) || esOrganizador(sesion);
    const noPublicado = evento.estado.toUpperCase() !== 'PUBLICADO';
    const codigoQr = inscripcion.inscripcionActiva?.codigoQr;

    const inscribirse = async () => {
        const realizada = await inscripcion.inscribir(evento);
        if (realizada) {
            setResultadoEvento((actual) =>
                actual?.id === idEvento && actual.evento
                    ? {
                        ...actual,
                        evento: {
                            ...actual.evento,
                            cuposDisponibles: Math.max(0, actual.evento.cuposDisponibles - 1),
                        },
                    }
                    : actual,
            );
        }
    };

    const confirmarCancelacion = async () => {
        const cancelada = await inscripcion.cancelarInscripcionActiva();
        if (cancelada) {
            setACancelar(null);
            setResultadoEvento((actual) =>
                actual?.id === idEvento && actual.evento
                    ? {
                        ...actual,
                        evento: {
                            ...actual.evento,
                            cuposDisponibles: Math.min(
                                actual.evento.cuposMaximos,
                                actual.evento.cuposDisponibles + 1,
                            ),
                        },
                    }
                    : actual,
            );
        }
    };

    const crearArchivoCalendario = () => {
        try {
            descargarCalendario(evento);
            setErrorCalendario('');
        } catch (err: unknown) {
            console.error('No se pudo crear el archivo de calendario:', err);
            setErrorCalendario('No se pudo preparar el archivo de calendario.');
        }
    };

    return (
        <main className={`detalle-evento-page${inscripcion.yaInscrito ? ' detalle-evento-page--inscrito' : ''}`}>
            <Link to="/eventos" className="detalle-evento-volver">
                ← Volver a eventos
            </Link>
            {inscripcion.inscripcionRealizada && <ConfirmacionInscripcion evento={evento} />}

            <div className="detalle-evento-layout">
                <article className="detalle-evento-contenido">
                    <div className="detalle-evento-hero" aria-hidden="true">
                        <div className="detalle-evento-fecha">
                            <span>{formatoDia.format(fechaInicio).replace('.', '').toUpperCase()}</span>
                            <strong>{fechaInicio.getDate()}</strong>
                            <span>{formatoMes.format(fechaInicio).replace('.', '').toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="detalle-evento-etiquetas">
                        <span className="detalle-evento-categoria">{evento.categoriaNombre}</span>
                        {cancelado && (
                            <span className="detalle-evento-estado detalle-evento-estado--cancelado">
                                Evento cancelado
                            </span>
                        )}
                        {agotado && !cancelado && (
                            <span className="detalle-evento-estado detalle-evento-estado--agotado">
                                Cupos agotados
                            </span>
                        )}
                    </div>
                    <h1 className="detalle-evento-titulo">{evento.titulo}</h1>

                    <section className="detalle-evento-informacion" aria-label="Información del evento">
                        <div className="detalle-evento-info-card">
                            <span className="detalle-evento-info-icono"><CalendarDays aria-hidden="true" /></span>
                            <span><small>Fecha</small><strong>{formatoFecha.format(fechaInicio)}</strong></span>
                        </div>
                        <div className="detalle-evento-info-card">
                            <span className="detalle-evento-info-icono"><Clock3 aria-hidden="true" /></span>
                            <span><small>Hora</small><strong>{formatoHora.format(fechaInicio)}</strong></span>
                        </div>
                        <div className="detalle-evento-info-card">
                            <span className="detalle-evento-info-icono"><MapPin aria-hidden="true" /></span>
                            <span><small>Lugar</small><strong>{evento.ubicacion}</strong></span>
                        </div>
                        <div className="detalle-evento-info-card">
                            <span className="detalle-evento-info-icono"><Users aria-hidden="true" /></span>
                            <span>
                                <small>Cupos</small>
                                <strong>{evento.cuposDisponibles} de {evento.cuposMaximos} disponibles</strong>
                            </span>
                        </div>
                    </section>

                    <section className="detalle-evento-sobre">
                        <h2>Sobre el evento</h2>
                        <p>{evento.descripcion}</p>
                    </section>

                    <div className="detalle-evento-organiza">
                        <span className="detalle-evento-organiza-avatar" aria-hidden="true">
                            {evento.organizadorNombre.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()}
                        </span>
                        <div><small>Organiza</small><strong>{evento.organizadorNombre}</strong></div>
                    </div>
                </article>

                <aside
                    className={`detalle-evento-panel${inscripcion.yaInscrito ? ' detalle-evento-panel--entrada' : ''}`}
                    id="entrada-evento"
                    aria-label={inscripcion.yaInscrito ? 'Tu entrada al evento' : 'Inscripción al evento'}
                >
                    {inscripcion.yaInscrito ? (
                        <>
                            <div className="detalle-evento-inscrito">
                                <Check aria-hidden="true" />
                                Estás inscrito
                            </div>
                            <div className="detalle-evento-panel-contenido">
                                <h2>Tu entrada</h2>
                                {codigoQr ? (
                                    <EntradaQr codigo={codigoQr} nombreArchivo={`entrada-evento-${evento.id}.svg`} />
                                ) : (
                                    <p className="detalle-evento-qr-no-disponible" role="status">
                                        No hay un código QR disponible para esta inscripción.
                                    </p>
                                )}
                                <button
                                    type="button"
                                    className="detalle-evento-calendario"
                                    onClick={crearArchivoCalendario}
                                >
                                    <CalendarPlus aria-hidden="true" />
                                    Añadir al calendario
                                </button>
                                {errorCalendario && <p className="detalle-evento-error" role="alert">{errorCalendario}</p>}
                                <p className="detalle-evento-qr-ayuda">
                                    La validación de la entrada se realiza desde la aplicación móvil.
                                </p>
                            </div>
                            <div className="detalle-evento-panel-ocupacion">
                                <div><span>Cupos ocupados</span><strong>{inscritos} / {evento.cuposMaximos}</strong></div>
                                <div className="detalle-evento-cupos" role="meter" aria-label="Cupos ocupados" aria-valuemin={0} aria-valuemax={evento.cuposMaximos} aria-valuenow={inscritos}>
                                    <span style={{ width: `${porcentajeOcupado}%` }} />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="detalle-evento-cancelar-inscripcion"
                                onClick={() => setACancelar(inscripcion.inscripcionActiva)}
                            >
                                Cancelar mi inscripción
                            </button>
                        </>
                    ) : (
                        <div className="detalle-evento-panel-contenido">
                            {cancelado ? (
                                <p className="detalle-evento-panel-estado">Evento cancelado</p>
                            ) : agotado ? (
                                <p className="detalle-evento-panel-estado">Cupos agotados</p>
                            ) : noPublicado ? (
                                <p className="detalle-evento-panel-estado">
                                    No se permiten inscripciones en eventos que no estén publicados.
                                </p>
                            ) : esPropio ? (
                                <p className="detalle-evento-panel-estado">
                                    No puedes inscribirte en un evento que tú organizas.
                                </p>
                            ) : !puedeInscribirse ? (
                                <p className="detalle-evento-panel-estado">
                                    {esAdministrador(sesion)
                                        ? 'Los administradores no pueden inscribirse en eventos.'
                                        : 'Debes iniciar sesión para inscribirte.'}
                                </p>
                            ) : inscripcion.verificando ? (
                                <button type="button" className="detalle-evento-inscripcion" disabled aria-busy="true">
                                    Verificando inscripción…
                                </button>
                            ) : inscripcion.errorVerificacion ? (
                                <button
                                    type="button"
                                    className="detalle-evento-inscripcion"
                                    onClick={inscripcion.reintentarVerificacion}
                                >
                                    Reintentar verificación
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="detalle-evento-inscripcion"
                                    disabled={inscripcion.inscribiendo || inscripcion.verificando}
                                    aria-busy={inscripcion.inscribiendo}
                                    onClick={inscribirse}
                                >
                                    {inscripcion.inscribiendo ? 'Inscribiendo…' : 'Inscribirme al evento'}
                                </button>
                            )}
                            {inscripcion.errorVerificacion && (
                                <p role="alert" className="detalle-evento-error">
                                    No se pudo verificar si ya estás inscrito: {inscripcion.errorVerificacion}
                                </p>
                            )}
                            {inscripcion.error && <p role="alert" className="detalle-evento-error">{inscripcion.error}</p>}
                            <div className="detalle-evento-panel-categoria">
                                <span>Categoría</span>
                                <span className="detalle-evento-categoria">{evento.categoriaNombre}</span>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {inscripcion.yaInscrito && (
                <div className="detalle-evento-entrada-movil">
                    <span><Check aria-hidden="true" /> Estás inscrito</span>
                    <button type="button" onClick={() => setEntradaAbierta(true)}>
                        Ver mi entrada
                    </button>
                </div>
            )}

            {entradaAbierta && inscripcion.yaInscrito && (
                <ModalAccesible
                    titulo="Tu entrada"
                    idTitulo="titulo-entrada-evento"
                    onCerrar={() => setEntradaAbierta(false)}
                >
                    {codigoQr ? (
                        <EntradaQr codigo={codigoQr} nombreArchivo={`entrada-evento-${evento.id}.svg`} />
                    ) : (
                        <p className="detalle-evento-qr-no-disponible" role="status">
                            No hay un código QR disponible para esta inscripción.
                        </p>
                    )}
                    <button
                        type="button"
                        className="detalle-evento-calendario"
                        onClick={crearArchivoCalendario}
                    >
                        <CalendarPlus aria-hidden="true" />
                        Añadir al calendario
                    </button>
                    {errorCalendario && (
                        <p className="detalle-evento-error" role="alert">{errorCalendario}</p>
                    )}
                    <p className="detalle-evento-qr-ayuda">
                        La validación de la entrada se realiza desde la aplicación móvil.
                    </p>
                    <button
                        type="button"
                        className="detalle-evento-modal-cerrar"
                        onClick={() => setEntradaAbierta(false)}
                    >
                        Cerrar
                    </button>
                </ModalAccesible>
            )}

            {aCancelar && (
                <ConfirmarCancelacionInscripcion
                    inscripcion={aCancelar}
                    cancelando={inscripcion.cancelando}
                    error={inscripcion.errorCancelacion}
                    onCerrar={() => setACancelar(null)}
                    onConfirmar={confirmarCancelacion}
                />
            )}
        </main>
    );
}
