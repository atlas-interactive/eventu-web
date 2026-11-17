import { EnlaceVolver } from '../../components/ui/EnlaceVolver';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
    CalendarDays,
    CalendarPlus,
    Check,
    Clock3,
    Download,
    MapPin,
    Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { guardarArchivo } from '../../api/descargas';
import { mensajeDeError } from '../../api/mensajeDeError';
import { ModalAccesible } from '../../components/ui/ModalAccesible';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { ConfirmarCancelacionInscripcion } from '../inscripciones/components/ConfirmarCancelacionInscripcion';
import { EntradaQr } from '../inscripciones/components/EntradaQr';
import { descargarCertificadoEvento } from '../inscripciones/services/inscripcionService';
import type { Evento } from '../../types/evento';
import type { Inscripcion } from '../../types/inscripcion';
import { esAdministrador, esOrganizador, esUsuario, obtenerSesion } from '../sesion/sesion';
import { useInscripcionEvento } from '../../hooks/eventos/useInscripcionEvento';
import { useAhoraBogota } from '../../hooks/eventos/useAhoraBogota';
import { ConfirmacionInscripcion } from './components/ConfirmacionInscripcion';
import { eventoYaIniciado, obtenerEstadoTemporalEvento } from './estadoTemporalEvento';
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
    const { t } = useTranslation();
    const { id } = useParams();
    const idEvento = Number(id);
    const ahora = useAhoraBogota();
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
    useDocumentTitle(`${evento?.titulo || t('titulos.detalleEvento')} | EventU`);
    const error = resultadoActual?.error ?? '';
    const noEncontrado = !identificadorValido || Boolean(resultadoActual?.noEncontrado);
    const cargando = identificadorValido && !resultadoActual;
    const [aCancelar, setACancelar] = useState<Inscripcion | null>(null);
    const [errorCalendario, setErrorCalendario] = useState('');
    const [entradaAbierta, setEntradaAbierta] = useState(false);
    const [descargandoCertificado, setDescargandoCertificado] = useState(false);
    const [errorCertificado, setErrorCertificado] = useState('');

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
                <SkeletonEstado etiqueta={t('detalle.cargando')} className="detalle-evento-skeleton">
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
                <EnlaceVolver to="/eventos">
                    {t('detalle.volver')}
                </EnlaceVolver>
                <p role="alert" className="detalle-evento-error">
                    {noEncontrado ? t('detalle.noEncontrado') : error || t('detalle.errorCarga')}
                </p>
            </main>
        );
    }

    const cancelado = estaCancelado(evento);
    const estadoTemporal = evento.estado.toUpperCase() === 'PUBLICADO'
        ? obtenerEstadoTemporalEvento(evento.fechaInicio, ahora)
        : null;
    const fechaInicioAlcanzada = eventoYaIniciado(evento.fechaInicio, ahora);
    const eventoIniciado = estadoTemporal === 'EN_CURSO' || estadoTemporal === 'FINALIZADO';
    const qrDisponible = estadoTemporal === 'FUTURO' || estadoTemporal === 'EN_CURSO';
    const agotado = evento.cuposDisponibles <= 0;
    const inscritos = Math.min(evento.cuposMaximos, Math.max(0, evento.cuposMaximos - evento.cuposDisponibles));
    const porcentajeOcupado =
        evento.cuposMaximos > 0 ? Math.min(100, (inscritos / evento.cuposMaximos) * 100) : 0;
    const fechaInicio = new Date(evento.fechaInicio);
    const esPropio = evento.organizadorId === sesion?.usuarioId;
    const puedeInscribirse = esUsuario(sesion) || esOrganizador(sesion);
    const noPublicado = evento.estado.toUpperCase() !== 'PUBLICADO';
    const codigoQr = inscripcion.inscripcionActiva?.codigoQr;
    const puedeDescargarCertificado =
        puedeConsultarInscripcion &&
        evento.certificable &&
        fechaInicioAlcanzada &&
        inscripcion.yaInscrito;

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
            setErrorCalendario(t('detalle.errorCalendario'));
        }
    };

    const descargarCertificado = async () => {
        if (!puedeDescargarCertificado || descargandoCertificado) return;
        setDescargandoCertificado(true);
        setErrorCertificado('');
        try {
            const pdf = await descargarCertificadoEvento(evento.id);
            guardarArchivo(pdf, `certificado-evento-${evento.id}.pdf`);
        } catch (err: unknown) {
            console.error('No se pudo descargar el certificado del evento:', err);
            setErrorCertificado(mensajeDeError(err));
        } finally {
            setDescargandoCertificado(false);
        }
    };

    return (
        <main className={`detalle-evento-page${inscripcion.yaInscrito ? ' detalle-evento-page--inscrito' : ''}`}>
            <EnlaceVolver to="/eventos">
                {t('detalle.volver')}
            </EnlaceVolver>
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
                        {evento.certificable && (
                            <span className="detalle-evento-estado detalle-evento-estado--certificable">
                                {t('detalle.certificable')}
                            </span>
                        )}
                        {cancelado && (
                            <span className="detalle-evento-estado detalle-evento-estado--cancelado">
                                {t('detalle.cancelado')}
                            </span>
                        )}
                        {estadoTemporal === 'EN_CURSO' && !cancelado && (
                            <span className="detalle-evento-estado detalle-evento-estado--en-curso">
                                {t('detalle.enCurso')}
                            </span>
                        )}
                        {estadoTemporal === 'FINALIZADO' && !cancelado && (
                            <span className="detalle-evento-estado detalle-evento-estado--finalizado">
                                {t('detalle.finalizado')}
                            </span>
                        )}
                        {agotado && !cancelado && !eventoIniciado && (
                            <span className="detalle-evento-estado detalle-evento-estado--agotado">
                                {t('detalle.agotado')}
                            </span>
                        )}
                    </div>
                    <h1 className="detalle-evento-titulo">{evento.titulo}</h1>

                    <section className="detalle-evento-informacion" aria-label={t('detalle.infoAria')}>
                        <div className="detalle-evento-info-card">
                            <span className="detalle-evento-info-icono"><CalendarDays aria-hidden="true" /></span>
                            <span><small>{t('detalle.fecha')}</small><strong>{formatoFecha.format(fechaInicio)}</strong></span>
                        </div>
                        <div className="detalle-evento-info-card">
                            <span className="detalle-evento-info-icono"><Clock3 aria-hidden="true" /></span>
                            <span><small>{t('detalle.hora')}</small><strong>{formatoHora.format(fechaInicio)}</strong></span>
                        </div>
                        <div className="detalle-evento-info-card">
                            <span className="detalle-evento-info-icono"><MapPin aria-hidden="true" /></span>
                            <span><small>{t('detalle.lugar')}</small><strong>{evento.ubicacion}</strong></span>
                        </div>
                        <div className="detalle-evento-info-card">
                            <span className="detalle-evento-info-icono"><Users aria-hidden="true" /></span>
                            <span>
                                <small>{t('detalle.cupos')}</small>
                                <strong>{t('detalle.disponibles', { disponibles: evento.cuposDisponibles, maximos: evento.cuposMaximos })}</strong>
                            </span>
                        </div>
                    </section>

                    <section className="detalle-evento-sobre">
                        <h2>{t('detalle.sobre')}</h2>
                        <p>{evento.descripcion}</p>
                    </section>

                    <div className="detalle-evento-organiza">
                        <span className="detalle-evento-organiza-avatar" aria-hidden="true">
                            {evento.organizadorNombre.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()}
                        </span>
                        <div><small>{t('detalle.organiza')}</small><strong>{evento.organizadorNombre}</strong></div>
                    </div>
                </article>

                <aside
                    className={`detalle-evento-panel${inscripcion.yaInscrito ? ' detalle-evento-panel--entrada' : ''}`}
                    id="entrada-evento"
                    aria-label={inscripcion.yaInscrito ? t('detalle.panelInscritoAria') : t('detalle.panelInscripcionAria')}
                >
                    {inscripcion.yaInscrito ? (
                        <>
                            <div
                                className={`detalle-evento-inscrito${estadoTemporal === 'FINALIZADO' ? ' detalle-evento-inscrito--finalizado' : ''}`}
                            >
                                {estadoTemporal !== 'FINALIZADO' && <Check aria-hidden="true" />}
                                {estadoTemporal === 'FINALIZADO' ? t('detalle.finalizado') : t('detalle.estasInscrito')}
                            </div>
                            {qrDisponible && (
                                <>
                                    <div className="detalle-evento-panel-contenido">
                                        <h2>{t('detalle.tuEntrada')}</h2>
                                        {codigoQr ? (
                                            <EntradaQr codigo={codigoQr} nombreArchivo={`entrada-evento-${evento.id}.svg`} />
                                        ) : (
                                            <p className="detalle-evento-qr-no-disponible" role="status">
                                                {t('detalle.qrNoDisponible')}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            className="detalle-evento-calendario"
                                            onClick={crearArchivoCalendario}
                                        >
                                            <CalendarPlus aria-hidden="true" />
                                            {t('detalle.anadirCalendario')}
                                        </button>
                                        {errorCalendario && <p className="detalle-evento-error" role="alert">{errorCalendario}</p>}
                                        <p className="detalle-evento-qr-ayuda">
                                            {t('detalle.ayudaQr')}
                                        </p>
                                    </div>
                                    <div className="detalle-evento-panel-ocupacion">
                                        <div><span>{t('detalle.cuposOcupados')}</span><strong>{inscritos} / {evento.cuposMaximos}</strong></div>
                                        <div className="detalle-evento-cupos" role="meter" aria-label={t('detalle.cuposOcupados')} aria-valuemin={0} aria-valuemax={evento.cuposMaximos} aria-valuenow={inscritos}>
                                            <span style={{ width: `${porcentajeOcupado}%` }} />
                                        </div>
                                    </div>
                                    {!eventoIniciado && (
                                        <button
                                            type="button"
                                            className="detalle-evento-cancelar-inscripcion"
                                            onClick={() => setACancelar(inscripcion.inscripcionActiva)}
                                        >
                                            {t('detalle.cancelarInscripcion')}
                                        </button>
                                    )}
                                </>
                            )}
                            {puedeDescargarCertificado && (
                                <div className="detalle-evento-certificado">
                                    <button
                                        type="button"
                                        className="detalle-evento-calendario"
                                        onClick={descargarCertificado}
                                        disabled={descargandoCertificado}
                                        aria-busy={descargandoCertificado}
                                    >
                                        <Download aria-hidden="true" />
                                        {descargandoCertificado ? t('detalle.generandoCertificado') : t('detalle.descargarCertificado')}
                                    </button>
                                    {errorCertificado && (
                                        <p role="alert" className="detalle-evento-error">
                                            {errorCertificado}
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="detalle-evento-panel-contenido">
                            {cancelado ? (
                                <p className="detalle-evento-panel-estado">{t('detalle.cancelado')}</p>
                            ) : eventoIniciado ? (
                                <p className="detalle-evento-panel-estado">
                                    {t('detalle.eventoIniciado')}
                                </p>
                            ) : agotado ? (
                                <p className="detalle-evento-panel-estado">{t('detalle.agotado')}</p>
                            ) : noPublicado ? (
                                <p className="detalle-evento-panel-estado">
                                    {t('detalle.noPublicado')}
                                </p>
                            ) : esPropio ? (
                                <p className="detalle-evento-panel-estado">
                                    {t('detalle.eventoPropio')}
                                </p>
                            ) : !puedeInscribirse ? (
                                <p className="detalle-evento-panel-estado">
                                    {esAdministrador(sesion)
                                        ? t('detalle.adminNoInscribe')
                                        : t('detalle.debeIniciarSesion')}
                                </p>
                            ) : inscripcion.verificando ? (
                                <button type="button" className="detalle-evento-inscripcion" disabled aria-busy="true">
                                    {t('detalle.verificando')}
                                </button>
                            ) : inscripcion.errorVerificacion ? (
                                <button
                                    type="button"
                                    className="detalle-evento-inscripcion"
                                    onClick={inscripcion.reintentarVerificacion}
                                >
                                    {t('detalle.reintentarVerificacion')}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="detalle-evento-inscripcion"
                                    disabled={inscripcion.inscribiendo || inscripcion.verificando}
                                    aria-busy={inscripcion.inscribiendo}
                                    onClick={inscribirse}
                                >
                                    {inscripcion.inscribiendo ? t('detalle.inscribiendo') : t('detalle.inscribirme')}
                                </button>
                            )}
                            {inscripcion.errorVerificacion && (
                                <p role="alert" className="detalle-evento-error">
                                    {t('detalle.errorVerificacion', { error: inscripcion.errorVerificacion })}
                                </p>
                            )}
                            {inscripcion.error && <p role="alert" className="detalle-evento-error">{inscripcion.error}</p>}
                            <div className="detalle-evento-panel-categoria">
                                <span>{t('detalle.categoria')}</span>
                                <span className="detalle-evento-categoria">{evento.categoriaNombre}</span>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {inscripcion.yaInscrito && (
                <div className="detalle-evento-entrada-movil">
                    <span
                        className={estadoTemporal === 'FINALIZADO' ? 'detalle-evento-entrada-movil-estado--finalizado' : undefined}
                    >
                        {estadoTemporal !== 'FINALIZADO' && <Check aria-hidden="true" />}
                        {estadoTemporal === 'FINALIZADO' ? t('detalle.finalizado') : t('detalle.estasInscrito')}
                    </span>
                    {qrDisponible && (
                        <button type="button" onClick={() => setEntradaAbierta(true)}>
                            {t('detalle.verMiEntrada')}
                        </button>
                    )}
                </div>
            )}

            {entradaAbierta && inscripcion.yaInscrito && qrDisponible && (
                <ModalAccesible
                    titulo={t('detalle.tuEntrada')}
                    idTitulo="titulo-entrada-evento"
                    onCerrar={() => setEntradaAbierta(false)}
                >
                    {codigoQr ? (
                        <EntradaQr codigo={codigoQr} nombreArchivo={`entrada-evento-${evento.id}.svg`} />
                    ) : (
                        <p className="detalle-evento-qr-no-disponible" role="status">
                            {t('detalle.qrNoDisponible')}
                        </p>
                    )}
                    <button
                        type="button"
                        className="detalle-evento-calendario"
                        onClick={crearArchivoCalendario}
                    >
                        <CalendarPlus aria-hidden="true" />
                        {t('detalle.anadirCalendario')}
                    </button>
                    {errorCalendario && (
                        <p className="detalle-evento-error" role="alert">{errorCalendario}</p>
                    )}
                    <p className="detalle-evento-qr-ayuda">
                        {t('detalle.ayudaQr')}
                    </p>
                    <button
                        type="button"
                        className="detalle-evento-modal-cerrar"
                        onClick={() => setEntradaAbierta(false)}
                    >
                        {t('detalle.cerrar')}
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
